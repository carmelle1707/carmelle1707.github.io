import type { SectionId } from "../content/site";

/**
 * Une pose par section : où se place la caméra, ce qu'elle regarde
 * et de combien les plaques s'écartent (0 : tour assemblée, 1 : vue éclatée).
 */
export type Pose = {
  camera: [number, number, number];
  target: [number, number, number];
  spread: number;
};

export const POSES: Record<SectionId, Pose> = {
  // La tour entière, vue de trois quarts.
  accueil: { camera: [8.8, 6.1, 9.9], target: [-0.75, 1.15, 0], spread: 0 },
  // Au ras du sol : les fondations.
  parcours: { camera: [8.2, 2.4, 9.2], target: [-0.4, 0.9, 0], spread: 0 },
  // Vue éclatée, comme une axonométrie d'architecte.
  competences: { camera: [9.6, 5, 10.4], target: [-0.8, 2.1, 0], spread: 1 },
  // La tour se recompose avec les couches du projet ouvert.
  projets: { camera: [7.2, 5.8, 8.2], target: [0, 1.4, 0], spread: 0.35 },
  // De face, pour lire les étages de bas en haut.
  etapes: { camera: [4.4, 3.8, 13.2], target: [-0.9, 1.7, 0], spread: 0.45 },
  // On recule : la pile est prête.
  contact: { camera: [9.6, 7.4, 11.2], target: [0, 1.2, 0], spread: 0 },
};

/** Dimensions d'une plaque et de l'écart entre deux plaques, en unités de scène. */
export const SLAB = { width: 3.4, depth: 2.4, height: 0.26, gap: 0.24, spreadGap: 0.62 };

export const slabY = (index: number, spread: number) =>
  SLAB.height / 2 + index * (SLAB.height + SLAB.gap + spread * SLAB.spreadGap);
