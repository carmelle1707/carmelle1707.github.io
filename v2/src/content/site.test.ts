import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LAYERS, NAV, PROFILE, PROJECTS, STEPS } from "./site";

const publicFile = (path: string) => fileURLToPath(new URL(`../../public${path}`, import.meta.url));

describe("contenu de la V2", () => {
  it("chaque étape correspond à un étage de la tour", () => {
    // La frise surligne la plaque de même rang : il faut autant d'étapes que de couches.
    expect(STEPS).toHaveLength(LAYERS.length);
  });

  it("les projets n'utilisent que des couches qui existent, et leurs adresses sont uniques", () => {
    const ids = new Set(LAYERS.map((l) => l.id));
    for (const p of PROJECTS) {
      for (const layer of p.layers) expect(ids.has(layer)).toBe(true);
    }
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(PROJECTS.length);
  });

  it("un projet sans matière le dit au lieu d'inventer", () => {
    for (const p of PROJECTS) {
      if (!p.image || !p.role || p.stack.length === 0) expect(p.missing).toBeTruthy();
    }
  });

  it("toutes les images et le CV référencés existent", () => {
    const files = [PROFILE.portrait.src, PROFILE.cv, ...PROJECTS.flatMap((p) => (p.image ? [p.image.src] : []))];
    for (const f of files) expect(existsSync(publicFile(f)), f).toBe(true);
    expect(existsSync(publicFile("/stills/tour.webp"))).toBe(true);
    expect(existsSync(publicFile("/stills/tour-sombre.webp"))).toBe(true);
  });

  it("le menu pointe vers des sections uniques", () => {
    expect(new Set(NAV.map((n) => n.id)).size).toBe(NAV.length);
  });
});
