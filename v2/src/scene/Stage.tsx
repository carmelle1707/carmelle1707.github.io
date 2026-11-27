import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Tower } from "./Tower";
import { DARK, LIGHT, NIGHT } from "./palette";
import { introPose } from "./poses";

type Props = {
  reduced: boolean;
  /** Écran large : annotations et tour sur le côté ; sinon la tour vit en haut de l'écran. */
  wide: boolean;
  /** L'écran de démarrage est encore là : l'assemblage de la tour attend sa sortie. */
  waiting: boolean;
  onReady: () => void;
  /** L'appareil n'arrive pas à suivre : on passe à l'image fixe. */
  onDecline: () => void;
};

type Loop = "always" | "demand" | "never";

/** En développement seulement : `?keep3d` garde la scène même sur un navigateur de test trop lent (rendu logiciel). */
const keep3d = import.meta.env.DEV && typeof location !== "undefined" && location.search.includes("keep3d");

function useDarkScheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return dark;
}

/**
 * La tour vit en continu (flux de données, oscillation), mais seulement quand on la voit :
 * onglet caché, ou sur téléphone quand un panneau de texte la recouvre entièrement, plus aucune image n'est calculée.
 */
function Pauser({ reduced, wide, onLoop }: { reduced: boolean; wide: boolean; onLoop: (l: Loop) => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (reduced) {
      onLoop("demand");
      // En mouvement réduit, une image par défilement suffit : la tour change de pose, sans animation.
      const onScroll = () => invalidate();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const windows = new Set<Element>();
    let visible = !document.hidden;
    // Sur grand écran la tour est toujours visible ; sur téléphone, seulement à travers les fenêtres.
    const targets = wide ? [] : Array.from(document.querySelectorAll("[data-window]"));
    const apply = () => onLoop(visible && (targets.length === 0 || windows.size > 0) ? "always" : "never");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) windows.add(e.target);
        else windows.delete(e.target);
      }
      apply();
    });
    targets.forEach((t) => io.observe(t));
    const onVisibility = () => {
      visible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);
    apply();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, wide, onLoop, invalidate]);
  return null;
}

/** Chargé à part (import dynamique) : le texte s'affiche avant que Three.js n'arrive. */
export default function Stage({ reduced, wide, waiting, onReady, onDecline }: Props) {
  const dark = useDarkScheme();
  const [dpr, setDpr] = useState(() => Math.min(1.5, typeof window === "undefined" ? 1 : window.devicePixelRatio));
  const [loop, setLoop] = useState<Loop>(reduced ? "demand" : "always");
  return (
    <Canvas
      frameloop={loop}
      flat
      dpr={dpr}
      camera={{ position: introPose(wide).camera, fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <Pauser reduced={reduced} wide={wide} onLoop={setLoop} />
      {/* Sous 24 images/s on allège (résolution 1), et seul un appareil qui n'y arrive vraiment pas passe à l'image fixe. */}
      <PerformanceMonitor bounds={() => [24, 50]} onDecline={() => setDpr(1)} flipflops={6} onFallback={keep3d ? undefined : onDecline} />
      <Tower day={dark ? DARK : LIGHT} night={NIGHT} reduced={reduced} wide={wide} started={!waiting} />
    </Canvas>
  );
}
