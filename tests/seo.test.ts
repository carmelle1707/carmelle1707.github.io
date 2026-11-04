import { afterEach, describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { starterContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, structuredData } from "@/lib/structured-data";

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
    expect(sitemap()[0].url).toBe("https://ange-carmelle.dev/");
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

  it("le JSON-LD ne peut pas fermer la balise <script>", () => {
    expect(jsonLdString({ t: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
