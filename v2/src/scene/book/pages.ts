import * as THREE from "three";
import type { Project } from "../../content/site";
import { BOOK } from "../poses";

/**
 * Les pages du livre, composées dans un canvas comme une maquette imprimée :
 * à gauche la capture du projet, à droite sa page de titre ; la couverture en encre et or.
 * Couleurs : les équivalents hexadécimaux des jetons de tokens.css (le papier reste clair, même en thème sombre : c'est un livre).
 */
const INK = "#0f1b2d";
const INK_2 = "#1f2b42";
const MUTED = "#5a6577";
const RULE = "#dde2ea";
const PAPER = "#f8f9fb";
const PAPER_3 = "#eceff4";
/** L'or du site, assombri sur le papier pour que les chiffres restent lisibles. */
const GOLD_ON_PAPER = "#9c7426";
const GOLD = "#d2a44a";
const BAND_MUTED = "#a3adbf";

const DISPLAY = "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif";
const BODY = "Figtree, ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

export type Side = "left" | "right";

export function pageSize(small: boolean) {
  const w = small ? 512 : 720;
  return { w, h: Math.round((w * BOOK.height) / BOOK.width) };
}

export function makePage(small: boolean) {
  const { w, h } = pageSize(small);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { canvas, texture };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Découpe un texte en lignes qui tiennent dans `max` pixels (au plus `limit` lignes, la dernière tronquée). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, limit = 99) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length > limit) {
    const kept = lines.slice(0, limit);
    let last = kept[limit - 1];
    while (ctx.measureText(`${last}…`).width > max && last.includes(" ")) last = last.slice(0, last.lastIndexOf(" "));
    kept[limit - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

/** Le papier, et l'ombre de la reliure du côté du dos (à gauche pour une page de droite). */
function paper(ctx: CanvasRenderingContext2D, side: Side) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  const spine = side === "right" ? 0 : w;
  const g = ctx.createLinearGradient(spine, 0, side === "right" ? w * 0.14 : w * 0.86, 0);
  g.addColorStop(0, "rgba(15, 27, 45, 0.16)");
  g.addColorStop(0.35, "rgba(15, 27, 45, 0.05)");
  g.addColorStop(1, "rgba(15, 27, 45, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Le bord extérieur prend un peu la lumière, comme une tranche.
  const edge = side === "right" ? w : 0;
  const e = ctx.createLinearGradient(edge, 0, side === "right" ? w - w * 0.03 : w * 0.03, 0);
  e.addColorStop(0, "rgba(15, 27, 45, 0.07)");
  e.addColorStop(1, "rgba(15, 27, 45, 0)");
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, w, h);
}

/** Folio en pied de page, côté extérieur. */
function folio(ctx: CanvasRenderingContext2D, side: Side, text: string, u: number) {
  const { width: w, height: h } = ctx.canvas;
  ctx.font = `400 ${15 * u}px ${MONO}`;
  ctx.fillStyle = MUTED;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = side === "right" ? "right" : "left";
  ctx.fillText(text, side === "right" ? w - 56 * u : 56 * u, h - 48 * u);
  ctx.textAlign = "left";
}

/** Les technologies comme des caractères en plomb : de petits blocs alignés, gravés à leur nom. */
function type(ctx: CanvasRenderingContext2D, stack: string[], x: number, y: number, max: number, u: number) {
  ctx.font = `400 ${17 * u}px ${MONO}`;
  ctx.textBaseline = "middle";
  const hgt = 38 * u;
  let cx = x;
  let cy = y;
  for (const t of stack) {
    const w = ctx.measureText(t).width + 26 * u;
    if (cx + w > x + max) {
      cx = x;
      cy += hgt + 10 * u;
    }
    ctx.fillStyle = PAPER_3;
    ctx.fillRect(cx, cy, w, hgt);
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1.5 * u;
    ctx.strokeRect(cx, cy, w, hgt);
    ctx.fillStyle = INK_2;
    ctx.fillText(t, cx + 13 * u, cy + hgt / 2 + u);
    cx += w + 10 * u;
  }
  ctx.textBaseline = "alphabetic";
  return cy + hgt;
}

/** Page de gauche : la capture, comme une planche de magazine, avec sa légende et la pile technique. */
export function drawShot(canvas: HTMLCanvasElement, p: Project, index: number, img: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const u = w / 720;
  paper(ctx, "left");
  const m = 56 * u;
  const inner = 76 * u;
  const boxW = w - m - inner;
  const boxH = Math.round(boxW * 0.72);
  const top = 92 * u;
  if (img && img.naturalWidth) {
    // Recadrage « cover », calé en haut : on garde l'en-tête de l'interface.
    const ratio = boxW / boxH;
    const sw = Math.min(img.naturalWidth, img.naturalHeight * ratio);
    const sh = sw / ratio;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, m, top, boxW, boxH);
  } else {
    ctx.fillStyle = PAPER_3;
    ctx.fillRect(m, top, boxW, boxH);
    // Pas de capture : le titre composé en grand tient lieu d'image, sans rien inventer.
    ctx.fillStyle = INK;
    ctx.font = `700 ${92 * u}px ${DISPLAY}`;
    const lines = wrap(ctx, p.title, boxW - 64 * u, 3);
    lines.forEach((l, i) => ctx.fillText(l, m + 32 * u, top + 120 * u + i * 92 * u));
    ctx.fillStyle = MUTED;
    ctx.font = `400 ${20 * u}px ${BODY}`;
    ctx.fillText("Capture à venir", m + 32 * u, top + boxH - 32 * u);
  }
  ctx.strokeStyle = RULE;
  ctx.lineWidth = 2 * u;
  ctx.strokeRect(m, top, boxW, boxH);

  // Légende : numéro de figure en chasse fixe, puis le titre.
  let y = top + boxH + 52 * u;
  ctx.fillStyle = GOLD_ON_PAPER;
  ctx.font = `400 ${17 * u}px ${MONO}`;
  ctx.fillText(`Fig. ${pad(index + 1)}`, m, y);
  ctx.fillStyle = INK;
  ctx.font = `700 ${22 * u}px ${BODY}`;
  const cap = wrap(ctx, p.title, boxW - 110 * u, 2);
  cap.forEach((l, i) => ctx.fillText(l, m + 110 * u, y + i * 30 * u));
  y += cap.length * 30 * u + 8 * u;
  if (p.context) {
    ctx.fillStyle = MUTED;
    ctx.font = `400 ${20 * u}px ${BODY}`;
    ctx.fillText(p.context, m + 110 * u, y);
  }

  // Pied de page : la pile, posée comme une ligne de caractères.
  if (p.stack.length) {
    ctx.fillStyle = MUTED;
    ctx.font = `400 ${17 * u}px ${MONO}`;
    ctx.fillText("Composé avec", m, h - 220 * u);
    type(ctx, p.stack, m, h - 196 * u, boxW, u);
  }
  folio(ctx, "left", `${pad(index * 2 + 2)}`, u);
}

/** Page de droite : le grand chiffre du projet, son titre, son contexte et ce que tu y as fait. */
export function drawSheet(canvas: HTMLCanvasElement, p: Project, index: number, total: number) {
  const ctx = canvas.getContext("2d")!;
  const { width: w } = canvas;
  const u = w / 720;
  paper(ctx, "right");
  const inner = 84 * u;
  const m = 60 * u;
  const max = w - inner - m;

  ctx.fillStyle = GOLD_ON_PAPER;
  ctx.font = `700 ${230 * u}px ${DISPLAY}`;
  ctx.fillText(pad(index + 1), inner - 10 * u, 250 * u);
  ctx.fillStyle = MUTED;
  ctx.font = `400 ${17 * u}px ${MONO}`;
  ctx.fillText(`sur ${pad(total)}`, inner, 296 * u);

  let y = 400 * u;
  ctx.fillStyle = INK;
  ctx.font = `700 ${62 * u}px ${DISPLAY}`;
  const title = wrap(ctx, p.title, max, 3);
  title.forEach((l, i) => ctx.fillText(l, inner, y + i * 64 * u));
  y += (title.length - 1) * 64 * u + 46 * u;

  if (p.context) {
    ctx.fillStyle = MUTED;
    ctx.font = `400 ${24 * u}px ${BODY}`;
    ctx.fillText(p.context, inner, y);
    y += 44 * u;
  }
  ctx.fillStyle = GOLD;
  ctx.fillRect(inner, y, 64 * u, 3 * u);
  y += 58 * u;

  if (p.role) {
    ctx.fillStyle = INK_2;
    ctx.font = `400 ${27 * u}px ${BODY}`;
    const lines = wrap(ctx, p.role, max, 6);
    lines.forEach((l, i) => ctx.fillText(l, inner, y + i * 40 * u));
  }
  folio(ctx, "right", `${pad(index * 2 + 3)}`, u);
}

/** La couverture : encre, titre doré à chaud, filet doré en retrait. */
export function drawCover(canvas: HTMLCanvasElement, total: number, name: string) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const u = w / 720;
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  // Le mors : une rainure le long du dos.
  const g = ctx.createLinearGradient(0, 0, 60 * u, 0);
  g.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 60 * u, h);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2 * u;
  ctx.strokeRect(70 * u, 52 * u, w - 122 * u, h - 104 * u);

  ctx.fillStyle = GOLD;
  ctx.font = `700 ${132 * u}px ${DISPLAY}`;
  ctx.fillText("Projets", 112 * u, 330 * u);
  ctx.fillStyle = BAND_MUTED;
  ctx.font = `400 ${26 * u}px ${BODY}`;
  ctx.fillText(name, 116 * u, 386 * u);

  ctx.fillStyle = GOLD;
  ctx.font = `700 ${150 * u}px ${DISPLAY}`;
  ctx.fillText(pad(total), 108 * u, h - 128 * u);
  ctx.fillStyle = BAND_MUTED;
  ctx.font = `400 ${17 * u}px ${MONO}`;
  ctx.fillText(total > 1 ? "réalisations" : "réalisation", 116 * u, h - 92 * u);
}

/** Dernière page, jamais montrée à plat mais visible pendant qu'elle tourne. */
export function drawBlank(canvas: HTMLCanvasElement, side: Side) {
  const ctx = canvas.getContext("2d")!;
  paper(ctx, side);
}

/** Ombre portée d'une page qui tourne : sombre près du dos, nulle au bord. */
export function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 4;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 4);
  const t = new THREE.CanvasTexture(c);
  return t;
}
