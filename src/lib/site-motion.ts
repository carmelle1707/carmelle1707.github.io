import Lenis from "lenis";
import { inView } from "motion";

/**
 * Animations au scroll et à la souris du site public, portées depuis docs/reference/index.html.
 * Tout passe par des attributs data-* posés côté serveur : sans JavaScript, la page reste
 * entièrement lisible. Rien ne démarre si l'utilisateur demande moins d'animations.
 */

type On = (
  target: Window | Document | HTMLElement,
  type: string,
  fn: (e: never) => void,
  opts?: AddEventListenerOptions,
) => void;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const all = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

export function startSiteMotion(): () => void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const cleanups: Array<() => void> = [];
  const on: On = (target, type, fn, opts) => {
    const handler = fn as EventListener;
    target.addEventListener(type, handler, opts);
    cleanups.push(() => target.removeEventListener(type, handler, opts));
  };

  // Défilement doux ; les liens #ancre passent aussi par Lenis.
  const lenis = new Lenis({ anchors: true, autoRaf: true });
  cleanups.push(() => lenis.destroy());

  revealOnScroll(cleanups);
  scrollEffects(on, cleanups);
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) pointerEffects(on, cleanups);

  return () => cleanups.forEach((fn) => fn());
}

/** Titres mot par mot, apparitions en cascade et lien de navigation actif. */
function revealOnScroll(cleanups: Array<() => void>) {
  const vh = innerHeight;

  // Seuls les titres encore sous la ligne de flottaison attendent d'être révélés.
  const splits = all("[data-split]").filter((el) => el.getBoundingClientRect().top > vh * 0.9);
  splits.forEach((el) => (el.dataset.split = "wait"));
  splits.forEach((el) =>
    cleanups.push(inView(el, () => void (el.dataset.split = "in"), { margin: "0px 0px -10% 0px" })),
  );

  const reveals = all("[data-reveal]").filter((el) => el.getBoundingClientRect().top > vh * 0.92);
  reveals.forEach((el) => {
    const siblings = Array.from(el.parentElement?.children ?? []).filter((c) =>
      c.hasAttribute("data-reveal"),
    );
    el.style.setProperty("--d", String(Math.max(0, siblings.indexOf(el))));
    el.dataset.reveal = "wait";
  });
  const show = (el: HTMLElement) => {
    if (el.dataset.reveal !== "wait") return;
    el.dataset.reveal = "in";
    // Une fois l'entrée finie, on rend la main aux transitions normales (survol, tilt…).
    setTimeout(() => {
      el.dataset.reveal = "";
      el.style.removeProperty("--d");
    }, 1700);
  };
  reveals.forEach((el) =>
    cleanups.push(inView(el, () => show(el), { margin: "0px 0px -8% 0px", amount: 0.1 })),
  );

  // Filet de sécurité (onglet en arrière-plan, observer en retard) : rien ne reste caché.
  const safety = setTimeout(() => {
    reveals.forEach((el) => el.getBoundingClientRect().top < innerHeight && show(el));
    splits.forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight) el.dataset.split = "in";
    });
  }, 4000);
  cleanups.push(() => clearTimeout(safety));

  const links = all<HTMLAnchorElement>("[data-nav]");
  links.forEach((link) => {
    const id = link.getAttribute("href") ?? "";
    const section = id.startsWith("#") ? document.querySelector(id) : null;
    if (!section) return;
    cleanups.push(
      inView(
        section,
        () => {
          links.forEach((a) => a.setAttribute("aria-current", String(a === link)));
          return () => link.setAttribute("aria-current", "false");
        },
        { margin: "-45% 0px -50% 0px" },
      ),
    );
  });
}

/** Effets liés à la position du scroll, calculés une fois par image. */
function scrollEffects(on: On, cleanups: Array<() => void>) {
  const header = document.querySelector<HTMLElement>("[data-header]");
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  const skew = document.querySelector<HTMLElement>("[data-skew]");
  const parallax = all("[data-speed]");
  const stepsWrap = document.querySelector<HTMLElement>("[data-steps]");
  const rail = stepsWrap?.querySelector<HTMLElement>(".rail");
  const steps = stepsWrap ? all(".step", stepsWrap) : [];
  const projects = all("[data-project]");
  const fill = document.querySelector<HTMLElement>("[data-fill]");
  const wide = matchMedia("(min-width: 861px) and (min-height: 700px)");

  let lastY = scrollY;
  let velocity = 0;
  let ticking = false;

  const frame = () => {
    ticking = false;
    const y = scrollY;
    const h = innerHeight;
    const max = document.documentElement.scrollHeight - h;

    if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    if (header) {
      header.dataset.scrolled = String(y > 8);
      if (y > lastY + 4 && y > 500) header.dataset.hidden = "true";
      else if (y < lastY - 4) header.dataset.hidden = "false";
    }

    velocity = y - lastY;
    lastY = y;
    if (skew) skew.style.transform = `skewX(${clamp(-velocity * 0.25, -8, 8)}deg)`;

    parallax.forEach((el) => {
      el.style.translate = `0 ${(y * Number(el.dataset.speed)).toFixed(1)}px`;
    });

    if (stepsWrap && rail) {
      const r = stepsWrap.getBoundingClientRect();
      const p = clamp((h * 0.8 - r.top) / (r.height + h * 0.3), 0, 1);
      rail.style.setProperty("--p", p.toFixed(3));
      steps.forEach((li, i) => {
        const lit = p >= i / steps.length + 0.02 || (r.top < h * 0.6 && innerWidth <= 860);
        li.dataset.on = String(lit);
      });
    }

    // Cartes projets empilées : la carte recouverte recule et s'assombrit.
    projects.forEach((card, i) => {
      const next = projects[i + 1];
      if (!wide.matches || !next) {
        card.style.transform = "";
        card.style.filter = "";
        return;
      }
      const a = card.getBoundingClientRect();
      const t = clamp((a.bottom - next.getBoundingClientRect().top) / a.height, 0, 1);
      card.style.transform = `scale(${(1 - t * 0.07).toFixed(4)})`;
      card.style.filter = `brightness(${(1 - t * 0.14).toFixed(3)})`;
    });

    if (fill) {
      const top = fill.getBoundingClientRect().top;
      fill.style.setProperty("--f", clamp((h * 0.95 - top) / (h * 0.55), 0, 1).toFixed(3));
    }
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  };
  on(window, "scroll", request, { passive: true });
  on(window, "resize", request);
  frame();

  // Le bandeau se redresse quand le scroll s'arrête.
  const settle = setInterval(() => {
    if (skew && Math.abs(velocity) < 1) skew.style.transform = "skewX(0deg)";
    velocity *= 0.5;
  }, 120);
  cleanups.push(() => clearInterval(settle));
}

/** Curseur, boutons magnétiques, cartes en 3D et halo du hero : souris uniquement. */
function pointerEffects(on: On, cleanups: Array<() => void>) {
  const root = document.documentElement;
  const ring = document.querySelector<HTMLElement>("[data-cursor-ring]");
  const dot = document.querySelector<HTMLElement>("[data-cursor-dot]");

  if (ring && dot) {
    root.classList.add("has-cursor");
    cleanups.push(() => root.classList.remove("has-cursor"));

    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    on(window, "mousemove", (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.dataset.hidden = dot.dataset.hidden = "false";
    });
    on(document, "mouseleave", () => {
      ring.dataset.hidden = dot.dataset.hidden = "true";
    });
    on(document, "mouseover", (e: MouseEvent) => {
      const target = e.target as Element;
      const view = target.closest('[data-cursor="view"]');
      const link = target.closest("a, button");
      ring.dataset.mode = view ? "view" : link ? "link" : "";
    });

    let raf = 0;
    const follow = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(follow);
    };
    follow();
    cleanups.push(() => cancelAnimationFrame(raf));
  }

  const glow = document.querySelector<HTMLElement>("[data-glow]");
  const hero = glow?.parentElement;
  if (glow && hero) {
    on(hero, "mousemove", (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.12;
      const y = (e.clientY - r.top - r.height / 2) * 0.12;
      glow.style.translate = `${x}px ${y}px`;
    });
  }

  all("[data-magnetic]").forEach((btn) => {
    let reset = 0;
    on(btn, "mousemove", (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.38;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    on(btn, "mouseleave", () => {
      btn.style.transition =
        "transform .6s cubic-bezier(.2,.7,.2,1), color .35s, border-color .35s";
      btn.style.transform = "";
      clearTimeout(reset);
      reset = window.setTimeout(() => (btn.style.transition = ""), 600);
    });
    cleanups.push(() => clearTimeout(reset));
  });

  all("[data-tilt]").forEach((card) => {
    on(card, "mousemove", (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transition = "transform .15s ease-out, border-color .35s, box-shadow .35s";
      card.style.transform = `rotateX(${((0.5 - py) * 10).toFixed(2)}deg) rotateY(${((px - 0.5) * 12).toFixed(2)}deg) translateZ(10px)`;
      card.style.setProperty("--gx", `${px * 100}%`);
      card.style.setProperty("--gy", `${py * 100}%`);
    });
    on(card, "mouseleave", () => {
      card.style.transition = "";
      card.style.transform = "";
    });
  });
}
