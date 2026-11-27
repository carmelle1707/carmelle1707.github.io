import { useRef } from "react";
import { PROFILE } from "../content/site";
import { useStage } from "../state/store";
import { gsap } from "../motion/scroll";
import { magnetic, pick, useMotion } from "../motion/useMotion";
import { Chars } from "../motion/split";
import { Chapter, Still } from "./Sections";

/** Le nom sur deux lignes : le prénom d'usage, puis le reste. */
function nameLines() {
  const { name, shortName } = PROFILE;
  if (shortName && name.startsWith(shortName) && name.length > shortName.length)
    return [shortName, name.slice(shortName.length).trim()];
  return [name];
}

/**
 * Accueil. Le nom monte lettre par lettre de derrière sa ligne pendant que la caméra
 * remonte le long de la tour ; en défilant, le texte s'élève et laisse la place.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const started = useStage((s) => s.started);
  const lines = nameLines();

  // L'ouverture : une seule fois, quand l'écran de démarrage est parti.
  useMotion(
    ref,
    (root) => {
      if (!started) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
      tl.fromTo(pick(root, ".ch"), { yPercent: 115, y: 0, rotate: 6 }, { yPercent: 0, y: 0, rotate: 0, duration: 1.3, stagger: 0.03 })
        .fromTo(
          pick(root, ".hero-role .rl"),
          { clipPath: "inset(0% 0% 100% 0%)", yPercent: 60 },
          { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1.1, stagger: 0.12 },
          0.5,
        )
        .fromTo(pick(root, ".hero-actions > *"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.8)
        .fromTo(pick(root, ".scroll-cue"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.3);
      const unmag = magnetic(root.querySelector<HTMLElement>(".btn-primary"));
      return () => unmag();
    },
    [started],
  );

  // La sortie, liée au défilement : le texte s'élève et s'efface, la tour reste.
  useMotion(ref, (root) => {
    gsap.to(pick(root, ".hero-copy"), {
      yPercent: -22,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom 15%", scrub: true },
    });
    gsap.to(pick(root, ".hero-foot"), {
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "+=160", scrub: true },
    });
  });

  return (
    <Chapter ref={ref} id="accueil" className="hero" labelledBy="hero-title">
      <div className="hero-still" aria-hidden="true">
        <Still />
      </div>
      <div className="hero-copy" data-window>
        <h1 id="hero-title" tabIndex={-1} aria-label={PROFILE.name}>
          {lines.map((l) => (
            <span className="line" key={l}>
              <Chars text={l} />
            </span>
          ))}
        </h1>
        <p className="hero-role">
          <span className="rl">Développeuse full stack à Abidjan,</span>{" "}
          <span className="rl">de la base de données à l'écran.</span>
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#projets">
            Voir mes projets
          </a>
          <a className="btn-text" href="#contact">
            Me contacter
          </a>
        </div>
      </div>
      <div className="hero-foot">
        <a className="scroll-cue" href="#apropos">
          <span>Faire défiler</span>
          <span className="scroll-cue-line" aria-hidden="true" />
        </a>
      </div>
    </Chapter>
  );
}
