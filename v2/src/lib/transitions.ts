import type { CSSProperties } from "react";

/** Nom de transition partagé entre la galerie et la page du projet : la capture s'agrandit d'une page à l'autre. */
export const shotTransition = (slug: string) => ({ viewTransitionName: `shot-${slug}` }) as CSSProperties;
