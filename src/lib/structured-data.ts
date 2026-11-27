import type { SiteContent } from "@/lib/content-types";
import { stripEmphasis } from "@/lib/rich-title";
import { PORTRAIT } from "@/lib/portrait";
import { PRESENTATION_VIDEO } from "@/lib/video";
import { V2_URL } from "@/lib/v2";

/**
 * Données structurées schema.org (JSON-LD) : la personne et son activité de prestataire.
 * Google s'en sert pour comprendre qui propose quoi, et où.
 */
export function structuredData(c: SiteContent, url: string) {
  const absolute = (path: string | undefined) =>
    path ? new URL(path, `${url}/`).toString() : undefined;
  // La V2 en 3D est le même portfolio sous une autre forme : Google relie les deux.
  const sameAs = [c.contact.linkedin, c.contact.github, V2_URL].filter(Boolean);
  const personId = `${url}/#personne`;
  const telephone = c.contact.whatsapp.replace(/[^\d+]/g, "") || undefined;

  const alternateName = nameVariants(c.profile.name, c.profile.shortName);
  const photo = absolute(c.profile.photo?.url);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Nom du site affiché par Google au-dessus du lien (à la place de « vercel.app »)
        "@type": "WebSite",
        "@id": `${url}/#site`,
        name: c.profile.name,
        alternateName,
        url: `${url}/`,
        inLanguage: "fr",
        publisher: { "@id": personId },
      },
      {
        // Page de profil : Google comprend que l'accueil présente cette personne
        "@type": "ProfilePage",
        "@id": `${url}/#profil`,
        url: `${url}/`,
        name: `${c.profile.name} · ${c.profile.role}`,
        isPartOf: { "@id": `${url}/#site` },
        mainEntity: { "@id": personId },
        primaryImageOfPage: photo ? { "@type": "ImageObject", url: photo } : undefined,
        inLanguage: "fr",
      },
      {
        "@type": "Person",
        "@id": personId,
        name: c.profile.name,
        // Variantes sous lesquelles on peut la chercher (« Ange Carmelle », « Carmelle Gbedji »…)
        alternateName,
        jobTitle: c.profile.role,
        // La biographie décrit la personne ; l'introduction décrit plutôt l'offre
        description: c.profile.bio || c.profile.lead,
        url,
        // Photo principale puis le portrait de « À propos » : les deux images de la personne
        image: [photo, absolute(PORTRAIT.src)].filter(Boolean),
        // Formations et programmes du parcours, repris tels que saisis dans l'admin
        alumniOf: c.education.length
          ? c.education.map((e) => ({ "@type": "EducationalOrganization", name: e.title }))
          : undefined,
        workLocation: { "@type": "Place", name: "Abidjan, Côte d'Ivoire" },
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
        image: photo,
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

/**
 * Page de lecture de la vidéo de présentation : c'est ici (et pas sur l'accueil) que Google
 * peut l'indexer, car la vidéo y est le contenu principal.
 */
export function videoPageData(c: SiteContent, url: string) {
  const abs = (path: string) => new URL(path, `${url}/`).toString();
  const pageUrl = `${url}${PRESENTATION_VIDEO.pagePath}`;
  const personId = `${url}/#personne`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        "@id": `${pageUrl}#video`,
        name: PRESENTATION_VIDEO.title,
        description: PRESENTATION_VIDEO.description,
        thumbnailUrl: [
          abs(PRESENTATION_VIDEO.square.poster),
          abs(PRESENTATION_VIDEO.vertical.poster),
        ],
        uploadDate: PRESENTATION_VIDEO.uploadDate,
        duration: `PT${PRESENTATION_VIDEO.durationSeconds}S`,
        contentUrl: abs(PRESENTATION_VIDEO.square.src),
        url: pageUrl,
        inLanguage: "en",
        creator: { "@id": personId, "@type": "Person", name: c.profile.name },
        about: { "@id": personId },
      },
      breadcrumbData(url, [
        { name: "Accueil", path: "/" },
        { name: "Vidéo de présentation", path: PRESENTATION_VIDEO.pagePath },
      ]),
    ],
  };
}

/** « Ange Carmelle Gbedji » → [« Ange Carmelle », « Carmelle Gbedji », « Ange Gbedji »]. */
export function nameVariants(name: string, shortName?: string): string[] {
  const parts = name.trim().split(/\s+/);
  const variants = new Set<string>();
  if (shortName && shortName !== name) variants.add(shortName);
  if (parts.length >= 3) {
    variants.add(parts.slice(0, -1).join(" "));
    variants.add(parts.slice(1).join(" "));
    variants.add(`${parts[0]} ${parts[parts.length - 1]}`);
  }
  variants.delete(name);
  return [...variants];
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
