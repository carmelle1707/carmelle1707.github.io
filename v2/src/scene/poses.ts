import type { SectionId } from "../content/site";
import { LAYERS } from "../content/site";

/**
 * Une pose de caméra : où elle se tient, ce qu'elle regarde, de combien les plaques
 * s'écartent (0 : assemblée, 1 : vue éclatée) et où la tour se place à l'écran
 * (`shift`, en fraction de la fenêtre : x vers la droite, y vers le haut).
 */
export type Pose = {
  camera: [number, number, number];
  target: [number, number, number];
  spread: number;
  shift: [number, number];
};

/** Dimensions d'une plaque et de l'écart entre deux plaques, en unités de scène. */
export const SLAB = { width: 3.4, depth: 2.4, height: 0.26, gap: 0.24, spreadGap: 0.62 };

export const slabY = (index: number, spread: number) =>
  SLAB.height / 2 + index * (SLAB.height + SLAB.gap + spread * SLAB.spreadGap);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

export function mix(a: Pose, b: Pose, t: number): Pose {
  const k = ease(Math.min(1, Math.max(0, t)));
  return {
    camera: [lerp(a.camera[0], b.camera[0], k), lerp(a.camera[1], b.camera[1], k), lerp(a.camera[2], b.camera[2], k)],
    target: [lerp(a.target[0], b.target[0], k), lerp(a.target[1], b.target[1], k), lerp(a.target[2], b.target[2], k)],
    spread: lerp(a.spread, b.spread, k),
    shift: [lerp(a.shift[0], b.shift[0], k), lerp(a.shift[1], b.shift[1], k)],
  };
}

/** Au chargement, la caméra part du sol, tout près de la première plaque. */
export const INTRO: Pose = { camera: [2.6, 0.5, 5.2], target: [0, 0.5, 0], spread: 0, shift: [0.18, 0] };

const TOP = slabY(LAYERS.length - 1, 1);

/** Chaque chapitre a sa pose, qui évolue avec l'avancée `t` (0 à 1) dans le chapitre. */
const WIDE: Record<SectionId, (t: number) => Pose> = {
  // La tour entière de trois quarts, à droite du nom ; en quittant l'accueil, la caméra recule.
  accueil: (t) =>
    mix(
      { camera: [8.8, 6.1, 9.9], target: [0, 1.15, 0], spread: 0, shift: [0.2, 0] },
      { camera: [11.5, 7.6, 12.8], target: [0, 1.2, 0], spread: 0, shift: [0.27, 0.02] },
      t,
    ),
  // En retrait, petite et lointaine, pendant qu'on fait connaissance.
  apropos: (t) =>
    mix(
      { camera: [12.5, 7, 13.5], target: [0, 1.2, 0], spread: 0, shift: [0.31, 0.02] },
      { camera: [7.5, 3.4, 13], target: [0, 1.6, 0], spread: 0.2, shift: [0.26, 0] },
      t,
    ),
  // De face : on voit les étages se poser un à un.
  parcours: (t) =>
    mix(
      { camera: [5.2, 3.4, 13.4], target: [0, 1.9, 0], spread: 0.45, shift: [0.25, 0] },
      { camera: [4.2, 4.4, 12.6], target: [0, 1.7, 0], spread: 0.45, shift: [0.25, 0] },
      t,
    ),
  // Vue éclatée ; la caméra descend de la couche du haut à celle du bas.
  competences: (t) => {
    const y = lerp(TOP, slabY(0, 1), t);
    return { camera: [11, y + 3.8, 12.6], target: [0, y, 0], spread: 1, shift: [0.25, -0.02] };
  },
  // La tour passe à gauche, la galerie défile à droite.
  projets: (t) =>
    mix(
      { camera: [10.6, 7.6, 12.2], target: [0, 1.2, 0], spread: 0.35, shift: [-0.3, -0.04] },
      { camera: [11.4, 8.2, 12.8], target: [0, 1.2, 0], spread: 0.35, shift: [-0.3, -0.04] },
      t,
    ),
  // De nuit, la pile terminée reçoit sa dernière plaque.
  contact: (t) =>
    mix(
      { camera: [9.8, 7.4, 11.4], target: [0, 1.6, 0], spread: 0, shift: [0.24, 0] },
      { camera: [8.6, 5.8, 10.4], target: [0, 1.6, 0], spread: 0, shift: [0.24, 0] },
      t,
    ),
};

/** Page projet : la tour à droite du texte, recomposée avec les couches du projet. */
export const PROJECT_PAGE: Pose = { camera: [11, 8, 12.6], target: [0, 1.2, 0], spread: 0.35, shift: [0.27, 0] };

/**
 * Sur téléphone, la tour vit dans le haut de l'écran, au-dessus des panneaux de texte
 * qui défilent par-dessus : même pose, plus de recul, recentrée.
 */
function narrow(p: Pose): Pose {
  const [x, y, z] = p.camera;
  const [tx, ty, tz] = p.target;
  const k = 1.55;
  return {
    ...p,
    camera: [tx + (x - tx) * k, ty + (y - ty) * k, tz + (z - tz) * k],
    shift: [0, 0.24],
  };
}

export function poseFor(id: SectionId, t: number, wide: boolean): Pose {
  const p = WIDE[id](t);
  return wide ? p : narrow(p);
}

export function projectPagePose(wide: boolean): Pose {
  return wide ? PROJECT_PAGE : narrow(PROJECT_PAGE);
}

export function introPose(wide: boolean): Pose {
  return wide ? INTRO : narrow(INTRO);
}
