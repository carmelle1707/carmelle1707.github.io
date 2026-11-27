import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Tower } from "./Tower";
import { DARK, LIGHT } from "./palette";
import { POSES } from "./poses";

type Props = {
  reduced: boolean;
  /** Écran large : annotations et plaques cliquables. */
  wide: boolean;
  onReady: () => void;
  /** L'appareil n'arrive pas à suivre : on passe à l'image fixe. */
  onDecline: () => void;
};

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

/** Chargé à part (import dynamique) : le texte s'affiche avant que Three.js n'arrive. */
export default function Stage({ reduced, wide, onReady, onDecline }: Props) {
  const dark = useDarkScheme();
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      frameloop="demand"
      flat
      dpr={dpr}
      camera={{ position: POSES.accueil.camera, fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        flipflops={3}
        onFallback={onDecline}
      />
      <Tower palette={dark ? DARK : LIGHT} reduced={reduced} labels={wide} interactive={wide} />
    </Canvas>
  );
}
