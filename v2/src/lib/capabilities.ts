import { useEffect, useState } from "react";

/** Préférence « réduire les animations » du système, suivie en direct. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Vrai sur un écran large : la tour suit alors toute la page au lieu du seul accueil. */
export function useWideScreen() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 60rem)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

export type SceneMode = "pending" | "3d" | "still";

/**
 * Décide si l'appareil reçoit la tour en 3D ou son image fixe :
 * pas de WebGL, mode économie de données ou très peu de cœurs → image fixe.
 */
export function detectSceneMode(): SceneMode {
  if (typeof window === "undefined") return "pending";
  // ?fixe dans l'adresse force l'image fixe : utile pour vérifier ce que voient les appareils modestes.
  if (new URLSearchParams(window.location.search).has("fixe")) return "still";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "still";
  } catch {
    return "still";
  }
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "still";
  if ((navigator.hardwareConcurrency ?? 4) < 4) return "still";
  return "3d";
}
