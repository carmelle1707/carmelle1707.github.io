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

/** JSON sûr dans une balise <script> : « < » échappé pour qu'un texte ne puisse pas la fermer. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
