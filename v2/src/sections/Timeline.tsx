import { useRef } from "react";
import { STEPS } from "../content/site";
import { setStage } from "../state/store";
import { gsap } from "../motion/scroll";
import { pick, useMotion } from "../motion/useMotion";
import { Chapter } from "./Sections";

/**
 * Une date en compteur mécanique : chaque chiffre est une bande 0…n qui défile jusqu'à sa valeur.
 * Sans animation, la bande est déjà arrêtée sur le bon chiffre ; le texte réel est lu aux lecteurs d'écran.
 */
function Odometer({ value }: { value: string }) {
  return (
    <span className="odo">
      <span className="visually-hidden">{value}</span>
      {[...value].map((c, i) => {
        if (!/\d/.test(c))
          return (
            <span key={i} className="odo-sym" aria-hidden="true">
              {c}
            </span>
          );
        const d = Number(c);
        return (
          <span key={i} className="odo-digit" aria-hidden="true">
            <span className="odo-reel" data-digit={d} style={{ transform: `translateY(-${d}em)` }}>
              {Array.from({ length: d + 1 }, (_, k) => (
                <span key={k}>{k}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Parcours. La ligne du temps se trace avec la lecture ; chaque étape s'ouvre de son côté,
 * son année défile au compteur, et une plaque descend se poser sur la tour.
 */
export function Timeline() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const line = root.querySelector(".tl");
    if (line)
      gsap.fromTo(
        pick(root, ".tl-fill"),
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: line, start: "top 60%", end: "bottom 60%", scrub: true } },
      );

    pick(root, ".tl-step").forEach((step, i) => {
      const left = step.dataset.side === "left";
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "expo.out" },
      });
      tl.fromTo(
        pick(step, ".tl-card"),
        { clipPath: left ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", x: left ? -48 : 48 },
        { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 1.2 },
        0,
      )
        .fromTo(pick(step, ".tl-dot"), { scale: 0 }, { scale: 1, duration: 0.7 }, 0)
        .fromTo(
          pick(step, ".odo-reel"),
          { y: 0 },
          {
            y: (_: number, el: HTMLElement) => -Number(el.dataset.digit) * (el.firstElementChild as HTMLElement).offsetHeight,
            duration: 1.4,
            ease: "power4.out",
            stagger: 0.07,
          },
          0.1,
        );
      gsap.set(pick(step, ".odo-reel"), { y: 0 });
      gsap.set(pick(step, ".tl-card"), { clipPath: left ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" });
      gsap.set(pick(step, ".tl-dot"), { scale: 0 });
      gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: "top 74%",
          onEnter: () => {
            tl.play();
            setStage({ step: i });
          },
          onLeaveBack: () => {
            tl.reverse();
            setStage({ step: i > 0 ? i - 1 : null });
          },
        },
      });
    });
  });

  return (
    <Chapter ref={ref} id="parcours" className="timeline-ch" labelledBy="steps-title" window="end">
      <p className="editorial-kicker">Les étapes qui m’ont construite</p>
      <h2 id="steps-title">Le parcours, de bas en haut</h2>
      <div className="tl">
        <div className="tl-line" aria-hidden="true">
          <span className="tl-fill" />
        </div>
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title} className="tl-step" data-side={i % 2 === 0 ? "left" : "right"}>
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-card">
                <p className="tl-year">
                  <Odometer value={s.period} />
                </p>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
}
