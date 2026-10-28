import { describe, expect, it } from "vitest";
import { parseEmphasis, stripEmphasis } from "@/lib/rich-title";

describe("parseEmphasis", () => {
  it("isole le texte entre étoiles", () => {
    expect(parseEmphasis("Un projet en tête ? *Parlons-en.*")).toEqual([
      { text: "Un projet en tête ? ", em: false },
      { text: "Parlons-en.", em: true },
    ]);
  });

  it("gère plusieurs passages mis en valeur", () => {
    expect(parseEmphasis("*Vite* et *bien*")).toEqual([
      { text: "Vite", em: true },
      { text: " et ", em: false },
      { text: "bien", em: true },
    ]);
  });

  it("laisse un texte sans étoiles intact", () => {
    expect(parseEmphasis("Projets récents")).toEqual([{ text: "Projets récents", em: false }]);
  });

  it("ignore une étoile isolée", () => {
    expect(parseEmphasis("Note * importante")).toEqual([{ text: "Note * importante", em: false }]);
  });
});

describe("stripEmphasis", () => {
  it("retire les étoiles", () => {
    expect(stripEmphasis("Mes *outils*")).toBe("Mes outils");
  });
});
