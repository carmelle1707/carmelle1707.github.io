import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PROFILE, PROJECTS } from "../../content/site";
import { bookInput, scroll } from "../../motion/scroll";
import { useStage } from "../../state/store";
import { BOOK, BOOK_Y } from "../poses";
import { drawBlank, drawCover, drawSheet, drawShot, makePage, shadowTexture } from "./pages";

/** Subdivisions d'une feuille : 36 le long de la largeur (la courbure), 10 dans la hauteur (la torsion du coin). */
const SX = 36;
const SZ = 10;
/** Épaisseurs : le plat de dos, le bloc de pages, l'écart entre deux feuilles posées. */
const BOARD = 0.03;
const BLOCK = 0.05;
const EPS = 0.0035;
const LEFT_BASE = 0.004;
const COVER = { w: BOOK.width + 0.05, h: BOOK.height + 0.09 };

const INK = "#0f1b2d";
const EDGE = "#e6e9ef";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

type Leaf = {
  front: THREE.BufferGeometry;
  back: THREE.BufferGeometry;
  width: number;
  height: number;
  /** 0 pour la couverture (un carton rigide), 1 pour une page de papier. */
  curl: number;
  shaped: number;
};

/**
 * Une feuille : une grille dont on recalcule les sommets à chaque image où elle tourne.
 * Recto et verso partagent les mêmes positions ; seules leurs coordonnées de texture diffèrent
 * (le verso est lu en miroir, puisqu'il se retrouve à gauche du dos une fois tourné).
 */
function makeLeaf(width: number, height: number, curl: number): Leaf {
  const count = (SX + 1) * (SZ + 1);
  const position = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
  position.setUsage(THREE.DynamicDrawUsage);
  const uvFront = new Float32Array(count * 2);
  const uvBack = new Float32Array(count * 2);
  for (let j = 0; j <= SZ; j++)
    for (let i = 0; i <= SX; i++) {
      const k = j * (SX + 1) + i;
      uvFront[k * 2] = i / SX;
      uvFront[k * 2 + 1] = 1 - j / SZ;
      uvBack[k * 2] = 1 - i / SX;
      uvBack[k * 2 + 1] = 1 - j / SZ;
    }
  const index: number[] = [];
  for (let j = 0; j < SZ; j++)
    for (let i = 0; i < SX; i++) {
      const a = j * (SX + 1) + i;
      const b = a + 1;
      const c = a + SX + 1;
      const d = c + 1;
      // Sens de parcours choisi pour que le recto regarde vers le haut quand la feuille est posée à droite.
      index.push(a, c, b, b, c, d);
    }
  const front = new THREE.BufferGeometry();
  front.setAttribute("position", position);
  front.setAttribute("uv", new THREE.BufferAttribute(uvFront, 2));
  front.setIndex(index);
  const back = new THREE.BufferGeometry();
  back.setAttribute("position", position);
  back.setAttribute("uv", new THREE.BufferAttribute(uvBack, 2));
  back.setIndex(index);
  const leaf = { front, back, width, height, curl, shaped: -1 };
  shape(leaf, 0);
  back.setAttribute("normal", front.getAttribute("normal"));
  return leaf;
}

/**
 * Pose une feuille tournée de `p` (0 : à plat à droite, 1 : à plat à gauche).
 * La feuille pivote sur le dos ; chaque tranche reçoit un angle un peu différent : au départ le coin
 * bas se soulève en premier (on le tient), à mi-course la page se creuse, à l'arrivée le bord traîne.
 * L'angle reste entre 0 et π : la page ne traverse jamais le livre.
 */
function shape(leaf: Leaf, p: number) {
  const pos = leaf.front.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const theta = p * Math.PI;
  const lift = Math.sin(theta) * leaf.curl;
  const ds = leaf.width / SX;
  for (let j = 0; j <= SZ; j++) {
    const zn = j / SZ;
    const z = (zn - 0.5) * leaf.height;
    let x = 0;
    let y = 0;
    for (let i = 0; i <= SX; i++) {
      const k = (j * (SX + 1) + i) * 3;
      arr[k] = x;
      arr[k + 1] = y;
      arr[k + 2] = z;
      const sn = (i + 0.5) / SX;
      const bend = lift * Math.pow(sn, 1.6) * ((1 - 2 * p) * (0.7 + 0.8 * zn) - 0.35);
      const a = Math.min(Math.PI, Math.max(0, theta + bend));
      x += Math.cos(a) * ds;
      y += Math.sin(a) * ds;
    }
  }
  pos.needsUpdate = true;
  leaf.front.computeVertexNormals();
  leaf.shaped = p;
}

type Props = {
  reduced: boolean;
  wide: boolean;
  /** Hauteur du dessus de la tour, lue à chaque image. */
  top: () => number;
};

/**
 * Le livre des projets, posé sur la tour. Ouvert par le défilement (ou à la main), il présente
 * chaque projet sur une double page : la capture à gauche, la page de titre à droite.
 * Une feuille par projet, plus la couverture ; la dernière ne tourne jamais.
 */
export function Book({ reduced, wide, top }: Props) {
  const invalidate = useThree((s) => s.invalidate);
  const n = PROJECTS.length;
  const small = !wide;

  const pages = useMemo(() => {
    const cover = makePage(small);
    const shots = PROJECTS.map(() => makePage(small));
    const sheets = PROJECTS.map(() => makePage(small));
    const blank = makePage(small);
    const all = [cover, ...shots, ...sheets, blank];
    return { cover, shots, sheets, blank, all };
  }, [small]);

  const leaves = useMemo(() => {
    const list: Leaf[] = [makeLeaf(COVER.w, COVER.h, 0)];
    for (let k = 1; k <= n; k++) list.push(makeLeaf(BOOK.width, BOOK.height, 1));
    return list;
  }, [n]);

  const materials = useMemo(() => {
    const paper = (texture: THREE.Texture, side: THREE.Side) =>
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.92, metalness: 0, side, color: "#ffffff" });
    return leaves.map((_, k) => {
      const front = k === 0 ? pages.cover.texture : pages.sheets[k - 1].texture;
      const back = k < n ? pages.shots[k].texture : pages.blank.texture;
      const f = paper(front, THREE.FrontSide);
      if (k === 0) {
        f.roughness = 0.62;
        f.color.set("#ffffff");
      }
      return { front: f, back: paper(back, THREE.BackSide) };
    });
  }, [leaves, pages, n]);

  const shadow = useMemo(() => {
    const map = shadowTexture();
    const make = () =>
      new THREE.MeshBasicMaterial({ color: INK, alphaMap: map, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    return { map, right: make(), left: make() };
  }, []);

  // Les pages s'impriment tout de suite avec les polices du système, puis se recomposent une fois
  // les vraies polices et les captures chargées.
  useEffect(() => {
    let alive = true;
    const draw = (images: (HTMLImageElement | null)[]) => {
      drawCover(pages.cover.canvas, n, PROFILE.name);
      PROJECTS.forEach((p, i) => {
        drawShot(pages.shots[i].canvas, p, i, images[i]);
        drawSheet(pages.sheets[i].canvas, p, i, n);
      });
      drawBlank(pages.blank.canvas, "left");
      pages.all.forEach((pg) => (pg.texture.needsUpdate = true));
      invalidate();
    };
    draw(PROJECTS.map(() => null));
    const fonts = [
      "700 64px 'Bricolage Grotesque'",
      "400 24px Figtree",
      "700 24px Figtree",
      "400 16px 'JetBrains Mono'",
    ].map((f) => document.fonts.load(f).catch(() => []));
    const images = PROJECTS.map((p) => {
      if (!p.image) return Promise.resolve(null);
      const img = new Image();
      img.decoding = "async";
      img.src = p.image.src;
      return img.decode().then(
        () => img,
        () => null,
      );
    });
    Promise.all([Promise.all(fonts), Promise.all(images)]).then(([, imgs]) => {
      if (alive) draw(imgs);
    });
    return () => {
      alive = false;
    };
  }, [pages, n, invalidate]);

  useEffect(
    () => () => {
      pages.all.forEach((pg) => pg.texture.dispose());
      leaves.forEach((l) => {
        l.front.dispose();
        l.back.dispose();
      });
      materials.forEach((m) => {
        m.front.dispose();
        m.back.dispose();
      });
      shadow.map.dispose();
      shadow.left.dispose();
      shadow.right.dispose();
    },
    [pages, leaves, materials, shadow],
  );

  // Rendu à la demande (mouvement réduit) : un changement de projet demande une image, sans attendre un défilement.
  const project = useStage((st) => st.project);
  useEffect(() => invalidate(), [project, invalidate]);

  const root = useRef<THREE.Group>(null);
  const leafGroups = useRef<(THREE.Group | null)[]>([]);
  const rightBlock = useRef<THREE.Mesh>(null);
  const leftBlock = useRef<THREE.Mesh>(null);
  const rightShadow = useRef<THREE.Mesh>(null);
  const leftShadow = useRef<THREE.Mesh>(null);
  const turn = useRef(0);
  const drop = useRef(3.2);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    const home = scroll.page === "home";
    const id = scroll.active;
    const on = home && (id === "projets" || id === "contact");
    // Au contact, le livre se referme : l'ouvrage est terminé, la suite reste à écrire ensemble.
    const reading = on && id === "projets";
    let goal = reading ? scroll.book : 0;
    let lambda = reduced ? 1000 : 3.6;
    if (reading && bookInput.drag !== null) {
      goal = bookInput.drag;
      lambda = reduced ? 1000 : 16;
    } else if (reading && !reduced) goal += bookInput.peek;
    goal = Math.min(n, Math.max(0, goal));
    const before = turn.current;
    turn.current = THREE.MathUtils.damp(turn.current, goal, lambda, delta);
    if (Math.abs(turn.current - goal) < 0.0005) turn.current = goal;
    const dropBefore = drop.current;
    drop.current = THREE.MathUtils.damp(drop.current, on ? 0 : 3.2, reduced ? 1000 : 2.4, delta);
    if (Math.abs(drop.current - (on ? 0 : 3.2)) < 0.001) drop.current = on ? 0 : 3.2;
    const t = turn.current;

    g.visible = drop.current < 3.15;
    g.position.y = top() + drop.current;
    // Fermé, le livre est centré sur la tour ; ouvert, c'est le dos qui est au centre.
    g.position.x = -(COVER.w / 2) * (1 - clamp01(t));

    // Le bloc de pages passe de droite à gauche à mesure qu'on avance.
    const f = n > 1 ? clamp01((t - 1) / (n - 1)) : 0;
    const hr = BLOCK * (1 - f) + 0.004;
    const hl = BLOCK * f + 0.004;
    if (rightBlock.current) {
      rightBlock.current.scale.y = hr;
      rightBlock.current.position.y = BOARD + hr / 2;
    }
    if (leftBlock.current) {
      leftBlock.current.scale.y = hl;
      leftBlock.current.position.y = LEFT_BASE + hl / 2;
      leftBlock.current.visible = t > 1.001;
    }

    let active = -1;
    let strongest = 0;
    leaves.forEach((leaf, k) => {
      const p = clamp01(t - k);
      if (Math.abs(p - leaf.shaped) > 1e-5) shape(leaf, p);
      const yRight = k === 0 ? BOARD + hr + (n + 1) * EPS + 0.003 : BOARD + hr + (n - k + 1) * EPS;
      // Une fois tournée, la couverture se pose sur le bloc de gauche : son revers porte la première capture,
      // il doit rester visible tant qu'aucune page ne l'a recouvert.
      const yLeft = LEFT_BASE + hl + (k === 0 ? EPS * 0.5 : k * EPS);
      const lg = leafGroups.current[k];
      if (lg) lg.position.y = THREE.MathUtils.lerp(yRight, yLeft, smooth(p));
      const s = Math.sin(p * Math.PI);
      if (s > strongest) {
        strongest = s;
        active = k;
      }
    });

    // L'ombre de la feuille en vol : sur la pile qu'elle quitte, puis sur celle où elle se pose.
    const pa = active >= 0 ? clamp01(t - active) : 0;
    shadow.right.opacity = 0.32 * strongest * (1 - pa);
    shadow.left.opacity = 0.32 * strongest * pa;
    if (rightShadow.current) {
      rightShadow.current.position.y = BOARD + hr + (n + 1) * EPS + 0.0015;
      rightShadow.current.visible = shadow.right.opacity > 0.002;
    }
    if (leftShadow.current) {
      leftShadow.current.position.y = LEFT_BASE + hl + (n + 1) * EPS + 0.0015;
      leftShadow.current.visible = shadow.left.opacity > 0.002;
    }

    if (Math.abs(before - t) > 1e-6 || Math.abs(dropBefore - drop.current) > 1e-6) invalidate();
  });

  return (
    <group ref={root} position={[-(COVER.w / 2), BOOK_Y + 3.2, 0]} visible={false}>
      {/* Le plat de dos, sous la pile de droite. */}
      <mesh position={[COVER.w / 2, BOARD / 2, 0]}>
        <boxGeometry args={[COVER.w, BOARD, COVER.h]} />
        <meshStandardMaterial color={INK} roughness={0.6} />
      </mesh>
      <mesh ref={rightBlock} position={[BOOK.width / 2, BOARD, 0]}>
        <boxGeometry args={[BOOK.width, 1, BOOK.height]} />
        <meshStandardMaterial color={EDGE} roughness={1} />
      </mesh>
      <mesh ref={leftBlock} position={[-BOOK.width / 2, LEFT_BASE, 0]} visible={false}>
        <boxGeometry args={[BOOK.width, 1, BOOK.height]} />
        <meshStandardMaterial color={EDGE} roughness={1} />
      </mesh>
      {leaves.map((leaf, k) => (
        <group
          key={k}
          ref={(el) => {
            leafGroups.current[k] = el;
          }}
        >
          <mesh geometry={leaf.front} material={materials[k].front} frustumCulled={false} />
          <mesh geometry={leaf.back} material={materials[k].back} frustumCulled={false} />
        </group>
      ))}
      <mesh ref={rightShadow} position={[BOOK.width / 2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={shadow.right} visible={false}>
        <planeGeometry args={[BOOK.width, BOOK.height]} />
      </mesh>
      <mesh
        ref={leftShadow}
        position={[-BOOK.width / 2, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[-1, 1, 1]}
        material={shadow.left}
        visible={false}
      >
        <planeGeometry args={[BOOK.width, BOOK.height]} />
      </mesh>
    </group>
  );
}
