import { useSyncExternalStore } from "react";
import { PROJECTS, type LayerId, type SectionId } from "../content/site";

/**
 * État partagé entre les sections HTML et la scène 3D : la section lue,
 * la couche survolée, le projet ouvert et l'étape survolée.
 * Un petit store maison suffit : pas besoin d'une bibliothèque pour quatre valeurs.
 */
export type StageState = {
  section: SectionId;
  layer: LayerId | null;
  project: string;
  step: number | null;
};

let state: StageState = { section: "accueil", layer: null, project: PROJECTS[0]?.slug ?? "", step: null };
const listeners = new Set<() => void>();

export function setStage(patch: Partial<StageState>) {
  const next = { ...state, ...patch };
  if (
    next.section === state.section &&
    next.layer === state.layer &&
    next.project === state.project &&
    next.step === state.step
  ) {
    return;
  }
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
