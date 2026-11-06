/** « Flot — MOM Global Reporting » → « flot-mom-global-reporting » (adresse de page lisible). */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "page"
  );
}

/** Ajoute un slug unique à chaque élément (suffixe -2, -3… en cas de titres identiques). */
export function withSlugs<T>(items: T[], titleOf: (item: T) => string): (T & { slug: string })[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = slugify(titleOf(item));
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { ...item, slug: n === 1 ? base : `${base}-${n}` };
  });
}
