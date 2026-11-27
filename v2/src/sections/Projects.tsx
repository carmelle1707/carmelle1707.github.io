import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { shotTransition } from "../lib/transitions";
import { PROJECTS } from "../content/site";
import { projectPath } from "../content/routes";
import { setStage, useStage } from "../state/store";
import { bookInput, gsap, scroll, ScrollTrigger } from "../motion/scroll";
import { pick } from "../motion/useMotion";
import { useReducedMotion, useWideScreen } from "../lib/capabilities";
import { Chapter, Fill } from "./Sections";

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Vrai tant que la tour 3D est affichée (la classe disparaît si l'appareil passe à l'image fixe). */
function useScene3d() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setOn(root.classList.contains("scene-3d"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return on;
}

type DragOptions = {
  /** Largeur d'une page à l'écran, en pixels : un glissement de cette longueur tourne une page. */
  pageWidth: () => number;
  /** Double page ouverte au moment où l'on saisit la page. */
  current: () => number;
  /** Fin du geste : la double page où le livre doit se poser, et si l'on vient de glisser (sinon c'est un clic). */
  release: (spread: number, dragged: boolean) => void;
  /** Le coin survolé se soulève (souris seulement). */
  peek: boolean;
};

/**
 * Tourner une page à la main : on saisit la page, elle suit le pointeur, et au lâcher elle termine
 * son mouvement ou retombe selon l'élan du geste. Un clic sans glisser tourne d'une page du côté cliqué.
 * Le défilement vertical reste au navigateur (touch-action: pan-y) : un geste vertical annule la prise.
 */
function bindDrag(el: HTMLElement, max: number, o: DragOptions) {
  let id = -1;
  let startX = 0;
  let from = 0;
  let value = 0;
  let moved = false;
  let lastX = 0;
  let lastT = 0;
  let speed = 0;

  const side = (x: number) => {
    const r = el.getBoundingClientRect();
    return x > r.left + r.width / 2 ? 1 : -1;
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    id = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    from = o.current();
    value = from;
    moved = false;
    speed = 0;
  };
  const move = (e: PointerEvent) => {
    if (id !== e.pointerId) {
      if (!o.peek || e.pointerType !== "mouse") return;
      const s = side(e.clientX);
      const cur = o.current();
      bookInput.peek = (s > 0 && cur < max) || (s < 0 && cur > 1) ? s * 0.05 : 0;
      return;
    }
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) {
      moved = true;
      try {
        el.setPointerCapture(id);
      } catch {
        // Pointeur déjà relâché : le geste continue sans capture.
      }
      el.classList.add("is-dragging");
      bookInput.peek = 0;
    }
    if (!moved) return;
    value = clamp(from - dx / o.pageWidth(), 0, max);
    bookInput.drag = value;
    const dt = e.timeStamp - lastT;
    if (dt > 0) speed = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastT = e.timeStamp;
  };
  const end = (e: PointerEvent, cancelled: boolean) => {
    if (id !== e.pointerId) return;
    id = -1;
    el.classList.remove("is-dragging");
    if (moved) {
      // L'élan compte : un geste vif tourne la page même si on la lâche avant la moitié.
      const projected = value - (speed * 160) / o.pageWidth();
      const spread = clamp(Math.round(projected), Math.max(0, from - 1), Math.min(max, from + 1));
      bookInput.drag = null;
      o.release(spread, true);
    } else if (!cancelled) o.release(clamp(o.current() + side(e.clientX), 0, max), false);
  };
  const up = (e: PointerEvent) => end(e, false);
  const cancel = (e: PointerEvent) => end(e, true);
  const leave = () => {
    bookInput.peek = 0;
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", cancel);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", cancel);
    el.removeEventListener("pointerleave", leave);
    bookInput.drag = null;
    bookInput.peek = 0;
  };
}

/**
 * Projets : un livre posé sur la tour. Sur grand écran, le chapitre s'épingle et chaque cran de
 * défilement tourne une page ; on peut aussi la tourner à la main, au clic ou avec les flèches.
 * La fiche du projet ouvert se compose à gauche, en texte (lisible, accessible, indexable).
 * Sur téléphone et en mouvement réduit, c'est un carrousel, et le livre suit le projet affiché.
 */
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [book, setBook] = useState(false);
  const [spread, setSpread] = useState(0);
  const scene3d = useScene3d();
  const wide = useWideScreen();
  const reduced = useReducedMotion();
  const current = useStage((s) => s.project);
  const index = Math.max(0, PROJECTS.findIndex((p) => p.slug === current));
  const n = PROJECTS.length;
  /** Double page ouverte : dans le livre épinglé elle suit le défilement, ailleurs le carrousel. */
  const open = book ? spread : index + 1;

  // Carrousel : le projet le plus visible pilote la tour et le livre.
  useEffect(() => {
    const root = ref.current;
    const viewport = root?.querySelector(".gallery-viewport");
    if (!root || !viewport) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (root.classList.contains("is-book")) return;
        for (const e of entries) if (e.isIntersecting) setStage({ project: (e.target as HTMLElement).dataset.slug ?? "" });
      },
      { root: viewport, threshold: 0.6 },
    );
    pick(root, ".gallery-item").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!book) scroll.book = index + 1;
  }, [index, book, reduced]);

  /** Amène le livre sur une double page : par le défilement s'il est épinglé, sinon par le carrousel. */
  const goTo = (target: number, instant = false) => {
    const root = ref.current;
    const k = clamp(target, 0, n);
    const st = trigger.current;
    if (st) {
      scroll.book = k;
      window.scrollTo({ top: st.start + (k / n) * (st.end - st.start), behavior: instant ? "instant" : "smooth" });
      return;
    }
    if (root?.classList.contains("is-book")) {
      // Livre sans épinglage (mouvement réduit) : on change de page sur place.
      const page = Math.max(1, k);
      scroll.book = page;
      setSpread(page);
      setStage({ project: PROJECTS[page - 1]?.slug ?? "" });
      return;
    }
    const viewport = root?.querySelector<HTMLElement>(".gallery-viewport");
    const item = root ? pick(root, ".gallery-item")[Math.max(0, k - 1)] : undefined;
    if (!viewport || !item) return;
    const inset = parseFloat(getComputedStyle(viewport).scrollPaddingLeft) || 0;
    const left = item.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft - inset;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  };
  const goToRef = useRef(goTo);
  goToRef.current = goTo;

  // Le livre : grand écran et tour 3D affichée. Épinglé au défilement quand les animations sont permises ;
  // en mouvement réduit, la même mise en page sans épinglage, et les pages changent d'un coup.
  const bookMode = wide && scene3d;
  useLayoutEffect(() => {
    const root = ref.current;
    const pin = root?.querySelector<HTMLElement>(".projects-pin");
    const surface = root?.querySelector<HTMLElement>(".book-surface");
    if (!bookMode || !root || !pin || !surface) return;
    root.classList.add("is-book");
    setBook(true);
    let st: ScrollTrigger | null = null;
    let raf = 0;
    if (reduced) {
      const k = clamp(Math.round(scroll.book) || 1, 1, n);
      scroll.book = k;
      setSpread(k);
    } else {
      st = ScrollTrigger.create({
        trigger: pin,
        pin: true,
        start: "top top",
        // Un peu moins d'un écran de défilement par page : assez pour lire, pas assez pour s'ennuyer.
        end: () => `+=${n * 0.9 * window.innerHeight}`,
        invalidateOnRefresh: true,
        snap: { snapTo: 1 / n, duration: { min: 0.25, max: 0.7 }, delay: 0.12, ease: "power1.inOut" },
        onUpdate: (self) => {
          const t = self.progress * n;
          scroll.book = t;
          const k = Math.round(t);
          setSpread(k);
          setStage({ project: PROJECTS[clamp(k - 1, 0, n - 1)]?.slug ?? "" });
        },
      });
      trigger.current = st;
      // L'épinglage arrive après les déclencheurs des chapitres : on les remet dans l'ordre de la page,
      // sinon ceux du contact gardent des positions calculées sans la hauteur ajoutée par le livre.
      ScrollTrigger.sort();
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    const unbind = bindDrag(surface, n, {
      pageWidth: () => surface.clientWidth * 0.3,
      current: () => Math.round(scroll.book),
      release: (k, dragged) => goToRef.current(k, dragged),
      peek: !reduced,
    });
    return () => {
      cancelAnimationFrame(raf);
      unbind();
      st?.kill();
      trigger.current = null;
      root.classList.remove("is-book");
      setBook(false);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  }, [bookMode, reduced, n]);

  // Sur téléphone, on tourne aussi la page en glissant le doigt sur le livre, au-dessus du carrousel.
  useEffect(() => {
    const win = ref.current?.querySelector<HTMLElement>(".chapter-window");
    if (book || !win) return;
    return bindDrag(win, n, {
      pageWidth: () => win.clientWidth * 0.42,
      current: () => Math.round(scroll.book),
      release: (k) => goToRef.current(Math.max(1, k)),
      peek: false,
    });
  }, [book, n]);

  // À chaque page tournée, la fiche se compose pendant que la feuille retombe.
  useEffect(() => {
    const root = ref.current;
    if (!book || reduced || !root) return;
    const item = pick(root, ".gallery-item")[index];
    if (!item) return;
    const title = item.querySelector("h3");
    const rest = pick(item, ".gallery-info > :not(h3)");
    const tl = gsap.timeline({ delay: 0.22 });
    tl.fromTo(
      title,
      { clipPath: "inset(0 0 100% 0)", y: 28 },
      { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.75, ease: "expo.out", clearProps: "clipPath" },
    ).fromTo(rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power3.out" }, 0.12);
    return () => {
      tl.progress(1).kill();
    };
  }, [index, book, reduced]);

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (!book || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    if ((e.target as HTMLElement).closest("input, textarea, select")) return;
    e.preventDefault();
    goTo(open + (e.key === "ArrowRight" ? 1 : -1));
  };

  if (n === 0) return null;

  return (
    <Chapter ref={ref} id="projets" className="projects" labelledBy="projects-title" window="start">
      <div className="projects-pin" onKeyDown={onKey}>
        <div className="projects-head">
          <h2 id="projects-title">Chaque projet a sa propre pile</h2>
          <p className="projects-count" aria-hidden="true">
            <span className="num">{pad(index + 1)}</span> / <span className="num">{pad(n)}</span>
          </p>
        </div>
        <div className="gallery-viewport">
          <ul className="gallery-track">
            {PROJECTS.map((p, i) => {
              const shown = !book || i === index;
              return (
                <li
                  key={p.slug}
                  className={`gallery-item${i === index ? " is-current" : ""}`}
                  data-slug={p.slug}
                  aria-current={p.slug === current ? "true" : undefined}
                  inert={!shown}
                >
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
              );
            })}
          </ul>
        </div>
        <div className="book-nav">
          <button type="button" className="book-turn" data-dir="prev" onClick={() => goTo(open - 1)} disabled={open <= 1}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12.5 4.5 7 10l5.5 5.5" />
            </svg>
            Projet précédent
          </button>
          <button type="button" className="book-turn" data-dir="next" onClick={() => goTo(open + 1)} disabled={open >= n}>
            {open === 0 ? "Ouvrir le livre" : "Projet suivant"}
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7.5 4.5 13 10l-5.5 5.5" />
            </svg>
          </button>
        </div>
        <div className="book-surface" aria-hidden="true" />
        <p className="book-hint" aria-hidden="true">
          Tirez le coin d'une page pour la tourner
        </p>
      </div>
    </Chapter>
  );
}
