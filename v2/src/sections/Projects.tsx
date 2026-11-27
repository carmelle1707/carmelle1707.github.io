import { useEffect, useRef } from "react";
import { shotTransition } from "../lib/transitions";
import { PROJECTS } from "../content/site";
import { projectPath } from "../content/routes";
import { setStage, useStage } from "../state/store";
import { gsap } from "../motion/scroll";
import { pick, useMotion } from "../motion/useMotion";
import { Chapter, Fill } from "./Sections";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projets. Sur grand écran, le chapitre s'épingle et la galerie défile de côté : la capture qui arrive
 * au centre grandit, sa fiche s'éclaire, et la tour se recompose avec les couches du projet.
 * Sur téléphone et en mouvement réduit, c'est un carrousel qu'on fait glisser du doigt.
 */
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const current = useStage((s) => s.project);
  const index = Math.max(0, PROJECTS.findIndex((p) => p.slug === current));

  // Carrousel : le projet le plus visible pilote la tour.
  useEffect(() => {
    const root = ref.current;
    const viewport = root?.querySelector(".gallery-viewport");
    if (!root || !viewport) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (root.classList.contains("is-track")) return;
        for (const e of entries) if (e.isIntersecting) setStage({ project: (e.target as HTMLElement).dataset.slug ?? "" });
      },
      { root: viewport, threshold: 0.6 },
    );
    pick(root, ".gallery-item").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useMotion(ref, (root, { wide }) => {
    if (!wide) return;
    const pin = root.querySelector(".projects-pin");
    const viewport = root.querySelector<HTMLElement>(".gallery-viewport");
    const track = root.querySelector<HTMLElement>(".gallery-track");
    if (!pin || !viewport || !track) return;
    root.classList.add("is-track");
    const items = pick(root, ".gallery-item");
    const n = items.length;
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: "top top",
        end: () => `+=${distance() * 1.2}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => setStage({ project: PROJECTS[Math.round(self.progress * (n - 1))]?.slug ?? "" }),
      },
    });
    items.forEach((item, i) => {
      // Le premier est déjà au centre : il part de sa taille réelle.
      if (i === 0) return;
      const shot = item.querySelector(".gallery-shot");
      const info = item.querySelector(".gallery-info");
      gsap.fromTo(
        shot,
        { scale: 0.78, opacity: 0.55 },
        { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: item, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true } },
      );
      gsap.fromTo(
        info,
        { opacity: 0.2, y: 28 },
        { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: item, containerAnimation: tween, start: "left 85%", end: "left 55%", scrub: true } },
      );
    });
    return () => root.classList.remove("is-track");
  });

  if (PROJECTS.length === 0) return null;

  return (
    <Chapter ref={ref} id="projets" className="projects" labelledBy="projects-title" window="start">
      <div className="projects-pin">
        <div className="projects-head">
          <h2 id="projects-title">Chaque projet a sa propre pile</h2>
          <p className="projects-count" aria-hidden="true">
            <span className="num">{pad(index + 1)}</span> / <span className="num">{pad(PROJECTS.length)}</span>
          </p>
        </div>
        <div className="gallery-viewport">
          <ul className="gallery-track">
            {PROJECTS.map((p) => (
              <li key={p.slug} className="gallery-item" data-slug={p.slug} aria-current={p.slug === current ? "true" : undefined}>
                <a className="gallery-shot" href={projectPath(p.slug)} aria-label={`${p.title}, page du projet`}>
                  {p.image ? (
                    <img
                      src={p.image.src}
                      alt={p.image.alt}
                      width={p.image.width}
                      height={p.image.height}
                      loading="lazy"
                      decoding="async"
                      style={shotTransition(p.slug)}
                    />
                  ) : (
                    <span className="gallery-empty" style={shotTransition(p.slug)}>
                      Pas encore de capture
                    </span>
                  )}
                </a>
                <div className="gallery-info">
                  <h3>
                    <a href={projectPath(p.slug)}>{p.title}</a>
                  </h3>
                  {p.context && <p className="project-context">{p.context}</p>}
                  {p.desc && <p className="gallery-desc">{p.desc}</p>}
                  {p.stack.length > 0 && (
                    <ul className="chips" aria-label="Technologies">
                      {p.stack.map((t) => (
                        <li key={t} className="chip">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.missing && <Fill>{p.missing}</Fill>}
                  {p.links.length > 0 && (
                    <p className="project-links">
                      {p.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener">
                          {l.label}
                        </a>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}
