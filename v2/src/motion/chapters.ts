import { useEffect } from "react";
import { CHAPTERS, type SectionId } from "../content/site";
import { setStage } from "../state/store";
import { ScrollTrigger, scroll } from "./scroll";

/**
 * Suit la lecture de l'accueil : quel chapitre passe à 60 % de la hauteur de l'écran, et où l'on en est dedans.
 * La tour lit ces valeurs à chaque image. Suit aussi la montée du bleu nuit du contact.
 * Monté après les chapitres (useEffect du parent) : leurs épinglages existent déjà.
 */
export function useChapters(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    scroll.page = "home";
    const activate = (id: SectionId) => {
      scroll.active = id;
      setStage({ section: id });
    };
    const triggers = CHAPTERS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        // L'accueil commence en haut de page : au repos, sa pose est celle du début.
        start: id === "accueil" ? "top top" : "top 60%",
        end: "bottom 60%",
        onUpdate: (self) => {
          scroll.local[id] = self.progress;
          scroll.px[id] = Math.max(0, self.scroll() - self.start);
        },
        onToggle: (self) => {
          if (self.isActive) activate(id);
        },
        onRefresh: (self) => {
          scroll.local[id] = self.progress;
          if (self.isActive) activate(id);
        },
      });
    });

    // Le bleu nuit monte avec le haut du contact, derrière la tour ; l'en-tête bascule quand il l'atteint.
    const night = document.querySelector<HTMLElement>(".night");
    const contact = document.getElementById("contact");
    const root = document.documentElement;
    const paint = () => {
      if (!night || !contact) return;
      const top = contact.getBoundingClientRect().top;
      const h = window.innerHeight;
      const clipped = Math.min(h, Math.max(0, top));
      night.style.clipPath = `inset(${clipped}px 0 0 0)`;
      scroll.night = 1 - clipped / h;
      root.classList.toggle("is-night", top <= 64);
    };
    const nightTrigger = contact
      ? ScrollTrigger.create({ trigger: contact, start: "top bottom", end: "max", onUpdate: paint, onRefresh: paint, onLeaveBack: paint })
      : null;
    paint();

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let alive = true;
    document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());
    return () => {
      alive = false;
      triggers.forEach((t) => t?.kill());
      nightTrigger?.kill();
      root.classList.remove("is-night");
    };
  }, [enabled]);
}
