import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Tower } from "./Tower";
import { DARK, LIGHT } from "./palette";
import { POSES } from "./poses";

type Props = {
  reduced: boolean;
  /** Écran large : annotations, plaques cliquables, tour qu'on fait pivoter. */
  wide: boolean;
  /** L'écran de démarrage est encore là : l'assemblage de la tour attend sa sortie. */
  waiting: boolean;
  onReady: () => void;
  /** L'appareil n'arrive pas à suivre : on passe à l'image fixe. */
  onDecline: () => void;
};

type Loop = "always" | "demand" | "never";

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
 * hors de l'écran ou onglet caché, plus aucune image n'est calculée.
 */
function Pauser({ reduced, onLoop }: { reduced: boolean; onLoop: (l: Loop) => void }) {
  const el = useThree((s) => s.gl.domElement);
  useEffect(() => {
    if (reduced) {
      onLoop("demand");
      return;
    }
    let inView = true;
    let visible = !document.hidden;
    const apply = () => onLoop(inView && visible ? "always" : "never");
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      apply();
    });
    io.observe(el);
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
  }, [reduced, el, onLoop]);
  return null;
}

/** Chargé à part (import dynamique) : le texte s'affiche avant que Three.js n'arrive. */
export default function Stage({ reduced, wide, waiting, onReady, onDecline }: Props) {
  const dark = useDarkScheme();
  const [dpr, setDpr] = useState(1.5);
  const [loop, setLoop] = useState<Loop>(reduced ? "demand" : "always");
  return (
    <Canvas
      frameloop={loop}
      flat
      dpr={dpr}
      camera={{ position: POSES.accueil.camera, fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <Pauser reduced={reduced} onLoop={setLoop} />
      {/* Sous 24 images/s on allège (résolution 1), et seul un appareil qui n'y arrive vraiment pas passe à l'image fixe. */}
      <PerformanceMonitor bounds={() => [24, 50]} onDecline={() => setDpr(1)} flipflops={6} onFallback={onDecline} />
      <Tower
        palette={dark ? DARK : LIGHT}
        reduced={reduced}
        labels={wide}
        interactive={wide}
        started={!waiting}
      />
    </Canvas>
  );
}
