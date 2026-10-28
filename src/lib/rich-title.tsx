import { Fragment } from "react";

export type TitlePart = { text: string; em: boolean };

/** Découpe « Je crée *des sites* » en morceaux normaux / mis en valeur. */
export function parseEmphasis(input: string): TitlePart[] {
  const parts: TitlePart[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  for (const match of input.matchAll(re)) {
    const index = match.index;
    if (index > last) parts.push({ text: input.slice(last, index), em: false });
    parts.push({ text: match[1], em: true });
    last = index + match[0].length;
  }
  if (last < input.length) parts.push({ text: input.slice(last), em: false });
  return parts;
}

/** Retire les étoiles pour les usages en texte brut (SEO, aria-label). */
export function stripEmphasis(input: string): string {
  return input.replace(/\*([^*]+)\*/g, "$1");
}

export function RichTitle({ text }: { text: string }) {
  return (
    <>
      {parseEmphasis(text).map((part, i) =>
        part.em ? <em key={i}>{part.text}</em> : <Fragment key={i}>{part.text}</Fragment>,
      )}
    </>
  );
}
