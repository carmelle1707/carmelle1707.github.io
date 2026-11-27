import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Html, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { LAYERS, PROJECTS, STEPS } from "../content/site";
import { getStage, setStage, useStage, type StageState } from "../state/store";
import { POSES, SLAB, slabY, type Pose } from "./poses";

const ACCUEIL: StageState = { section: "accueil", layer: null, project: "", step: null };
const NARROW_POSE: Pose = { camera: [6.5, 4.8, 7.4], target: [0, 1.1, 0], spread: 0 };
import type { ScenePalette } from "./palette";

type Props = { palette: ScenePalette; reduced: boolean; labels: boolean; interactive: boolean };

/** Quelles plaques sont allumées (pleines) et lesquelles portent l'or, selon la section lue. */
function highlight(i: number, s: StageState): { lit: boolean; gold: boolean } {
  switch (s.section) {
    case "parcours":
      return { lit: true, gold: i === 0 };
    case "competences":
      return { lit: true, gold: s.layer !== null && LAYERS[i].id === s.layer };
    case "projets": {
      const project = PROJECTS.find((p) => p.slug === s.project);
      if (!project || project.layers.length === 0) return { lit: true, gold: false };
      const used = project.layers.includes(LAYERS[i].id);
      return { lit: used, gold: used };
    }
    case "etapes":
      return { lit: true, gold: s.step === i };
    default:
      return { lit: true, gold: false };
  }
}

/** Amortit `value` vers `target` ; renvoie vrai tant que la valeur bouge encore. */
function approach(obj: { v: number }, target: number, lambda: number, delta: number) {
  obj.v = THREE.MathUtils.damp(obj.v, target, lambda, delta);
  if (Math.abs(obj.v - target) < 0.0008) {
    obj.v = target;
    return false;
  }
  return true;
}

function CameraRig({ reduced, wide }: { reduced: boolean; wide: boolean }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const look = useRef(new THREE.Vector3(...POSES.accueil.target));
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    // Sur mobile, la tour ne vit que dans l'accueil : vue d'ensemble fixe, centrée.
    const pose = wide ? POSES[getStage().section] : NARROW_POSE;
    goalPos.set(...pose.camera);
    goalLook.set(...pose.target);
    const lambda = reduced ? 1000 : 2.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.z, lambda, delta);
    look.current.lerp(goalLook, 1 - Math.exp(-lambda * delta));
    camera.lookAt(look.current);
    if (camera.position.distanceTo(goalPos) > 0.002 || look.current.distanceTo(goalLook) > 0.002) invalidate();
  });
  return null;
}

function Slab({ index, palette, reduced, interactive }: { index: number } & Omit<Props, "labels">) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const edges = useRef<THREE.LineBasicMaterial>(null);
  const y = useRef({ v: slabY(index, 0) });
  const opacity = useRef({ v: 1 });
  const goldMix = useRef({ v: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const base = useMemo(() => new THREE.Color(palette.edge), [palette.edge]);
  const gold = useMemo(() => new THREE.Color(palette.gold), [palette.gold]);
  const slab = useMemo(() => new THREE.Color(palette.slab), [palette.slab]);
  // Une plaque mise en avant prend une teinte dorée pâle : visible sans devenir un aplat de couleur.
  const slabGold = useMemo(() => new THREE.Color(palette.slab).lerp(new THREE.Color(palette.gold), palette.goldTint), [palette]);
  const layer = LAYERS[index];

  useFrame((_, delta) => {
    // Sur mobile, la tour reste dans l'accueil : elle ne suit pas la section lue.
    const s = interactive ? getStage() : ACCUEIL;
    const { lit, gold: isGold } = highlight(index, s);
    const lambda = reduced ? 1000 : 3.2;
    let moving = approach(y.current, slabY(index, POSES[s.section].spread), lambda, delta);
    moving = approach(opacity.current, lit ? 1 : 0.16, lambda, delta) || moving;
    moving = approach(goldMix.current, isGold ? 1 : 0, lambda * 1.4, delta) || moving;
    if (group.current) group.current.position.y = y.current.v;
    if (material.current) {
      material.current.opacity = opacity.current.v;
      material.current.color.copy(slab).lerp(slabGold, goldMix.current.v);
      material.current.depthWrite = opacity.current.v > 0.99;
    }
    if (edges.current) {
      edges.current.color.copy(base).lerp(gold, goldMix.current.v);
      edges.current.opacity = Math.max(opacity.current.v, 0.35);
    }
    if (moving) invalidate();
  });

  const pick = () => {
    if (interactive && getStage().section === "competences") setStage({ layer: layer.id });
  };

  return (
    <group ref={group} position={[0, y.current.v, 0]}>
      <RoundedBox
        args={[SLAB.width, SLAB.height, SLAB.depth]}
        radius={0.045}
        smoothness={3}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          pick();
          if (interactive && getStage().section === "competences") document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
        onClick={pick}
      >
        <meshStandardMaterial ref={material} color={palette.slab} roughness={0.92} metalness={0} transparent />
        <Edges threshold={20}>
          <lineBasicMaterial ref={edges} color={palette.edge} transparent />
        </Edges>
      </RoundedBox>
    </group>
  );
}

/**
 * Le flux : une colonne sur le flanc de la pile, et une impulsion dorée qui la descend
 * puis la remonte (une requête et sa réponse) à chaque changement de section, de couche ou de projet.
 */
function Flow({ palette, reduced, interactive }: { palette: ScenePalette; reduced: boolean; interactive: boolean }) {
  const pulse = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  // Sur le flanc droit, détachée de la pile : on la lit comme une conduite, pas comme une arête.
  const x = SLAB.width / 2 + 0.4;
  const z = SLAB.depth / 2 - 0.35;
  const top = slabY(LAYERS.length - 1, 0) + 0.5;
  const riser = useRef<THREE.Mesh>(null);
  const height = useRef({ v: top });
  const current = useStage((s) => s.section);
  // Sur mobile, la tour reste dans l'accueil : ni la colonne ni l'impulsion ne suivent la lecture.
  const section = interactive ? current : "accueil";

  // La colonne suit la hauteur de la pile quand les plaques s'écartent.
  useFrame((_, delta) => {
    const goal = slabY(LAYERS.length - 1, POSES[interactive ? getStage().section : "accueil"].spread) + 0.5;
    const moving = approach(height.current, goal, reduced ? 1000 : 3.2, delta);
    if (riser.current) {
      riser.current.scale.y = height.current.v / top;
      riser.current.position.y = height.current.v / 2;
    }
    if (moving) invalidate();
  });
  const project = useStage((s) => s.project);
  const layer = useStage((s) => s.layer);

  useEffect(() => {
    const mesh = pulse.current;
    if (!mesh || reduced) return;
    const spread = POSES[section].spread;
    const high = slabY(LAYERS.length - 1, spread) + 0.3;
    const material = mesh.material as THREE.MeshBasicMaterial;
    const tl = gsap.timeline({ onUpdate: invalidate });
    tl.set(mesh.position, { y: high })
      .set(material, { opacity: 0 })
      .to(material, { opacity: 1, duration: 0.18 })
      .to(mesh.position, { y: SLAB.height / 2, duration: 0.7, ease: "power2.in" })
      .to(mesh.position, { y: high, duration: 0.7, ease: "power2.out" })
      .to(material, { opacity: 0, duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [section, project, layer, reduced, invalidate]);

  return (
    <group position={[x, 0, z]}>
      <mesh ref={riser} position={[0, top / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, top, 6]} />
        <meshBasicMaterial color={palette.steel} transparent opacity={0.45} />
      </mesh>
      <mesh ref={pulse} position={[0, top, 0]}>
        <capsuleGeometry args={[0.03, 0.26, 4, 8]} />
        <meshBasicMaterial color={palette.gold} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** Annotations façon plan d'architecte : un trait bleu acier et un nom, à gauche de chaque plaque. */
function Labels({ palette }: { palette: ScenePalette }) {
  const section = useStage((s) => s.section);
  const layer = useStage((s) => s.layer);
  const step = useStage((s) => s.step);
  if (section !== "accueil" && section !== "competences" && section !== "etapes") return null;
  const spread = POSES[section].spread;
  const left = -SLAB.width / 2;
  return (
    <group>
      {LAYERS.map((l, i) => {
        const y = slabY(i, spread);
        // Sur les étapes, l'année seule : la ligne de la frise donne le reste.
        const text = section === "etapes" ? STEPS[i].period.split(",")[0] || "à compléter" : l.name;
        const active = section === "competences" ? layer === l.id : step === i;
        return (
          <group key={l.id}>
            <Line
              points={[
                [left - 0.08, y, SLAB.depth / 2],
                [left - 0.9, y, SLAB.depth / 2],
              ]}
              color={active ? palette.gold : palette.steel}
              lineWidth={1}
            />
            <Html position={[left - 0.95, y, SLAB.depth / 2]} center={false} zIndexRange={[10, 0]}>
              <span className={`annotation${active ? " is-active" : ""}`} aria-hidden="true">
                {text}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function Tower({ palette, reduced, labels, interactive }: Props) {
  return (
    <>
      <CameraRig reduced={reduced} wide={interactive} />
      <hemisphereLight args={["#ffffff", "#c9d1dd", 1.6]} />
      <directionalLight position={[6, 10, 5]} intensity={1.9} />
      <directionalLight position={[-6, 4, -3]} intensity={0.4} />
      <group>
        {LAYERS.map((l, i) => (
          <Slab key={l.id} index={i} palette={palette} reduced={reduced} interactive={interactive} />
        ))}
        <Flow palette={palette} reduced={reduced} interactive={interactive} />
        {labels && <Labels palette={palette} />}
      </group>
      <ContactShadows position={[0, 0, 0]} opacity={0.32} scale={12} blur={2.6} far={6} color={palette.shadow} />
    </>
  );
}
