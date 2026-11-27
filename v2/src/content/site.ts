/**
 * Contenu de la V2, repris du portfolio actuel (data/content.json) et réécrit pour la pile.
 * Rien n'est inventé : ce qui manque est marqué `missing` et s'affiche comme un emplacement à compléter.
 */

/** Les cinq couches de la tour, de bas en haut. */
export type LayerId = "donnees" | "serveur" | "api" | "interface" | "mobile";

export type Layer = {
  id: LayerId;
  name: string;
  /** Ce que fait la couche, en une ligne. */
  role: string;
  tech: string[];
};

export const LAYERS: Layer[] = [
  { id: "donnees", name: "Données", role: "Modéliser et stocker l'information.", tech: ["MySQL", "MongoDB"] },
  {
    id: "serveur",
    name: "Serveur",
    role: "La logique métier, les comptes, la sécurité.",
    tech: ["PHP", "Laravel", "Node.js", "NestJS", "Express"],
  },
  {
    id: "api",
    name: "API",
    role: "Faire parler les applications entre elles.",
    tech: ["API REST", "Intégration d'API", "Inertia.js"],
  },
  {
    id: "interface",
    name: "Interface",
    role: "Ce que l'on voit et touche à l'écran.",
    tech: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue.js", "Next.js", "Tailwind CSS"],
  },
  { id: "mobile", name: "Mobile", role: "La même application, dans la poche.", tech: ["React Native", "Expo"] },
];

/** Les outils qui entourent la pile, sans en être une couche. */
export const TOOLS = ["Git", "GitHub", "Figma", "Vercel"];

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

const GITHUB = "https://github.com/carmelle1707";

export const PROJECTS: Project[] = [
  {
    slug: "tasnim-wallet",
    title: "Tasnim Wallet",
    context: "Groupe Tasnim, fintech",
    desc: "Le portefeuille numérique du Groupe Tasnim, pour des transactions instantanées au cœur de son écosystème.",
    role: "",
    stack: [],
    layers: [],
    links: [],
    missing: "Rôle, technologies, captures et liens à compléter",
  },
  {
    slug: "ts-immo",
    title: "TS IMMO",
    context: "Groupe Tasnim, immobilier",
    desc: "",
    role: "",
    stack: [],
    layers: [],
    links: [],
    missing: "Description, rôle, technologies, captures et liens à compléter",
  },
  {
    slug: "flot",
    title: "Flot, MOM Global Reporting",
    context: "Brief de l'équipe Flot",
    desc: "Un module qui réunit les données mensuelles d'une organisation dans un seul tableau de bord.",
    role: "Intégration de la maquette, connexion aux données par l'API, mise en page responsive.",
    stack: ["Vue.js", "Laravel", "Inertia", "Tailwind"],
    layers: ["donnees", "serveur", "api", "interface"],
    image: { src: "/images/flot.webp", alt: "Tableau de bord de reporting mensuel de Flot", width: 1600, height: 900 },
    links: [{ label: "Code sur GitHub", href: GITHUB }],
  },
  {
    slug: "yowl",
    title: "YOWL",
    context: "Projet d'équipe, 4 développeurs",
    desc: "Une plateforme pour commenter n'importe quel contenu du web depuis un seul endroit.",
    role: "Fonctionnalités Laravel, base de données SQL et interface en Tailwind.",
    stack: ["Laravel", "SQL", "Tailwind"],
    layers: ["donnees", "serveur", "interface"],
    image: { src: "/images/yowl.webp", alt: "Fil de discussion de la plateforme YOWL", width: 1600, height: 900 },
    links: [{ label: "Code sur GitHub", href: GITHUB }],
  },
  {
    slug: "cinescope",
    title: "CinéScope",
    context: "Application web, API externe",
    desc: "La découverte de films, des tendances aux favoris, alimentée en temps réel par l'API TMDB.",
    role: "Consommation d'API, rendu côté serveur avec Next.js, interface responsive.",
    stack: ["Next.js", "API TMDB", "Tailwind"],
    layers: ["api", "interface"],
    links: [{ label: "Code sur GitHub", href: GITHUB }],
    missing: "Capture d'écran à ajouter",
  },
  {
    slug: "post-it",
    title: "Post-it",
    context: "Application web, productivité",
    desc: "Des notes façon post-it, ajoutées, modifiées et supprimées en temps réel.",
    role: "Composants Vue réutilisables, échanges avec une API.",
    stack: ["Vue.js", "CSS", "API REST"],
    layers: ["api", "interface"],
    image: { src: "/images/postit.webp", alt: "Tableau de notes de l'application Post-it", width: 1600, height: 900 },
    links: [{ label: "Code sur GitHub", href: GITHUB }],
  },
];

export type Step = { period: string; title: string; desc: string; missing?: string };

/** Du plus ancien au plus récent : la tour se lit de bas en haut. */
export const STEPS: Step[] = [
  { period: "2025", title: "DigiFemme Côte d'Ivoire", desc: "Programme JA Social Equity." },
  { period: "2025", title: "Tech For Girls", desc: "Programmation Python et robotique Arduino." },
  {
    period: "2025, en cours",
    title: "Université Virtuelle de Côte d'Ivoire",
    desc: "Licence Développement d'Applications et E-services.",
  },
  {
    period: "",
    title: "Stage au Groupe Tasnim",
    desc: "Front-end, back-end, intégration d'API et tests fonctionnels.",
    missing: "Dates du stage à compléter",
  },
  {
    period: "2026, en cours",
    title: "WeCode",
    desc: "Formation full stack et mobile par projets concrets : front-end, back-end, API et bases de données.",
  },
];

export const PROFILE = {
  name: "Ange Carmelle Gbedji",
  shortName: "Ange Carmelle",
  role: "Développeuse full stack à Abidjan",
  portrait: {
    src: "/images/ange-carmelle-gbedji-portrait.jpg",
    alt: "Ange Carmelle Gbedji à son bureau à Abidjan",
    width: 900,
    height: 1350,
  },
  cv: "/cv.pdf",
  classicSite: "https://ange-carmelle-gbedji.vercel.app",
};

export const CONTACT = {
  whatsapp: { label: "+225 01 05 45 87 67", href: "https://wa.me/2250105458767" },
  linkedin: "https://www.linkedin.com/in/ange-carmelle-gbedji-1a11b237a",
  github: GITHUB,
};

export type SectionId = "accueil" | "parcours" | "competences" | "projets" | "etapes" | "contact";

export const NAV: { id: SectionId; label: string }[] = [
  { id: "parcours", label: "Parcours" },
  { id: "competences", label: "Compétences" },
  { id: "projets", label: "Projets" },
  { id: "etapes", label: "Étapes" },
  { id: "contact", label: "Contact" },
];
