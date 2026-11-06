import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { starterContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { slugify, withSlugs } from "@/lib/slug";
import {
  jsonLdString,
  projectPageData,
  servicePageData,
  structuredData,
} from "@/lib/structured-data";

// Hors de Next.js, le cache "use cache" n'existe pas : on sert directement le contenu de départ
vi.mock("@/lib/content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content")>();
  return { ...actual, getSiteContent: async () => actual.starterContent() };
});

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
    const data = structuredData(starterContent(), "https://ange-carmelle.dev");
    const [person, service] = data["@graph"];
    expect(person["@type"]).toBe("Person");
    expect(person.image).toBe("https://ange-carmelle.dev/images/photo-profil.jpeg");
    expect(person.sameAs).toContain("https://github.com/carmelle1707");
    expect(service["@type"]).toBe("ProfessionalService");
    expect(service.founder).toEqual({ "@id": person["@id"] });
    expect(service.description).not.toContain("*");
    expect(service.hasOfferCatalog?.itemListElement.length).toBeGreaterThan(0);
    expect(service.telephone).toMatch(/^\+225\d+$/);
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

  it("le JSON-LD ne peut pas fermer la balise <script>", () => {
    expect(jsonLdString({ t: "</script><script>alert(1)</script>" })).not.toContain("</script>");
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
