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
 * Accueil : une couverture éditoriale, pas une carte de visite.
 * Le nom s'impose pendant que la tour 3D prend place dans le champ opposé.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const started = useStage((s) => s.started);
  const lines = nameLines();

  useMotion(
    ref,
    (root) => {
      if (!started) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
      tl.fromTo(
        pick(root, ".hero-kicker, .hero-index"),
        { opacity: 0, y: 14, letterSpacing: "0.2em" },
        { opacity: 1, y: 0, letterSpacing: "0.12em", duration: 0.9, stagger: 0.1 },
        0,
      )
        .fromTo(
          pick(root, ".ch"),
          { yPercent: 115, y: 0, rotate: 6 },
          { yPercent: 0, y: 0, rotate: 0, duration: 1.3, stagger: 0.03 },
          0.15,
        )
        .fromTo(
          pick(root, ".hero-role .rl"),
          { clipPath: "inset(0% 0% 100% 0%)", yPercent: 60 },
          { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1.1, stagger: 0.12 },
          0.55,
        )
        .fromTo(
          pick(root, ".hero-actions > *"),
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.08 },
          0.9,
        )
        .fromTo(pick(root, ".scroll-cue"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.4);
      const unmag = magnetic(root.querySelector<HTMLElement>(".btn-primary"));
      return () => unmag();
    },
    [started],
  );

  // La sortie est liée au défilement : le nom s'efface, la sculpture reste et accompagne le récit.
  useMotion(ref, (root) => {
    gsap.to(pick(root, ".hero-copy"), {
      yPercent: -18,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom 15%", scrub: true },
    });
    gsap.to(pick(root, ".hero-foot, .hero-index"), {
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "+=180", scrub: true },
    });
  });

  return (
    <Chapter ref={ref} id="accueil" className="hero" labelledBy="hero-title">
      <div className="hero-still" aria-hidden="true">
        <Still />
      </div>
      <div className="hero-copy" data-window>
        <p className="hero-kicker">Portfolio créatif <span>—</span> Abidjan, Côte d’Ivoire</p>
        <h1 id="hero-title" tabIndex={-1} aria-label={PROFILE.name}>
          {lines.map((l) => (
            <span className="line" key={l}>
              <Chars text={l} />
            </span>
          ))}
        </h1>
        <p className="hero-role">
          <span className="rl">Je conçois et développe des expériences numériques,</span>{" "}
          <span className="rl">du back-end à l’interface.</span>
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#projets">
            Explorer mes projets <span aria-hidden="true">↗</span>
          </a>
          <a className="btn-text" href="#contact">
            Me contacter
          </a>
        </div>
      </div>
      <p className="hero-index" aria-hidden="true">
        <span>01</span> <i /> <span>05</span>
      </p>
      <div className="hero-foot">
        <a className="scroll-cue" href="#apropos">
          <span>Défiler pour découvrir</span>
          <span className="scroll-cue-line" aria-hidden="true" />
        </a>
      </div>
    </Chapter>
  );
}
