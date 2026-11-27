/**
 * Couleurs de la scène 3D. Three.js ne lit pas l'OKLCH : ce sont les équivalents hexadécimaux
 * exacts des jetons de src/styles/tokens.css (palette du portfolio actuel). Toute modification se fait des deux côtés.
 */
export type ScenePalette = {
  slab: string;
  edge: string;
  gold: string;
  steel: string;
  shadow: string;
  /** Part d'or mêlée à une plaque mise en avant : plus faible sur fond sombre, où l'or vire au brun. */
  goldTint: number;
};

export const LIGHT: ScenePalette = {
  slab: "#f8f9fb", // paper-2
  edge: "#c3cad6", // rule renforcée pour dessiner les arêtes
  gold: "#d2a44a", // gold
  steel: "#2f5d8a", // second
  shadow: "#0f1b2d", // ink
  goldTint: 0.32,
};

export const DARK: ScenePalette = {
  slab: "#1a2539",
  edge: "#34445f",
  gold: "#d9ad5b",
  steel: "#8fb3e0",
  shadow: "#000000",
  goldTint: 0.2,
};
