import { useRef } from "react";
import { LAYERS, TOOLS } from "../content/site";
import { setStage, useStage } from "../state/store";
import { ScrollTrigger, gsap } from "../motion/scroll";
import { pick, useMotion } from "../motion/useMotion";
import { LayerIcon } from "./icons";
import { Chapter } from "./Sections";

/** Dans l'ordre de la tour lue de haut en bas : le mobile d'abord, les données en dernier. */
const ORDER = [...LAYERS].reverse();

/** Aller à une couche : redéfini par l'animation épinglée, qui sait à quelle hauteur de défilement elle se trouve. */
const nav = {
  go: (i: number) => {
    document.getElementById(`couche-${ORDER[i].id}`)?.scrollIntoView({ block: "center" });
    setStage({ layer: ORDER[i].id });
  },
};

/** L'entrée d'une couche : l'icône se trace, le nom monte, les technologies arrivent du fond. */
function enter(panel: Element) {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.fromTo(pick(panel, ".layer-icon path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: "power2.inOut" }, 0)
    .fromTo(pick(panel, ".skill-name"), { yPercent: 105 }, { yPercent: 0, duration: 0.9 }, 0.05)
    .fromTo(pick(panel, ".skill-role"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15)
    .fromTo(
      pick(panel, ".tech-card"),
      { z: -260, rotateX: 38, opacity: 0 },
      { z: 0, rotateX: 0, opacity: 1, duration: 1, stagger: 0.06 },
      0.2,
    );
  return tl;
}

/**
 * Compétences. Sur grand écran, le chapitre s'épingle et la lecture descend la pile couche par couche :
 * la caméra suit, la couche sort de la tour comme un tiroir, son panneau prend la place du précédent.
 */
export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const active = useStage((s) => s.layer);

  useMotion(ref, (root, { wide }) => {
    const panels = pick(root, ".skill-panel");
    const n = panels.length;
    const cleanups: (() => void)[] = [];

    // Les technologies s'inclinent vers le curseur.
    pick(root, ".tech-cards").forEach((list) => {
      const move = (e: PointerEvent) => {
        const r = list.getBoundingClientRect();
        list.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 14}deg`);
        list.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`);
      };
      const leave = () => {
        list.style.setProperty("--ry", "0deg");
        list.style.setProperty("--rx", "0deg");
      };
      list.addEventListener("pointermove", move);
      list.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        list.removeEventListener("pointermove", move);
        list.removeEventListener("pointerleave", leave);
      });
    });

    if (!wide) {
      // Téléphone : pas d'épinglage, chaque couche entre en scène quand on l'atteint.
      panels.forEach((p, i) => {
        const tl = enter(p).pause(0);
        ScrollTrigger.create({
          trigger: p,
          start: "top 78%",
          onEnter: () => {
            tl.play();
            setStage({ layer: ORDER[i].id });
          },
          onEnterBack: () => setStage({ layer: ORDER[i].id }),
        });
      });
      return () => cleanups.forEach((c) => c());
    }

    root.classList.add("is-pinned");
    let current = -1;
    let running: gsap.core.Timeline | null = null;
    gsap.set(panels, { autoAlpha: 0 });
    const show = (i: number, dir: number) => {
      if (i === current) return;
      const prev = panels[current];
      current = i;
      setStage({ layer: ORDER[i].id });
      if (prev) gsap.to(prev, { autoAlpha: 0, y: dir * -48, filter: "blur(6px)", duration: 0.45, ease: "power2.in", overwrite: true });
      running?.kill();
      gsap.set(panels[i], { autoAlpha: 1, y: 0, filter: "blur(0px)", overwrite: true });
      running = enter(panels[i]);
    };

    const pin = root.querySelector(".skills-pin");
    const st = ScrollTrigger.create({
      trigger: pin,
      pin: true,
      start: "top top",
      end: `+=${n * 75}%`,
      onUpdate: (self) => show(Math.min(n - 1, Math.floor(self.progress * n)), self.direction),
      onRefresh: (self) => show(Math.min(n - 1, Math.floor(self.progress * n)), 1),
    });
    show(0, 1);
    const go = nav.go;
    nav.go = (i) => window.scrollTo({ top: st.start + ((i + 0.5) / n) * (st.end - st.start), behavior: "smooth" });
    return () => {
      nav.go = go;
      running?.kill();
      root.classList.remove("is-pinned");
      cleanups.forEach((c) => c());
    };
  });

  return (
    <Chapter ref={ref} id="competences" className="skills" labelledBy="skills-title" window="start">
      <div className="skills-pin">
        <p className="editorial-kicker">Une expertise en construction</p>
        <h2 id="skills-title">Ma pile, couche par couche</h2>
        <ol className="skills-meter" aria-label="Couches de la pile">
          {ORDER.map((l, i) => (
            <li key={l.id}>
              <button type="button" aria-current={active === l.id ? "true" : undefined} onClick={() => nav.go(i)}>
                {l.name}
              </button>
            </li>
          ))}
        </ol>
        <div className="skills-panels">
          {ORDER.map((l) => (
            <article key={l.id} id={`couche-${l.id}`} className="skill-panel" aria-labelledby={`couche-${l.id}-titre`}>
              <LayerIcon id={l.id} />
              <h3 id={`couche-${l.id}-titre`} className="skill-title">
                <span className="skill-name">{l.name}</span>
              </h3>
              <p className="skill-role">{l.role}</p>
              <ul className="tech-cards">
                {l.tech.map((t) => (
                  <li key={t} className="tech-card">
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="tools">Autour de la pile&nbsp;: {TOOLS.join(", ")}.</p>
      </div>
    </Chapter>
  );
}
