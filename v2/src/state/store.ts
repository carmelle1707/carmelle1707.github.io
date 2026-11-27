import { useSyncExternalStore } from "react";
import { PROJECTS, type LayerId, type SectionId } from "../content/site";

/**
 * État partagé entre les sections HTML et la scène 3D : le chapitre lu, la couche
 * mise en avant, le projet visible, l'étape atteinte et le dernier message envoyé.
 * Un petit store maison suffit : pas besoin d'une bibliothèque pour cinq valeurs.
 */
export type StageState = {
  section: SectionId;
  layer: LayerId | null;
  project: string;
  step: number | null;
  /** Horodatage du dernier envoi réussi : la tour s'illumine. */
  celebrate: number;
  /** Vrai une fois l'écran de démarrage parti (ou sans écran de démarrage) : les introductions peuvent jouer. */
  started: boolean;
};

let state: StageState = { section: "accueil", layer: null, project: PROJECTS[0]?.slug ?? "", step: null, celebrate: 0, started: false };
const listeners = new Set<() => void>();

export function setStage(patch: Partial<StageState>) {
  const next = { ...state, ...patch };
  const keys = Object.keys(next) as (keyof StageState)[];
  if (keys.every((k) => next[k] === state[k])) return;
  state = next;
  listeners.forEach((l) => l());
}

export const getStage = () => state;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStage<T>(select: (s: StageState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(state),
  );
}
