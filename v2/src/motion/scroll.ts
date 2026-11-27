import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SectionId } from "../content/site";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * L'état du défilement, lu image par image par la scène 3D (sans rendu React) :
 * le chapitre lu, l'avancée dans chaque chapitre (0 à 1), l'introduction et la nuit du contact.
 */
export const scroll = {
  active: "accueil" as SectionId,
  local: {
    accueil: 0,
    apropos: 0,
    parcours: 0,
    competences: 0,
    projets: 0,
    contact: 0,
  } as Record<SectionId, number>,
  /** Distance parcourue dans chaque chapitre, en pixels : sert au fondu d'une pose à l'autre. */
  px: {
    accueil: 0,
    apropos: 0,
    parcours: 0,
    competences: 0,
    projets: 0,
    contact: 0,
  } as Record<SectionId, number>,
  /** 0 au chargement, 1 quand la caméra a fini sa montée d'introduction. */
  intro: 0,
  /** Part de l'écran occupée par le bleu nuit du contact (0 à 1). */
  night: 0,
  /** Page d'un projet : la tour tient une pose fixe, à droite du texte. */
  page: "home" as "home" | "project",
  /** Le livre des projets : 0 fermé, k ouvert sur la double page du projet k (1 à n). */
  book: 0,
};

/**
 * La main sur le livre : `drag` vaut la page tenue pendant qu'on la tourne au doigt ou à la souris
 * (null sinon), `peek` soulève légèrement le coin survolé (+ vers la page suivante, − vers la précédente).
 */
export const bookInput = { drag: null as number | null, peek: 0 };

/** Position de la souris dans la fenêtre, de -1 à 1, partagée par la scène et les effets de survol. */
export const pointer = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}

// En développement, l'état du défilement est lisible depuis la console.
if (import.meta.env.DEV && typeof window !== "undefined") Object.assign(window, { __scroll: scroll, __gsap: gsap, __st: ScrollTrigger });
