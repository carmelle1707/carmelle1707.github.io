import { useRef } from "react";
import { PROFILE, WECODE_PHOTOS } from "../content/site";
import { gsap } from "../motion/scroll";
import { pick, useMotion } from "../motion/useMotion";
import { Words } from "../motion/split";
import { Chapter } from "./Sections";
import { Shard } from "./icons";

/** Les mots qui portent la présentation : ils s'allument en gras, soulignés d'or. */
const KEYS = ["Abidjan", "WeCode", "Groupe Tasnim", "Figma", "intelligence artificielle"];

/**
 * À propos. Le portrait s'ouvre comme un volet, la présentation s'allume mot à mot
 * au rythme de la lecture, des éclats de plaques dérivent autour.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const portrait = root.querySelector(".portrait");
    if (portrait) {
      const st = { trigger: portrait, start: "top 88%", end: "top 30%", scrub: 0.6 };
      gsap.fromTo(portrait, { clipPath: "inset(46% 0% 46% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: st });
      gsap.fromTo(pick(portrait, "img"), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: st });
    }

    const bio = root.querySelector(".about-bio");
    if (bio) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: bio, start: "top 80%", end: "bottom 45%", scrub: true } });
      tl.fromTo(pick(bio, ".w"), { opacity: 0.18 }, { opacity: 1, ease: "none", stagger: 0.08, duration: 0.4 }, 0);
      pick(bio, ".k").forEach((k) => {
        const at = (tl.duration() * pick(bio, ".w").indexOf(k)) / pick(bio, ".w").length;
        tl.fromTo(k, { "--u": "0%" }, { "--u": "100%", ease: "power2.out", duration: 0.5 }, at);
      });
    }

    pick(root, "[data-speed]").forEach((el) => {
      const speed = Number(el.dataset.speed);
      gsap.fromTo(
        el,
        { yPercent: speed * 120, rotate: -speed * 8 },
        {
          yPercent: -speed * 120,
          rotate: speed * 8,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    // La bande de photos glisse de côté pendant qu'on descend.
    const strip = root.querySelector<HTMLElement>(".strip");
    const list = strip?.querySelector<HTMLElement>("ul");
    if (strip && list) {
      strip.classList.add("is-scrubbed");
      gsap.fromTo(
        list,
        { x: 0 },
        {
          x: () => -Math.max(0, list.scrollWidth - strip.clientWidth),
          ease: "none",
          scrollTrigger: { trigger: strip, start: "top 90%", end: "bottom 10%", scrub: 0.5, invalidateOnRefresh: true },
        },
      );
      return () => strip.classList.remove("is-scrubbed");
    }
  });

  return (
    <Chapter ref={ref} id="apropos" className="about" labelledBy="about-title" window="start">
      <div className="about-grid">
        <figure className="portrait">
          <img
            src={PROFILE.portrait.src}
            alt={PROFILE.portrait.alt}
            width={PROFILE.portrait.width}
            height={PROFILE.portrait.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="about-copy">
          <h2 id="about-title">Construite à Abidjan, étage par étage</h2>
          <p className="about-bio">
            <Words text={PROFILE.bio} keys={KEYS} />
          </p>
          <p>
            <a className="btn-text" href="/video">
              Me voir en 60 secondes, en vidéo
            </a>
          </p>
        </div>
      </div>
      <div className="shards" aria-hidden="true">
        <span className="shard shard-a" data-speed="0.6">
          <Shard variant="slab" />
        </span>
        <span className="shard shard-b" data-speed="-0.4">
          <Shard variant="braces" />
        </span>
        <span className="shard shard-c" data-speed="1">
          <Shard variant="thin" />
        </span>
      </div>
      <figure className="strip">
        <ul>
          {WECODE_PHOTOS.map((p) => (
            <li key={p.src}>
              <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
        <figcaption>Remise des attestations WeCode, Abidjan</figcaption>
      </figure>
    </Chapter>
  );
}
