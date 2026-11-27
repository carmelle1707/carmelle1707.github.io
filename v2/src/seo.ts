import { MAIN_SITE, PROFILE, PROJECTS, SITE_URL, CONTACT, LAYERS, WECODE_PHOTOS } from "./content/site";

/** Titre et description : ce que Google affiche dans ses résultats. */
export const TITLE = `${PROFILE.name}, développeuse full stack à Abidjan · Portfolio 3D`;
export const DESCRIPTION = `Le portfolio 3D de ${PROFILE.name}, développeuse full stack web et mobile à Abidjan : sa pile de compétences, ses projets (${PROJECTS.map((p) => p.title.split(/\s[—–-]\s/)[0])
  .slice(0, 3)
  .join(", ")}) et son parcours, couche par couche.`;
export const OG_IMAGE = { src: "/og.jpg", width: 1200, height: 630 };

const abs = (path: string) => new URL(path, `${SITE_URL}/`).toString();
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Données structurées : la même personne que sur le site Next.js (même nom, mêmes profils),
 * reliée à lui par `sameAs`, pour que Google comprenne qu'il s'agit d'une seule identité.
 */
export function structuredData() {
  const person = `${SITE_URL}/#personne`;
  const sameAs = [MAIN_SITE, CONTACT.linkedin, CONTACT.github].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": person,
        name: PROFILE.name,
        alternateName: PROFILE.shortName,
        jobTitle: "Développeuse full stack",
        description: PROFILE.bio,
        image: abs(PROFILE.portrait.src),
        url: `${SITE_URL}/`,
        sameAs,
        address: { "@type": "PostalAddress", addressLocality: "Abidjan", addressCountry: "CI" },
        knowsAbout: LAYERS.flatMap((l) => l.tech),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        url: `${SITE_URL}/`,
        name: `${PROFILE.name}, portfolio 3D`,
        inLanguage: "fr",
        publisher: { "@id": person },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#page`,
        url: `${SITE_URL}/`,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "fr",
        isPartOf: { "@id": `${SITE_URL}/#site` },
        mainEntity: { "@id": person },
        primaryImageOfPage: abs(OG_IMAGE.src),
        hasPart: PROJECTS.map((p) => ({
          "@type": "CreativeWork",
          name: p.title,
          description: p.desc,
          url: `${MAIN_SITE}/projets/${p.slug}`,
          author: { "@id": person },
          keywords: p.stack.join(", "),
        })),
      },
    ],
  };
}

/** Balises du <head>, injectées dans le HTML pré-rendu. */
export function headTags() {
  const json = JSON.stringify(structuredData()).replace(/</g, "\\u003c");
  return [
    `<title>${esc(TITLE)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}" />`,
    `<link rel="canonical" href="${SITE_URL}/" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta name="author" content="${esc(PROFILE.name)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:site_name" content="${esc(PROFILE.name)}" />`,
    `<meta property="og:title" content="${esc(TITLE)}" />`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}" />`,
    `<meta property="og:url" content="${SITE_URL}/" />`,
    `<meta property="og:image" content="${abs(OG_IMAGE.src)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="La tour de compétences 3D du portfolio de ${esc(PROFILE.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(TITLE)}" />`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${abs(OG_IMAGE.src)}" />`,
    `<script type="application/ld+json">${json}</script>`,
  ].join("\n    ");
}

/** Sitemap d'une seule page, avec ses images (Google Images). */
export function sitemap(lastmod: string) {
  const images = [
    PROFILE.portrait,
    ...WECODE_PHOTOS,
    ...PROJECTS.flatMap((p) => (p.image ? [p.image] : [])),
  ].map((i) => `\n    <image:image><image:loc>${esc(abs(i.src))}</image:loc></image:image>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>${images.join("")}
  </url>
</urlset>
`;
}

export function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
