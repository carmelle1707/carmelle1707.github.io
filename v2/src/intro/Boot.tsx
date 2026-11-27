import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Props = {
  /** Étapes réelles du chargement : polices, scène 3D téléchargée, première image calculée. */
  fonts: boolean;
  scene: boolean;
  frame: boolean;
  onDone: () => void;
};

const LINES = [
  { key: "fonts", text: "polices" },
  { key: "scene", text: "scène 3D" },
  { key: "frame", text: "première image" },
] as const;

/**
 * CARMELLE.EXE : l'écran de démarrage. Chaque ligne passe à « ok » quand l'étape
 * correspondante est vraiment terminée, puis le panneau se lève. Passable à tout moment.
 */
export function Boot({ fonts, scene, frame, onDone }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const [leaving, setLeaving] = useState(false);
  const status = { fonts, scene, frame };
  const ready = fonts && scene && frame;

  useEffect(() => {
    skip.current?.focus();
  }, []);

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    const el = panel.current;
    if (!el) return onDone();
    gsap.to(el, { yPercent: -100, duration: 0.7, ease: "power3.inOut", onComplete: onDone });
  };

  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(leave, 450);
    return () => window.clearTimeout(t);
    // leave ne change pas d'identité utile ici : on ne réagit qu'à « tout est prêt ».
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Filet de sécurité : jamais plus de 6 s d'écran de démarrage.
  useEffect(() => {
    const t = window.setTimeout(leave, 6000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={panel} className="boot keep-motion" role="dialog" aria-modal="true" aria-label="Chargement du portfolio">
      <div className="boot-inner">
        <p className="boot-title">CARMELLE.EXE</p>
        <ol className="boot-lines" aria-live="polite">
          {LINES.map((l) => (
            <li key={l.key}>
              <span>{l.text}</span>
              <span className="boot-dots" aria-hidden="true" />
              <span className={status[l.key] ? "boot-ok" : "boot-wait"}>{status[l.key] ? "ok" : "en cours"}</span>
            </li>
          ))}
        </ol>
        <button ref={skip} type="button" className="boot-skip" onClick={leave}>
          Passer l'intro
        </button>
      </div>
    </div>
  );
}
