import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Html, Line, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { CHAPTERS, LAYERS, PROJECTS, type SectionId } from "../content/site";
import { getStage, useStage } from "../state/store";
import { pointer, scroll } from "../motion/scroll";
import { SLAB, introPose, mix, poseFor, projectPagePose, slabY, type Pose } from "./poses";
import type { ScenePalette } from "./palette";
import { Book } from "./book/Book";

/** Paquets de données qui remontent la colonne : leur hauteur, lue par les plaques qu'ils traversent. */
const PACKETS = 3;
const packetY: number[] = Array(PACKETS).fill(-10);

/** Valeurs vivantes partagées par les éléments de la scène, mises à jour à chaque image par la caméra. */
const live = { spread: 0, night: 0 };

type Props = {
  day: ScenePalette;
  night: ScenePalette;
  reduced: boolean;
  wide: boolean;
  /** Vrai une fois l'écran de démarrage parti : la tour peut s'assembler. */
  started: boolean;
};

type Place = { x: number; y: number; z: number; alpha: number; gold: boolean };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Le chapitre lu et l'avancée dedans ; sur la page d'un projet, la tour reste sur « projets ». */
function reading(): { id: SectionId; t: number } {
  if (scroll.page === "project") return { id: "projets", t: 0 };
  return { id: scroll.active, t: scroll.local[scroll.active] };
}

/** Nombre de plaques posées pendant le parcours : la tour se reconstruit au fil des années. */
const builtAt = (t: number) => Math.min(LAYERS.length, Math.max(0, Math.floor(((t - 0.18) / 0.62) * (LAYERS.length + 1))));

/** Index de la couche ouverte dans les compétences (la couche du haut par défaut). */
function layerIndex() {
  const i = LAYERS.findIndex((l) => l.id === getStage().layer);
  return i < 0 ? LAYERS.length - 1 : i;
}

/** Où se tient chaque plaque, et comment elle est mise en avant, selon le chapitre lu. */
function place(i: number): Place {
  const { id, t } = reading();
  const s = getStage();
  let y = slabY(i, live.spread);
  const x = 0;
  let z = 0;
  let alpha = 1;
  let gold = false;
  switch (id) {
    case "parcours": {
      const built = builtAt(t);
      if (i >= built) {
        // Pas encore posée : elle attend au-dessus, pâle, et descend quand son année arrive.
        y += 3.2 + (i - built) * 0.55;
        alpha = 0.1;
      }
      gold = i === built - 1;
      break;
    }
    case "competences":
      gold = i === layerIndex();
      // La couche lue sort de la pile comme un tiroir.
      if (gold) z = 0.75;
      break;
    case "projets": {
      // Le livre est posé sur la tour : elle reste entière, et les couches du projet ouvert s'allument.
      const project = PROJECTS.find((p) => p.slug === s.project);
      gold = !!project && project.layers.includes(LAYERS[i].id);
      break;
    }
  }
  return { x, y, z, alpha, gold };
}

/** Le dessus de la plaque du haut : le livre s'y pose, même pendant que la pile se resserre. */
const bookTop = () => slabY(LAYERS.length - 1, live.spread) + SLAB.height / 2;

/** Haut de la pile visible : la colonne de flux s'arrête là. */
function stackTop() {
  let top = 0;
  LAYERS.forEach((_, i) => {
    const p = place(i);
    if (p.alpha > 0.5) top = Math.max(top, p.y);
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

/** La pose voulue à cet instant : celle du chapitre, fondue avec la précédente en début de chapitre. */
function targetPose(wide: boolean, height: number): Pose {
  let pose: Pose;
  if (scroll.page === "project") pose = projectPagePose(wide);
  else {
    const id = scroll.active;
    const k = CHAPTERS.indexOf(id);
    const t = id === "competences" ? (LAYERS.length - 1 - layerIndex()) / (LAYERS.length - 1) : scroll.local[id];
    pose = poseFor(id, t, wide);
    if (k > 0) {
      const blend = clamp01(scroll.px[id] / (height * 0.6));
      if (blend < 1) pose = mix(poseFor(CHAPTERS[k - 1], 1, wide), pose, blend);
    }
  }
  return scroll.intro < 1 ? mix(introPose(wide), pose, scroll.intro) : pose;
}

/**
 * La caméra suit le récit : chaque chapitre a sa pose, et `setViewOffset` place la tour
 * à droite, à gauche ou en haut de l'écran sans déplacer la scène.
 */
function CameraRig({ reduced, wide }: { reduced: boolean; wide: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const start = targetPose(wide, size.height);
  const look = useRef(new THREE.Vector3(...start.target));
  const shift = useRef({ x: start.shift[0], y: start.shift[1] });
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const pose = targetPose(wide, size.height);
    goalPos.set(...pose.camera);
    goalLook.set(...pose.target);
    const lambda = reduced ? 1000 : 3.4;
    const k = 1 - Math.exp(-lambda * delta);
    camera.position.lerp(goalPos, k);
    look.current.lerp(goalLook, k);
    camera.lookAt(look.current);
    shift.current.x = THREE.MathUtils.damp(shift.current.x, pose.shift[0], lambda, delta);
    shift.current.y = THREE.MathUtils.damp(shift.current.y, pose.shift[1], lambda, delta);
    camera.setViewOffset(
      size.width,
      size.height,
      -shift.current.x * size.width,
      shift.current.y * size.height,
      size.width,
      size.height,
    );
    live.spread = THREE.MathUtils.damp(live.spread, pose.spread, lambda, delta);
    live.night = THREE.MathUtils.damp(live.night, scroll.night, reduced ? 1000 : 6, delta);
    if (
      camera.position.distanceTo(goalPos) > 0.002 ||
      look.current.distanceTo(goalLook) > 0.002 ||
      Math.abs(live.spread - pose.spread) > 0.001
    )
      invalidate();
  });
  return null;
}

/** La tour oscille doucement et s'incline vers le curseur ; la lumière principale le suit aussi. */
function Spin({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g || reduced) return;
    // Pendant la lecture du livre, la tour se tient presque immobile : on tourne des pages, pas la sculpture.
    const k = scroll.active === "projets" && scroll.page === "home" ? 0.25 : 1;
    const idle = Math.sin(state.clock.elapsedTime * 0.35) * 0.09 * k;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, idle + pointer.x * 0.18 * k, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.y * 0.04 * k, 4, delta);
  });
  return <group ref={group}>{children}</group>;
}

function KeyLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame((_, delta) => {
    const l = light.current;
    if (!l || reduced) return;
    l.position.x = THREE.MathUtils.damp(l.position.x, 6 + pointer.x * 5, 3, delta);
    l.position.y = THREE.MathUtils.damp(l.position.y, 10 - pointer.y * 3, 3, delta);
  });
  return <directionalLight ref={light} position={[6, 10, 5]} intensity={1.9} />;
}

/** Mélange jour → nuit d'une couleur de la palette, selon la part de bleu nuit à l'écran. */
function useMix(day: string, night: string) {
  return useMemo(() => ({ day: new THREE.Color(day), night: new THREE.Color(night) }), [day, night]);
}

function Slab({ index, day, night, reduced, started }: { index: number } & Omit<Props, "wide">) {
  const group = useRef<THREE.Group>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const edges = useRef<THREE.LineBasicMaterial>(null);
  const first = place(index);
  const x = useRef({ v: first.x });
  const y = useRef({ v: first.y });
  const z = useRef({ v: 0 });
  const opacity = useRef({ v: first.alpha });
  const goldMix = useRef({ v: 0 });
  // Assemblage : chaque plaque tombe d'en haut et se pose sur la précédente, avec un éclair doré à l'impact.
  const drop = useRef({ v: reduced ? 0 : 7 + index * 0.8 });
  const appear = useRef({ v: reduced ? 1 : 0 });
  const flash = useRef({ v: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const slab = useMix(day.slab, night.slab);
  const edge = useMix(day.edge, night.edge);
  const gold = useMix(day.gold, night.gold);
  const tint = useMemo(
    () => ({
      day: new THREE.Color(day.slab).lerp(new THREE.Color(day.gold), day.goldTint),
      night: new THREE.Color(night.slab).lerp(new THREE.Color(night.gold), night.goldTint),
    }),
    [day, night],
  );
  const c = useMemo(() => ({ slab: new THREE.Color(), tint: new THREE.Color(), edge: new THREE.Color(), gold: new THREE.Color() }), []);
  const celebrate = useStage((s) => s.celebrate);

  useEffect(() => {
    if (reduced || !started) return;
    const tl = gsap.timeline({ delay: 0.35 + index * 0.17, onUpdate: invalidate });
    // Chute franche, sans rebond : la plaque se pose comme un bloc de plâtre.
    tl.to(appear.current, { v: 1, duration: 0.2, ease: "none" }, 0)
      .to(drop.current, { v: 0, duration: 0.9, ease: "expo.in" }, 0)
      .set(flash.current, { v: 1 }, 0.9);
    return () => {
      tl.progress(1).kill();
    };
  }, [started, reduced, index, invalidate]);

  // Message envoyé : un éclair doré remonte la pile, de la base au sommet.
  useEffect(() => {
    if (!celebrate) return;
    const t = window.setTimeout(() => {
      flash.current.v = 1;
      invalidate();
    }, index * 110);
    return () => window.clearTimeout(t);
  }, [celebrate, index, invalidate]);

  useFrame((_, delta) => {
    const p = place(index);
    const lambda = reduced ? 1000 : 3.2;
    let moving = approach(y.current, p.y, lambda, delta);
    moving = approach(x.current, p.x, lambda * 0.8, delta) || moving;
    moving = approach(z.current, p.z, lambda * 1.2, delta) || moving;
    moving = approach(opacity.current, p.alpha, lambda, delta) || moving;
    moving = approach(goldMix.current, p.gold ? 1 : 0, lambda * 1.4, delta) || moving;
    if (flash.current.v > 0.001) moving = true;
    flash.current.v = THREE.MathUtils.damp(flash.current.v, 0, 2.6, delta);

    // Un paquet de données qui passe à la hauteur de la plaque l'allume brièvement.
    let glow = 0;
    for (const py of packetY) glow = Math.max(glow, Math.exp(-((py - y.current.v) ** 2) / 0.03));
    const spark = Math.max(flash.current.v, glow * 0.75);

    if (group.current) {
      group.current.position.set(x.current.v, y.current.v + drop.current.v, z.current.v);
      group.current.visible = appear.current.v > 0.01 && opacity.current.v > 0.01;
    }
    const n = live.night;
    c.slab.copy(slab.day).lerp(slab.night, n);
    c.tint.copy(tint.day).lerp(tint.night, n);
    c.edge.copy(edge.day).lerp(edge.night, n);
    c.gold.copy(gold.day).lerp(gold.night, n);
    const alpha = opacity.current.v * appear.current.v;
    if (material.current) {
      material.current.opacity = alpha;
      material.current.color.copy(c.slab).lerp(c.tint, Math.max(goldMix.current.v, flash.current.v * 0.6));
      material.current.depthWrite = alpha > 0.99;
    }
    if (edges.current) {
      edges.current.color.copy(c.edge).lerp(c.gold, Math.max(goldMix.current.v, spark));
      edges.current.opacity = Math.max(alpha, opacity.current.v < 0.5 ? appear.current.v * 0.35 : 0);
    }
    if (moving || drop.current.v > 0) invalidate();
  });

  return (
    <group ref={group} position={[first.x, first.y + drop.current.v, 0]} visible={reduced}>
      <RoundedBox args={[SLAB.width, SLAB.height, SLAB.depth]} radius={0.045} smoothness={3}>
        <meshStandardMaterial ref={material} color={day.slab} roughness={0.92} metalness={0} transparent />
        <Edges threshold={20}>
          <lineBasicMaterial ref={edges} color={day.edge} transparent />
        </Edges>
      </RoundedBox>
    </group>
  );
}

/**
 * Le flux : une colonne sur le flanc de la pile. Des paquets dorés la remontent en continu,
 * et une impulsion la descend puis la remonte (une requête, sa réponse) à chaque changement de lecture.
 */
function Flow({ day, reduced, started }: Omit<Props, "wide" | "night">) {
  const pulse = useRef<THREE.Mesh>(null);
  const packets = useRef<(THREE.Mesh | null)[]>([]);
  const invalidate = useThree((s) => s.invalidate);
  // Sur le flanc droit, détachée de la pile : on la lit comme une conduite, pas comme une arête.
  const x = SLAB.width / 2 + 0.4;
  const z = SLAB.depth / 2 - 0.35;
  const full = slabY(LAYERS.length - 1, 0) + 0.5;
  const riser = useRef<THREE.Mesh>(null);
  const height = useRef({ v: reduced ? full : 0 });
  const section = useStage((s) => s.section);
  const project = useStage((s) => s.project);
  const layer = useStage((s) => s.layer);

  useFrame((state, delta) => {
    // La colonne pousse avec l'assemblage, puis suit la hauteur de la pile.
    const goal = started || reduced ? stackTop() : 0;
    const moving = approach(height.current, goal, reduced ? 1000 : 1.6, delta);
    const h = height.current.v;
    if (riser.current) {
      riser.current.scale.y = Math.max(h, 0.001) / full;
      riser.current.position.y = h / 2;
    }
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
    const high = stackTop() - 0.2;
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
  }, [section, project, layer, reduced, started, invalidate]);

  return (
    <group position={[x, 0, z]}>
      <mesh ref={riser} position={[0, full / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, full, 6]} />
        <meshBasicMaterial color={day.steel} transparent opacity={0.45} />
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
          <meshBasicMaterial color={day.gold} transparent opacity={0} />
        </mesh>
      ))}
      <mesh ref={pulse} position={[0, full, 0]}>
        <capsuleGeometry args={[0.03, 0.26, 4, 8]} />
        <meshBasicMaterial color={day.gold} transparent opacity={0} />
      </mesh>
    </group>
  );
}

/** Annotations façon plan d'architecte : un trait bleu acier et le nom de la couche, à gauche de chaque plaque. */
function Labels({ day, started, reduced }: { day: ScenePalette; started: boolean; reduced: boolean }) {
  const section = useStage((s) => s.section);
  const layer = useStage((s) => s.layer);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const shownAt = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const left = -SLAB.width / 2;
  // Seulement dans les compétences : ailleurs, le texte de la page occupe déjà cette place (nom, frise).
  const mode = section === "competences" ? "name" : null;

  useFrame((state) => {
    if (!started) return;
    if (!shownAt.current) shownAt.current = state.clock.elapsedTime + (reduced ? 0 : 1.9);
    const ready = state.clock.elapsedTime >= shownAt.current && scroll.page === "home";
    LAYERS.forEach((_, i) => {
      const g = groups.current[i];
      const span = spans.current[i];
      if (!g || !span) return;
      const gy = slabY(i, live.spread);
      // Rendu à la demande (mouvement réduit) : une image de plus pour que le texte rejoigne sa plaque.
      if (Math.abs(g.position.y - gy) > 0.0005) invalidate();
      g.position.y = gy;
      const visible = ready && mode !== null && live.night < 0.5;
      span.style.opacity = visible ? "1" : "0";
      // Le trait suit le texte : rien n'est dessiné tant que la pile n'est pas posée.
      g.visible = visible;
    });
  });

  return (
    <group>
      {LAYERS.map((l, i) => {
        const text = l.name;
        const active = section === "competences" && layer === l.id;
        return (
          <group
            key={l.id}
            ref={(g) => {
              groups.current[i] = g;
            }}
          >
            <Line
              points={[
                [left - 0.08, 0, SLAB.depth / 2],
                [left - 0.9, 0, SLAB.depth / 2],
              ]}
              color={active ? day.gold : day.steel}
              lineWidth={1}
              transparent
              opacity={text && mode ? 1 : 0}
            />
            <Html position={[left - 0.95, 0, SLAB.depth / 2]} center={false} zIndexRange={[10, 0]}>
              <span
                ref={(s) => {
                  spans.current[i] = s;
                }}
                className={`annotation${active ? " is-active" : ""}`}
                aria-hidden="true"
                style={{ opacity: 0 }}
              >
                {text}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function Tower({ day, night, reduced, wide, started }: Props) {
  // En mouvement réduit, la tour est déjà assemblée : pas d'attente.
  const ready = started || reduced;
  const shadow = useRef<THREE.Group>(null);

  // La montée de caméra d'ouverture, depuis le pied de la pile jusqu'à la vue d'ensemble.
  useEffect(() => {
    if (reduced) {
      scroll.intro = 1;
      return;
    }
    if (!started) return;
    const tween = gsap.to(scroll, { intro: 1, duration: 2.6, delay: 0.2, ease: "power3.inOut" });
    // On défile déjà : l'ouverture se termine en accéléré plutôt que de laisser la tour hors cadre.
    const hurry = () => {
      if (window.scrollY > 40) tween.timeScale(5);
    };
    hurry();
    window.addEventListener("scroll", hurry, { passive: true });
    return () => {
      window.removeEventListener("scroll", hurry);
      tween.kill();
    };
  }, [started, reduced]);

  return (
    <>
      <CameraRig reduced={reduced} wide={wide} />
      <hemisphereLight args={["#ffffff", "#c9d1dd", 1.6]} />
      <KeyLight reduced={reduced} />
      <directionalLight position={[-6, 4, -3]} intensity={0.4} />
      <Spin reduced={reduced}>
        {LAYERS.map((l, i) => (
          <Slab key={l.id} index={i} day={day} night={night} reduced={reduced} started={ready} />
        ))}
        <Book reduced={reduced} wide={wide} top={bookTop} />
        <Flow day={day} reduced={reduced} started={ready} />
        {wide && <Labels day={day} started={ready} reduced={reduced} />}
      </Spin>
      <group ref={shadow}>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.3}
          scale={12}
          blur={2.6}
          far={6}
          resolution={256}
          color={day.shadow}
        />
      </group>
    </>
  );
}
