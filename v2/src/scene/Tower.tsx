import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Html, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { LAYERS, PROJECTS, STEPS } from "../content/site";
import { getStage, setStage, useStage, type StageState } from "../state/store";
import { POSES, SLAB, slabY, type Pose } from "./poses";
import type { ScenePalette } from "./palette";

const ACCUEIL: StageState = { section: "accueil", layer: null, project: "", step: null };
const NARROW_POSE: Pose = { camera: [6.5, 4.8, 7.4], target: [0, 1.1, 0], spread: 0 };

/** Paquets de données qui remontent la colonne : leur hauteur, lue par les plaques qu'ils traversent. */
const PACKETS = 3;
const packetY: number[] = Array(PACKETS).fill(-10);

type Props = {
  palette: ScenePalette;
  reduced: boolean;
  labels: boolean;
  interactive: boolean;
  /** Vrai une fois l'écran de démarrage parti : la tour peut s'assembler. */
  started: boolean;
};

type Place = { x: number; y: number; z: number; lit: boolean; gold: boolean };

/** Où se tient chaque plaque, et comment elle est mise en avant, selon la section lue. */
function place(i: number, s: StageState): Place {
  const spread = POSES[s.section].spread;
  let y = slabY(i, spread);
  let x = 0;
  let z = 0;
  let lit = true;
  let gold = false;
  switch (s.section) {
    case "parcours":
      gold = i === 0;
      break;
    case "competences":
      gold = s.layer !== null && LAYERS[i].id === s.layer;
      // La couche choisie sort de la pile comme un tiroir.
      if (gold) z = 0.75;
      break;
    case "projets": {
      const project = PROJECTS.find((p) => p.slug === s.project);
      if (!project || project.layers.length === 0) break;
      // La tour se reconstruit avec les seules couches du projet ; les autres glissent hors de la pile.
      const used = LAYERS.map((l, k) => ({ id: l.id, k })).filter((o) => project.layers.includes(o.id));
      const rank = used.findIndex((o) => o.k === i);
      if (rank >= 0) {
        y = slabY(rank, spread);
        gold = true;
      } else {
        lit = false;
        x = -(SLAB.width + 0.9);
      }
      break;
    }
    case "etapes":
      gold = s.step === i;
      break;
  }
  return { x, y, z, lit, gold };
}

/** Haut de la pile visible : la colonne de flux s'arrête là. */
function stackTop(s: StageState) {
  let top = 0;
  LAYERS.forEach((_, i) => {
    const p = place(i, s);
    if (p.lit) top = Math.max(top, p.y);
  });
  return top + 0.5;
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

/**
 * La tour pivote doucement sur elle-même, suit le curseur, et se fait tourner à la souris
 * (elle revient ensuite d'elle-même face à la lecture).
 */
function Spin({ children, reduced, interactive }: { children: ReactNode; reduced: boolean; interactive: boolean }) {
  const group = useRef<THREE.Group>(null);
  const el = useThree((s) => s.gl.domElement);
  const pointer = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, base: 0, yaw: 0, vel: 0, lastX: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (!interactive) return () => window.removeEventListener("pointermove", onMove);

    const d = drag.current;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      d.active = true;
      d.startX = d.lastX = e.clientX;
      d.base = d.yaw;
      d.vel = 0;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!d.active) return;
      d.yaw = d.base + (e.clientX - d.startX) * 0.012;
      d.vel = (e.clientX - d.lastX) * 0.012;
      d.lastX = e.clientX;
    };
    const up = (e: PointerEvent) => {
      if (!d.active) return;
      d.active = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.style.cursor = "";
    };
  }, [reduced, interactive, el]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reduced) return;
    const d = drag.current;
    if (!d.active) {
      // L'élan du lancer, puis le retour en douceur vers la vue de la section.
      d.yaw += d.vel;
      d.vel *= Math.exp(-5 * delta);
      d.yaw = THREE.MathUtils.damp(d.yaw, 0, 0.9, delta);
    }
    const idle = Math.sin(state.clock.elapsedTime * 0.35) * 0.09;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idle + pointer.current.x * 0.16 + d.yaw, 5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.current.y * 0.035, 4, delta);
  });

  return <group ref={group}>{children}</group>;
}

function Slab({ index, palette, reduced, interactive, started }: { index: number } & Omit<Props, "labels">) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const edges = useRef<THREE.LineBasicMaterial>(null);
  const first = place(index, ACCUEIL);
  const x = useRef({ v: 0 });
  const y = useRef({ v: first.y });
  const z = useRef({ v: 0 });
  const opacity = useRef({ v: 1 });
  const goldMix = useRef({ v: 0 });
  const lift = useRef({ v: 0 });
  const hovered = useRef(false);
  // Assemblage : chaque plaque tombe d'en haut et se pose sur la précédente, avec un éclair doré à l'impact.
  const drop = useRef({ v: reduced ? 0 : 7 + index * 0.8 });
  const appear = useRef({ v: reduced ? 1 : 0 });
  const flash = useRef({ v: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const base = useMemo(() => new THREE.Color(palette.edge), [palette.edge]);
  const gold = useMemo(() => new THREE.Color(palette.gold), [palette.gold]);
  const slab = useMemo(() => new THREE.Color(palette.slab), [palette.slab]);
  // Une plaque mise en avant prend une teinte dorée pâle : visible sans devenir un aplat de couleur.
  const slabGold = useMemo(
    () => new THREE.Color(palette.slab).lerp(new THREE.Color(palette.gold), palette.goldTint),
    [palette],
  );
  const layer = LAYERS[index];

  useEffect(() => {
    if (reduced || !started) return;
    const tl = gsap.timeline({ delay: 0.15 + index * 0.16, onUpdate: invalidate });
    tl.to(appear.current, { v: 1, duration: 0.25, ease: "none" }, 0)
      .to(drop.current, { v: 0, duration: 0.85, ease: "bounce.out" }, 0)
      .set(flash.current, { v: 1 }, 0.38);
    return () => {
      tl.progress(1).kill();
    };
  }, [started, reduced, index, invalidate]);

  useFrame((_, delta) => {
    // Sur mobile, la tour reste dans l'accueil : elle ne suit pas la section lue.
    const s = interactive ? getStage() : ACCUEIL;
    const p = place(index, s);
    const lambda = reduced ? 1000 : 3.2;
    let moving = approach(y.current, p.y, lambda, delta);
    moving = approach(x.current, p.x, lambda * 0.8, delta) || moving;
    moving = approach(z.current, p.z, lambda * 1.2, delta) || moving;
    moving = approach(opacity.current, p.lit ? 1 : 0, lambda, delta) || moving;
    moving = approach(goldMix.current, p.gold ? 1 : 0, lambda * 1.4, delta) || moving;
    moving = approach(lift.current, hovered.current && interactive ? 0.14 : 0, lambda * 2, delta) || moving;
    flash.current.v = THREE.MathUtils.damp(flash.current.v, 0, 2.6, delta);

    // Un paquet de données qui passe à la hauteur de la plaque l'allume brièvement.
    let glow = 0;
    for (const py of packetY) glow = Math.max(glow, Math.exp(-((py - y.current.v) ** 2) / 0.03));
    const spark = Math.max(flash.current.v, glow * 0.75);

    if (group.current) {
      group.current.position.set(x.current.v, y.current.v + drop.current.v + lift.current.v, z.current.v);
      group.current.visible = appear.current.v > 0.01 && opacity.current.v > 0.01;
    }
    const alpha = opacity.current.v * appear.current.v;
    if (material.current) {
      material.current.opacity = alpha;
      material.current.color.copy(slab).lerp(slabGold, Math.max(goldMix.current.v, flash.current.v * 0.6));
      material.current.depthWrite = alpha > 0.99;
    }
    if (edges.current) {
      edges.current.color.copy(base).lerp(gold, Math.max(goldMix.current.v, spark));
      edges.current.opacity = alpha;
    }
    if (moving || drop.current.v > 0) invalidate();
  });

  const pick = () => {
    if (interactive && getStage().section === "competences") setStage({ layer: layer.id });
  };

  return (
    <group ref={group} position={[0, first.y + drop.current.v, 0]} visible={reduced}>
      <RoundedBox
        args={[SLAB.width, SLAB.height, SLAB.depth]}
        radius={0.045}
        smoothness={3}
        castShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          pick();
        }}
        onPointerOut={() => {
          hovered.current = false;
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
 * Le flux : une colonne sur le flanc de la pile. Des paquets dorés la remontent en continu,
 * et une impulsion la descend puis la remonte (une requête, sa réponse) à chaque changement de lecture.
 */
function Flow({ palette, reduced, interactive, started }: Omit<Props, "labels">) {
  const pulse = useRef<THREE.Mesh>(null);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);
  // Sur le flanc droit, détachée de la pile : on la lit comme une conduite, pas comme une arête.
  const x = SLAB.width / 2 + 0.4;
  const z = SLAB.depth / 2 - 0.35;
  const full = stackTop(ACCUEIL);
  const riser = useRef<THREE.Mesh>(null);
  const height = useRef({ v: reduced ? full : 0 });
  const current = useStage((s) => s.section);
  const project = useStage((s) => s.project);
  const layer = useStage((s) => s.layer);
  // Sur mobile, la tour reste dans l'accueil : ni la colonne ni l'impulsion ne suivent la lecture.
  const section = interactive ? current : "accueil";

  useFrame((state, delta) => {
    const s = interactive ? getStage() : ACCUEIL;
    // La colonne pousse avec l'assemblage, puis suit la hauteur de la pile.
    const goal = started || reduced ? stackTop(s) : 0;
    const moving = approach(height.current, goal, reduced ? 1000 : 1.6, delta);
    const h = height.current.v;
    if (riser.current) {
      riser.current.scale.y = Math.max(h, 0.001) / full;
      riser.current.position.y = h / 2;
    }
    // Paquets en continu, régulièrement espacés, qui s'estompent en bas et en haut de la colonne.
    for (let k = 0; k < PACKETS; k++) {
      const mesh = packets.current[k];
      if (!mesh) continue;
      if (reduced || h < 0.4) {
        mesh.visible = false;
        packetY[k] = -10;
        continue;
      }
      const phase = (state.clock.elapsedTime * 0.32 + k / PACKETS) % 1;
      const py = phase * h;
      mesh.visible = true;
      mesh.position.y = py;
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * 0.9;
      packetY[k] = py;
    }
    if (moving) invalidate();
  });

  useEffect(() => {
    const mesh = pulse.current;
    if (!mesh || reduced || !started) return;
    const high = stackTop(interactive ? getStage() : ACCUEIL) - 0.2;
    const material = mesh.material as THREE.MeshBasicMaterial;
    const tl = gsap.timeline({ onUpdate: invalidate, delay: 0.2 });
    tl.set(mesh.position, { y: high })
      .set(material, { opacity: 0 })
      .to(material, { opacity: 1, duration: 0.18 })
      .to(mesh.position, { y: SLAB.height / 2, duration: 0.7, ease: "power2.in" })
      .to(mesh.position, { y: high, duration: 0.7, ease: "power2.out" })
      .to(material, { opacity: 0, duration: 0.25 });
    return () => {
      tl.kill();
    };
  }, [section, project, layer, reduced, started, interactive, invalidate]);

  return (
    <group position={[x, 0, z]}>
      <mesh ref={riser} position={[0, full / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, full, 6]} />
        <meshBasicMaterial color={palette.steel} transparent opacity={0.45} />
      </mesh>
      {Array.from({ length: PACKETS }, (_, k) => (
        <mesh
          key={k}
          ref={(m) => {
            packets.current[k] = m;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={palette.gold} transparent opacity={0} />
        </mesh>
      ))}
      <mesh ref={pulse} position={[0, full, 0]}>
        <capsuleGeometry args={[0.03, 0.26, 4, 8]} />
        <meshBasicMaterial color={palette.gold} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** Annotations façon plan d'architecte : un trait bleu acier et un nom, à gauche de chaque plaque. */
function Labels({ palette, started, reduced }: { palette: ScenePalette; started: boolean; reduced: boolean }) {
  const section = useStage((s) => s.section);
  const layer = useStage((s) => s.layer);
  const step = useStage((s) => s.step);
  // Les annotations arrivent une fois la pile posée, pas pendant la chute.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!started) return;
    const t = window.setTimeout(() => setShown(true), reduced ? 0 : 1300);
    return () => window.clearTimeout(t);
  }, [started, reduced]);
  if (!shown) return null;
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

export function Tower({ palette, reduced, labels, interactive, started }: Props) {
  // En mouvement réduit, la tour est déjà assemblée : pas d'attente.
  const ready = started || reduced;
  return (
    <>
      <CameraRig reduced={reduced} wide={interactive} />
      <hemisphereLight args={["#ffffff", "#c9d1dd", 1.6]} />
      <directionalLight position={[6, 10, 5]} intensity={1.9} />
      <directionalLight position={[-6, 4, -3]} intensity={0.4} />
      <Spin reduced={reduced} interactive={interactive}>
        {LAYERS.map((l, i) => (
          <Slab key={l.id} index={i} palette={palette} reduced={reduced} interactive={interactive} started={ready} />
        ))}
        <Flow palette={palette} reduced={reduced} interactive={interactive} started={ready} />
        {labels && <Labels palette={palette} started={ready} reduced={reduced} />}
      </Spin>
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.32}
        scale={12}
        blur={2.6}
        far={6}
        resolution={256}
        color={palette.shadow}
      />
    </>
  );
}
