import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import admin from "./admin.json";
import { LAYERS, NAV, PROFILE, PROJECTS, WECODE_PHOTOS, buildContent, fromMain, layerOf, type AdminContent } from "./site";
import { DESCRIPTION, TITLE, headTags, robots, sitemap, structuredData } from "../seo";
import { ROUTES, matchRoute } from "./routes";

const publicFile = (path: string) => fileURLToPath(new URL(`../../public${path}`, import.meta.url));

describe("contenu de la V2, tiré de l'admin", () => {
  it("range chaque technologie dans la bonne couche", () => {
    expect(layerOf("MySQL")).toBe("donnees");
    expect(layerOf("Laravel")).toBe("serveur");
    expect(layerOf("Inertia.js")).toBe("api");
    expect(layerOf("API TMDB")).toBe("api");
    expect(layerOf("Tailwind CSS")).toBe("interface");
    expect(layerOf("JavaScript")).toBe("interface");
    expect(layerOf("React Native")).toBe("mobile");
    expect(layerOf("Express")).toBe("serveur");
    expect(layerOf("Figma")).toBeNull();
    // Un mot inconnu suit l'intitulé de son groupe dans l'admin.
    expect(layerOf("Ktor", "Back-end")).toBe("serveur");
  });

  it("ne compte pas deux fois la même technologie", () => {
    const iface = LAYERS.find((l) => l.id === "interface")!.tech.map((t) => t.toLowerCase());
    expect(iface.filter((t) => t.startsWith("tailwind"))).toHaveLength(1);
  });

  it("les projets n'utilisent que des couches qui existent, et leurs adresses sont uniques", () => {
    const ids = new Set(LAYERS.map((l) => l.id));
    for (const p of PROJECTS) for (const layer of p.layers) expect(ids.has(layer)).toBe(true);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  });

  it("un projet sans matière le dit au lieu d'inventer", () => {
    for (const p of PROJECTS) {
      if (!p.image || !p.role || p.stack.length === 0) expect(p.missing).toBeTruthy();
    }
  });

  it("un projet ajouté dans l'admin apparaît, avec ses couches", () => {
    const next = structuredClone(admin) as AdminContent;
    next.projects.push({
      slug: "ts-immo",
      title: "TS IMMO",
      tag: "Groupe Tasnim · Immobilier",
      desc: "Annonces immobilières.",
      role: "",
      stack: ["React Native", "NestJS", "PostgreSQL"],
      image: null as never,
      demoUrl: "",
      githubUrl: "",
    });
    const p = buildContent(next).projects.at(-1)!;
    expect(p.context).toBe("Groupe Tasnim");
    expect(p.layers).toEqual(["donnees", "serveur", "mobile"]);
    expect(p.missing).toContain("rôle");
    expect(p.missing).toContain("capture");
  });

  it("les fichiers envoyés depuis l'admin pointent vers le site Next.js", () => {
    expect(fromMain("/cv.pdf")).toBe("https://ange-carmelle-gbedji.vercel.app/cv.pdf");
    expect(fromMain("https://blob.example/x.pdf")).toBe("https://blob.example/x.pdf");
    expect(fromMain("")).toBeUndefined();
  });

  it("toutes les images locales référencées existent", () => {
    const files = [
      PROFILE.portrait.src,
      ...WECODE_PHOTOS.map((p) => p.src),
      ...PROJECTS.flatMap((p) => (p.image?.src.startsWith("/") ? [p.image.src] : [])),
      "/stills/tour.webp",
      "/stills/tour-sombre.webp",
      "/og.jpg",
      "/google219f85ddcb33b2e9.html",
      "/googleb9b3431307e4644b.html",
    ];
    for (const f of files) expect(existsSync(publicFile(f)), f).toBe(true);
  });

  it("le menu pointe vers des sections uniques", () => {
    expect(new Set(NAV.map((n) => n.id)).size).toBe(NAV.length);
  });
});

describe("référencement de la V2", () => {
  it("titre et description ont une longueur lisible dans Google", () => {
    expect(TITLE.length).toBeLessThanOrEqual(75);
    expect(DESCRIPTION.length).toBeGreaterThan(70);
    expect(DESCRIPTION.length).toBeLessThanOrEqual(200);
  });

  it("relie la V2 au site Next.js et aux profils", () => {
    const person = structuredData()["@graph"][0] as { sameAs: string[] };
    expect(person.sameAs).toContain("https://ange-carmelle-gbedji.vercel.app");
    expect(person.sameAs.some((u) => u.includes("linkedin.com"))).toBe(true);
  });

  it("le head a une canonique, l'Open Graph et un JSON-LD sûr", () => {
    const head = headTags();
    expect(head).toContain('rel="canonical" href="https://ange-carmelle-gbedji-3d.vercel.app/"');
    expect(head).toContain('property="og:image"');
    expect(head.match(/<\/script>/g)).toHaveLength(1);
  });

  it("chaque projet a sa page, indexée avec sa propre canonique", () => {
    for (const p of PROJECTS) {
      const route = matchRoute(`/projets/${p.slug}/`);
      expect(route.kind).toBe("project");
      const head = headTags(`/projets/${p.slug}`);
      expect(head).toContain(`rel="canonical" href="https://ange-carmelle-gbedji-3d.vercel.app/projets/${p.slug}"`);
      expect(head).toContain(`<title>${p.title.replace(/&/g, "&amp;")}`);
    }
    expect(ROUTES.map((r) => r.file)).toContain("video/index.html");
  });

  it("la vidéo renvoie Google vers la page du site Next.js, la 404 n'est pas indexée", () => {
    expect(headTags("/video")).toContain('rel="canonical" href="https://ange-carmelle-gbedji.vercel.app/video"');
    expect(headTags("/video")).toContain('property="og:video"');
    expect(matchRoute("/projets/inconnu").kind).toBe("notfound");
    expect(headTags("/404")).toContain('content="noindex"');
  });

  it("le sitemap liste la page et ses images, robots.txt le signale", () => {
    const xml = sitemap("2026-11-27");
    expect(xml).toContain("<loc>https://ange-carmelle-gbedji-3d.vercel.app/</loc>");
    expect(xml).toContain("graduation-wecode.jpg");
    for (const p of PROJECTS) expect(xml).toContain(`/projets/${p.slug}</loc>`);
    expect(xml).not.toContain("/video</loc>");
    expect(robots()).toContain("Sitemap: https://ange-carmelle-gbedji-3d.vercel.app/sitemap.xml");
  });
});
