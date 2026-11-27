/**
 * Contenu de la V2. Il vient de l'admin du portfolio Next.js (une seule admin pour les deux
 * sites) : scripts/fetch-content.mjs l'écrit dans admin.json avant chaque build, et ce fichier
 * le traduit dans la forme de la tour. Rien n'est inventé : ce qui manque est marqué `missing`.
 */
import admin from "./admin.json";

/** Le portfolio Next.js : l'admin, l'API de contact et les fichiers envoyés depuis l'admin. */
export const MAIN_SITE = "https://ange-carmelle-gbedji.vercel.app";
export const SITE_URL = "https://ange-carmelle-gbedji-3d.vercel.app";
/** En local, `VITE_CONTACT_API` pointe vers le site Next.js lancé à côté. */
export const CONTACT_API: string = import.meta.env.VITE_CONTACT_API ?? `${MAIN_SITE}/api/public/contact`;

export type AdminContent = typeof admin;

/** Les cinq couches de la tour, de bas en haut. */
export type LayerId = "donnees" | "serveur" | "api" | "interface" | "mobile";

export type Layer = {
  id: LayerId;
  name: string;
  /** Ce que fait la couche, en une ligne. */
  role: string;
  tech: string[];
};

const LAYER_DEFS: Omit<Layer, "tech">[] = [
  { id: "donnees", name: "Données", role: "Modéliser et stocker l'information." },
  { id: "serveur", name: "Serveur", role: "La logique métier, les comptes, la sécurité." },
  { id: "api", name: "API", role: "Faire parler les applications entre elles." },
  { id: "interface", name: "Interface", role: "Ce que l'on voit et touche à l'écran." },
  { id: "mobile", name: "Mobile", role: "La même application, dans la poche." },
];

/** À quelle couche appartient une technologie. Ce qui n'est pas reconnu rejoint les outils. */
const KEYWORDS: [LayerId, RegExp][] = [
  ["mobile", /react native|expo|flutter|kotlin|swift|ionic/i],
  ["api", /\bapi\b|inertia|graphql|rest|trpc|webhook/i],
  ["donnees", /sql|mongo|postgres|sqlite|redis|firebase|supabase|prisma|mariadb|base de donn/i],
  ["serveur", /php|laravel|node|nest|express|python|django|flask|symfony|java\b|spring|ruby|go\b/i],
  ["interface", /html|css|javascript|typescript|react|vue|next|nuxt|angular|svelte|tailwind|bootstrap|sass/i],
];

/** Pour les mots que les mots-clés ne couvrent pas, l'intitulé du groupe dans l'admin. */
const GROUPS: [LayerId, RegExp][] = [
  ["mobile", /mobile/i],
  ["donnees", /donn|data|base/i],
  ["serveur", /back|serveur|server/i],
  ["interface", /front|interface|ui/i],
];

export function layerOf(tech: string, group = ""): LayerId | null {
  for (const [id, re] of KEYWORDS) if (re.test(tech)) return id;
  for (const [id, re] of GROUPS) if (re.test(group)) return id;
  return null;
}

/** « Tailwind » et « Tailwind CSS », « Inertia » et « Inertia.js » sont la même chose. */
const sameTech = (t: string) => t.toLowerCase().replace(/\.js$|(?<=\w) css$/g, "").trim();

function uniq(list: string[]) {
  const seen = new Set<string>();
  return list.filter((t) => {
    const k = sameTech(t);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Une adresse envoyée depuis l'admin est relative au site Next.js. */
export function fromMain(url: string | undefined | null) {
  if (!url) return undefined;
  return /^https?:\/\//.test(url) ? url : new URL(url, `${MAIN_SITE}/`).toString();
}

/** Les captures déjà optimisées dans la V2 (WebP) remplacent les PNG d'origine du site Next.js. */
const LOCAL_COPIES: Record<string, string> = {
  "/images/flot.png": "/images/flot.webp",
  "/images/yowl.png": "/images/yowl.webp",
  "/images/postit.png": "/images/postit.webp",
};

export type Project = {
  slug: string;
  title: string;
  context: string;
  desc: string;
  role: string;
  stack: string[];
  /** Couches de la tour utilisées par le projet : la tour se recompose avec elles. */
  layers: LayerId[];
  image?: { src: string; alt: string; width: number; height: number };
  links: { label: string; href: string }[];
  /** Ce que la fiche attend encore (affiché comme emplacement à compléter). */
  missing?: string;
};

export type Step = { period: string; title: string; desc: string };

export function buildContent(c: AdminContent) {
  const tools: string[] = [];
  const byLayer = new Map<LayerId, string[]>(LAYER_DEFS.map((l) => [l.id, []]));
  const add = (tech: string, group?: string) => {
    const id = layerOf(tech, group);
    if (id) byLayer.get(id)!.push(tech);
    else tools.push(tech);
  };
  for (const g of c.skills) for (const t of g.items) add(t, g.group);
  // Les technologies des projets complètent la pile (une API utilisée, un langage) sans doublon.
  for (const p of c.projects) for (const t of p.stack) if (layerOf(t)) add(t);

  const layers: Layer[] = LAYER_DEFS.map((l) => ({ ...l, tech: uniq(byLayer.get(l.id)!) }));

  const projects: Project[] = c.projects.map((p) => {
    const used = new Set(p.stack.map((t) => layerOf(t)).filter((id): id is LayerId => id !== null));
    const src = p.image?.url ? (LOCAL_COPIES[p.image.url] ?? fromMain(p.image.url)) : undefined;
    const missing = [
      !p.role && "rôle",
      p.stack.length === 0 && "technologies",
      !src && "capture d'écran",
    ].filter(Boolean) as string[];
    return {
      slug: p.slug,
      title: p.title,
      // « Brief équipe Flot · Interface de reporting » : la première partie situe le projet.
      context: p.tag.split("·")[0].trim(),
      desc: p.desc,
      role: p.role,
      stack: p.stack,
      layers: LAYER_DEFS.map((l) => l.id).filter((id) => used.has(id)),
      image: src ? { src, alt: `Capture d'écran du projet ${p.title}`, width: 1600, height: 900 } : undefined,
      links: [
        ...(p.demoUrl ? [{ label: "Voir le projet en ligne", href: p.demoUrl }] : []),
        ...(p.githubUrl ? [{ label: "Code sur GitHub", href: p.githubUrl }] : []),
      ],
      missing: missing.length ? `${missing.join(", ")} à compléter dans l'admin` : undefined,
    };
  });

  // Du plus ancien au plus récent : la frise se lit de bas en haut, comme la tour.
  const steps: Step[] = [...c.education].reverse().map((e) => ({ period: e.period, title: e.title, desc: e.desc }));

  const digits = c.contact.whatsapp.replace(/[^\d]/g, "");
  return {
    layers,
    tools: uniq(tools),
    projects,
    steps,
    profile: {
      name: c.profile.name,
      shortName: c.profile.shortName || c.profile.name,
      role: c.profile.role,
      bio: c.profile.bio,
      location: c.profile.location,
      photo: fromMain(c.profile.photo?.url),
      cv: fromMain(c.profile.cv?.url),
    },
    contact: {
      whatsapp: digits ? { label: c.contact.whatsapp, href: `https://wa.me/${digits}` } : undefined,
      email: c.contact.email || undefined,
      linkedin: c.contact.linkedin || undefined,
      github: c.contact.github || undefined,
    },
  };
}

const content = buildContent(admin);

export const LAYERS = content.layers;
export const TOOLS = content.tools;
export const PROJECTS = content.projects;
export const STEPS = content.steps;
export const CONTACT = content.contact;
export const PROFILE = {
  ...content.profile,
  /** Le portrait de la V2, optimisé ici (le même que sur le site Next.js). */
  portrait: {
    src: "/images/ange-carmelle-gbedji-portrait.jpg",
    alt: "Ange Carmelle Gbedji à son bureau à Abidjan",
    width: 900,
    height: 1350,
  },
  classicSite: MAIN_SITE,
};

/** Photos de la remise des attestations WeCode, les mêmes que sur le site Next.js. */
export const WECODE_PHOTOS = [
  {
    src: "/images/ange-carmelle-gbedji-attestation-wecode.jpg",
    alt: "Ange Carmelle Gbedji reçoit son attestation de formation WeCode",
  },
  {
    src: "/images/ange-carmelle-gbedji-graduation-wecode.jpg",
    alt: "Ange Carmelle Gbedji à la cérémonie de remise des diplômes WeCode",
  },
  {
    src: "/images/ange-carmelle-gbedji-promotion-wecode.jpg",
    alt: "Ange Carmelle Gbedji et une camarade de la promotion WeCode",
  },
].map((p) => ({ ...p, width: 1400, height: 933 }));

/** La vidéo de présentation (60 s), servie par le site Next.js : une seule copie des fichiers. */
export const VIDEO = {
  title: `${admin.profile.name} en 60 secondes`,
  description:
    "Présentation en 60 secondes : son parcours, ses projets (Flot, YOWL, CinéScope, Post-it) et les technologies qu'elle utilise, du web au mobile.",
  uploadDate: "2026-11-04",
  square: { src: `${MAIN_SITE}/videos/presentation-carre.mp4`, poster: `${MAIN_SITE}/videos/presentation-carre.jpg`, width: 720, height: 720 },
  vertical: {
    src: `${MAIN_SITE}/videos/presentation-vertical.mp4`,
    poster: `${MAIN_SITE}/videos/presentation-vertical.jpg`,
    width: 720,
    height: 1280,
  },
  /** La page de lecture que Google indexe : celle du site Next.js. */
  canonical: `${MAIN_SITE}/video`,
};

export type SectionId = "accueil" | "apropos" | "parcours" | "competences" | "projets" | "contact";

/** Les chapitres de l'accueil, dans l'ordre du défilement. */
export const CHAPTERS: SectionId[] = ["accueil", "apropos", "parcours", "competences", "projets", "contact"];

export const NAV: { id: SectionId; label: string }[] = [
  { id: "apropos", label: "À propos" },
  { id: "parcours", label: "Parcours" },
  { id: "competences", label: "Compétences" },
  { id: "projets", label: "Projets" },
  { id: "contact", label: "Contact" },
];
