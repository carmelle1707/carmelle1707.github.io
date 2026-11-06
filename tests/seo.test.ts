import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { starterContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { slugify, withSlugs } from "@/lib/slug";
import {
  jsonLdString,
  nameVariants,
  projectPageData,
  servicePageData,
  structuredData,
} from "@/lib/structured-data";

// Hors de Next.js, le cache "use cache" n'existe pas : on sert directement le contenu de départ
vi.mock("@/lib/content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content")>();
  return { ...actual, getSiteContent: async () => actual.starterContent() };
});

/** Nœuds du JSON-LD de l'accueil, typés simplement pour les assertions. */
const homeGraph = () =>
  structuredData(starterContent(), "https://ange-carmelle.dev")["@graph"] as Record<
    string,
    unknown
  >[];

const URL_ENV = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = URL_ENV;
});

describe("SEO", () => {
  it("siteUrl retire le / final", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ange-carmelle.dev/";
    expect(siteUrl()).toBe("https://ange-carmelle.dev");
  });

  it("robots exclut l'admin et l'API, et pointe vers le sitemap", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ange-carmelle.dev";
    const r = robots();
    expect(r.rules).toMatchObject({ allow: "/", disallow: ["/admin", "/api"] });
    expect(r.sitemap).toBe("https://ange-carmelle.dev/sitemap.xml");
  });

  it("le sitemap liste l'accueil, chaque offre et chaque projet", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ange-carmelle.dev";
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls[0]).toBe("https://ange-carmelle.dev/");
    expect(urls).toContain("https://ange-carmelle.dev/services/site-vitrine");
    expect(urls).toContain("https://ange-carmelle.dev/services/application-mobile");
    expect(urls).toContain("https://ange-carmelle.dev/projets/flot-mom-global-reporting");
    expect(urls).toContain("https://ange-carmelle.dev/projets/cinescope");
    expect(urls).toHaveLength(1 + 3 + 4);
  });

  it("JSON-LD : Person et ProfessionalService reliés, URLs absolues, services listés", () => {
    const graph = homeGraph();
    const person = graph.find((n) => n["@type"] === "Person");
    const service = graph.find((n) => n["@type"] === "ProfessionalService");
    expect(person).toMatchObject({
      image: "https://ange-carmelle.dev/images/photo-profil.jpeg",
      sameAs: expect.arrayContaining(["https://github.com/carmelle1707"]),
    });
    expect(service).toMatchObject({
      founder: { "@id": person?.["@id"] },
      telephone: expect.stringMatching(/^\+225\d+$/),
      hasOfferCatalog: { itemListElement: expect.arrayContaining([expect.anything()]) },
    });
    expect(String(service?.description)).not.toContain("*");
  });

  it("JSON-LD des pages d'offre et de projet : reliés à la personne, avec fil d'Ariane", () => {
    const c = starterContent();
    const url = "https://ange-carmelle.dev";
    const [service, crumbs] = servicePageData(c, c.services[0], url, "/services/site-vitrine")[
      "@graph"
    ];
    expect(service).toMatchObject({
      "@type": "Service",
      name: "Site vitrine à Abidjan",
      provider: { "@id": `${url}/#personne` },
    });
    expect(crumbs).toMatchObject({ "@type": "BreadcrumbList" });
    const [project] = projectPageData(c, c.projects[1], url, "/projets/yowl")["@graph"];
    expect(project).toMatchObject({
      "@type": "CreativeWork",
      name: "YOWL",
      image: `${url}/images/yowl.png`,
    });
  });

  it("JSON-LD de l'accueil : la vidéo de présentation et les variantes du nom", () => {
    const graph = homeGraph();
    const person = graph.find((n) => n["@type"] === "Person");
    const video = graph.find((n) => n["@type"] === "VideoObject");
    expect(person).toMatchObject({
      alternateName: expect.arrayContaining(["Ange Carmelle", "Carmelle Gbedji"]),
    });
    expect(video).toMatchObject({
      contentUrl: "https://ange-carmelle.dev/videos/presentation-carre.mp4",
      duration: "PT60S",
      uploadDate: "2026-11-04",
      creator: { "@id": "https://ange-carmelle.dev/#personne" },
      thumbnailUrl: expect.arrayContaining([
        "https://ange-carmelle.dev/videos/presentation-carre.jpg",
      ]),
    });
  });

  it("le sitemap déclare la vidéo sur l'accueil", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://ange-carmelle.dev";
    const [home] = await sitemap();
    expect(home.videos?.[0]).toMatchObject({
      content_loc: "https://ange-carmelle.dev/videos/presentation-carre.mp4",
      thumbnail_loc: "https://ange-carmelle.dev/videos/presentation-carre.jpg",
      duration: 60,
    });
  });

  it("le JSON-LD ne peut pas fermer la balise <script>", () => {
    expect(jsonLdString({ t: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

describe("nameVariants", () => {
  it("donne les combinaisons courtes du nom, sans le nom complet ni doublon", () => {
    expect(nameVariants("Ange Carmelle Gbedji", "Ange Carmelle")).toEqual([
      "Ange Carmelle",
      "Carmelle Gbedji",
      "Ange Gbedji",
    ]);
    expect(nameVariants("Awa Koné")).toEqual([]);
  });
});

describe("slugs", () => {
  it("donne des adresses lisibles, sans accents ni ponctuation", () => {
    expect(slugify("Flot — MOM Global Reporting")).toBe("flot-mom-global-reporting");
    expect(slugify("CinéScope")).toBe("cinescope");
    expect(slugify("Application mobile")).toBe("application-mobile");
    expect(slugify("!!!")).toBe("page");
  });

  it("rend les slugs uniques en cas de titres identiques", () => {
    const items = withSlugs([{ t: "Site" }, { t: "Site" }, { t: "Autre" }], (i) => i.t);
    expect(items.map((i) => i.slug)).toEqual(["site", "site-2", "autre"]);
  });
});
