import { useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "./scroll";

export type MotionSetup = (root: HTMLElement, env: { wide: boolean }) => void | (() => void);

/**
 * Lance les animations d'un chapitre, et seulement si l'on n'a pas demandé moins d'animations.
 * `gsap.matchMedia` rejoue la mise en place quand on passe d'un écran large à un écran étroit,
 * et défait proprement tout ce qui a été créé (déclencheurs, épinglages, styles en ligne).
 */
export function useMotion(ref: RefObject<HTMLElement | null>, setup: MotionSetup, deps: DependencyList = []) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add(
      // `all` est toujours vrai : sans lui, la mise en place ne tournerait pas sur un petit écran (aucune condition remplie).
      { all: "all", wide: "(min-width: 60rem)", reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { wide, reduce } = ctx.conditions as { wide: boolean; reduce: boolean };
        if (reduce) return;
        return setup(root, { wide });
      },
    );
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Les éléments d'un chapitre qui correspondent au sélecteur. */
export const pick = <T extends Element = HTMLElement>(root: Element, selector: string) =>
  Array.from(root.querySelectorAll<T & Element>(selector)) as T[];

/**
 * Bouton magnétique : il se laisse attirer par le curseur, puis revient en place.
 * Seulement avec une souris, et jamais en mouvement réduit (l'appelant est déjà dans `useMotion`).
 */
export function magnetic(el: HTMLElement | null) {
  if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
  const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - (r.left + r.width / 2)) * 0.28);
    y((e.clientY - (r.top + r.height / 2)) * 0.4);
  };
  const leave = () => {
    x(0);
    y(0);
  };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
    gsap.set(el, { x: 0, y: 0 });
  };
}
