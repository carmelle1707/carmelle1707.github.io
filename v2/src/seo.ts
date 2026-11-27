import { MAIN_SITE, PROFILE, PROJECTS, SITE_URL, CONTACT, LAYERS, VIDEO, WECODE_PHOTOS } from "./content/site";
import { matchRoute, projectPath } from "./content/routes";

/** Titre et description : ce que Google affiche dans ses résultats. */
export const TITLE = `${PROFILE.name}, développeuse full stack à Abidjan · Portfolio 3D`;
export const DESCRIPTION = `Le portfolio 3D de ${PROFILE.name}, développeuse full stack web et mobile à Abidjan : sa pile de compétences, ses projets (${PROJECTS.map((p) => p.title.split(/\s[—–-]\s/)[0])
  .slice(0, 3)
  .join(", ")}) et son parcours, couche par couche.`;
export const OG_IMAGE = { src: "/og.jpg", width: 1200, height: 630 };

/** « projet d'Ange », « projet de Marie ». */
const of = (name: string) => (/^[aeiouyhàâéèêîôû]/i.test(name) ? `d'${name}` : `de ${name}`);
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
          url: abs(projectPath(p.slug)),
          author: { "@id": person },
          keywords: p.stack.join(", "),
        })),
      },
    ],
  };
}

type Head = {
  title: string;
  description: string;
  canonical: string;
  image: { src: string; width: number; height: number; alt: string };
  type: string;
  robots: string;
  jsonLd?: object;
  extra?: string[];
};

/**
 * Le <head> de chaque page. Les pages projet sont propres à la V2 (la tour s'y recompose) :
 * elles sont indexées. La vidéo existe déjà sur le site Next.js : la page d'ici renvoie Google
 * vers celle-là (canonique), pour que les deux sites ne se fassent pas concurrence.
 */
function headFor(path: string): Head {
  const route = matchRoute(path);
  const og = { ...OG_IMAGE, alt: `La tour de compétences 3D du portfolio de ${PROFILE.name}` };
  switch (route.kind) {
    case "home":
      return { title: TITLE, description: DESCRIPTION, canonical: `${SITE_URL}/`, image: og, type: "profile", robots: "index, follow, max-image-preview:large", jsonLd: structuredData() };
    case "project": {
      const p = route.project;
      const url = abs(route.path);
      const description = [p.desc, p.role && `Mon rôle : ${p.role}`].filter(Boolean).join(" ").slice(0, 200);
      return {
        title: `${p.title}, projet ${of(PROFILE.name)} · Portfolio 3D`,
        description: description || `${p.title}, un projet ${of(PROFILE.name)}, développeuse full stack à Abidjan.`,
        canonical: url,
        image: p.image ? { ...p.image, src: abs(p.image.src), alt: p.image.alt } : og,
        type: "article",
        robots: "index, follow, max-image-preview:large",
        jsonLd: {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              "@id": `${url}#projet`,
              name: p.title,
              description: p.desc,
              url,
              image: p.image ? abs(p.image.src) : undefined,
              keywords: p.stack.join(", "),
              author: { "@id": `${SITE_URL}/#personne` },
              sameAs: [`${MAIN_SITE}/projets/${p.slug}`, ...p.links.map((l) => l.href)],
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Projets", item: `${SITE_URL}/#projets` },
                { "@type": "ListItem", position: 3, name: p.title, item: url },
              ],
            },
          ],
        },
      };
    }
    case "video":
      return {
        title: `${VIDEO.title} · Portfolio 3D`,
        description: `${PROFILE.name} : ${VIDEO.description}`,
        canonical: VIDEO.canonical,
        image: { src: VIDEO.square.poster, width: 1080, height: 1080, alt: `Vidéo de présentation de ${PROFILE.name}` },
        type: "video.other",
        robots: "index, follow",
        extra: [
          `<meta property="og:video" content="${VIDEO.square.src}" />`,
          `<meta property="og:video:type" content="video/mp4" />`,
          `<meta property="og:video:width" content="${VIDEO.square.width}" />`,
          `<meta property="og:video:height" content="${VIDEO.square.height}" />`,
        ],
      };
    default:
      return { title: `Page introuvable · ${PROFILE.name}`, description: DESCRIPTION, canonical: `${SITE_URL}/`, image: og, type: "website", robots: "noindex" };
  }
}

/** Balises du <head>, injectées dans le HTML pré-rendu de chaque page. */
export function headTags(path = "/") {
  const h = headFor(path);
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<link rel="canonical" href="${h.canonical}" />`,
    `<meta name="robots" content="${h.robots}" />`,
    `<meta name="author" content="${esc(PROFILE.name)}" />`,
    `<meta property="og:type" content="${h.type}" />`,
    `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:site_name" content="${esc(PROFILE.name)}" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${h.canonical}" />`,
    `<meta property="og:image" content="${esc(h.image.src.startsWith("http") ? h.image.src : abs(h.image.src))}" />`,
    `<meta property="og:image:width" content="${h.image.width}" />`,
    `<meta property="og:image:height" content="${h.image.height}" />`,
    `<meta property="og:image:alt" content="${esc(h.image.alt)}" />`,
    ...(h.extra ?? []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    `<meta name="twitter:image" content="${esc(h.image.src.startsWith("http") ? h.image.src : abs(h.image.src))}" />`,
  ];
  if (h.jsonLd) tags.push(`<script type="application/ld+json">${JSON.stringify(h.jsonLd).replace(/</g, "\\u003c")}</script>`);
  return tags.join("\n    ");
}

/** Sitemap : l'accueil et ses images, puis chaque page projet avec sa capture. */
export function sitemap(lastmod: string) {
  const img = (src: string) => `\n    <image:image><image:loc>${esc(abs(src))}</image:loc></image:image>`;
  const url = (loc: string, images: string[]) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>${images.map(img).join("")}\n  </url>`;
  const home = url(`${SITE_URL}/`, [PROFILE.portrait.src, ...WECODE_PHOTOS.map((p) => p.src)]);
  const projects = PROJECTS.map((p) => url(abs(projectPath(p.slug)), p.image ? [p.image.src] : []));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[home, ...projects].join("\n")}
</urlset>
`;
}

export function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
