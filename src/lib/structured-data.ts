import type { SiteContent } from "@/lib/content-types";
import { stripEmphasis } from "@/lib/rich-title";

/**
 * Données structurées schema.org (JSON-LD) : la personne et son activité de prestataire.
 * Google s'en sert pour comprendre qui propose quoi, et où.
 */
export function structuredData(c: SiteContent, url: string) {
  const absolute = (path: string | undefined) =>
    path ? new URL(path, `${url}/`).toString() : undefined;
  const sameAs = [c.contact.linkedin, c.contact.github].filter(Boolean);
  const personId = `${url}/#personne`;
  const telephone = c.contact.whatsapp.replace(/[^\d+]/g, "") || undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: c.profile.name,
        jobTitle: c.profile.role,
        description: c.profile.lead,
        url,
        image: absolute(c.profile.photo?.url),
        email: c.contact.email || undefined,
        address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
        knowsLanguage: c.profile.language || undefined,
        knowsAbout: c.skills.flatMap((g) => g.items),
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${url}/#activite`,
        name: `${c.profile.name} · ${c.profile.role}`,
        description: stripEmphasis(c.profile.headline),
        url,
        image: absolute(c.profile.photo?.url),
        telephone,
        founder: { "@id": personId },
        areaServed: { "@type": "Country", name: "Côte d'Ivoire" },
        address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: c.services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.desc },
          })),
        },
        sameAs,
      },
    ],
  };
}

type Crumb = { name: string; path: string };

/** Fil d'Ariane (affiché par Google sous le titre du résultat). */
export function breadcrumbData(url: string, crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${url}${c.path}`,
    })),
  };
}

/** Page d'une offre : le service, rattaché à la personne et à la zone servie. */
export function servicePageData(
  c: SiteContent,
  service: SiteContent["services"][number],
  url: string,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}${path}#service`,
        name: `${service.title} à Abidjan`,
        serviceType: service.title,
        description: service.desc,
        url: `${url}${path}`,
        provider: { "@id": `${url}/#personne`, "@type": "Person", name: c.profile.name },
        areaServed: [
          { "@type": "City", name: "Abidjan" },
          { "@type": "Country", name: "Côte d'Ivoire" },
        ],
        audience: service.for ? { "@type": "Audience", audienceType: service.for } : undefined,
        hasOfferCatalog: service.features.length
          ? {
              "@type": "OfferCatalog",
              name: "Ce qui est inclus",
              itemListElement: service.features.map((f) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: f },
              })),
            }
          : undefined,
      },
      breadcrumbData(url, [
        { name: "Accueil", path: "/" },
        { name: "Services", path: "/#services" },
        { name: service.title, path },
      ]),
    ],
  };
}

/** Page d'un projet : réalisation attribuée à la personne. */
export function projectPageData(
  c: SiteContent,
  project: SiteContent["projects"][number],
  url: string,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}${path}#projet`,
        name: project.title,
        description: project.desc,
        url: `${url}${path}`,
        image: project.image ? new URL(project.image.url, `${url}/`).toString() : undefined,
        creator: { "@id": `${url}/#personne`, "@type": "Person", name: c.profile.name },
        keywords: project.stack.join(", ") || undefined,
        sameAs: [project.demoUrl, project.githubUrl].filter(Boolean),
      },
      breadcrumbData(url, [
        { name: "Accueil", path: "/" },
        { name: "Projets", path: "/#projets" },
        { name: project.title, path },
      ]),
    ],
  };
}

/** JSON sûr dans une balise <script> : « < » échappé pour qu'un texte ne puisse pas la fermer. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
