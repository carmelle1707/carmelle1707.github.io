import { Fragment } from "react";

/**
 * Découpe un texte en lettres, mot par mot (un mot ne se coupe jamais en fin de ligne).
 * Le texte complet reste lisible : l'appelant porte un `aria-label`, les lettres sont masquées aux lecteurs d'écran.
 */
export function Chars({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word" aria-hidden="true">
            {[...w].map((c, k) => (
              <span className="ch" key={k}>
                {c}
              </span>
            ))}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}

/** Découpe un texte en mots ; les expressions de `keys` restent d'un seul tenant et sont marquées. */
export function Words({ text, keys = [], mask = false }: { text: string; keys?: string[]; mask?: boolean }) {
  const escaped = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = escaped.length ? text.split(new RegExp(`(${escaped.join("|")})`)) : [text];
  const tokens: { t: string; key: boolean }[] = [];
  parts.forEach((p, i) => {
    if (i % 2 === 1) tokens.push({ t: p, key: true });
    else p.split(/[ \t\n\r]+/).filter(Boolean).forEach((w) => tokens.push({ t: w, key: false }));
  });
  // La ponctuation collée à une expression clé (« WeCode, ») ne doit pas partir seule à la ligne.
  const out: { t: string; key: boolean }[] = [];
  for (const tok of tokens) {
    if (!tok.key && /^[,.;:!?)]/.test(tok.t) && out.length) out[out.length - 1] = { ...out[out.length - 1], t: out[out.length - 1].t + tok.t };
    else out.push(tok);
  }
  return (
    <>
      {out.map((tok, i) => (
        <Fragment key={i}>
          {mask ? (
            <span className="wm">
              <span className="w">{tok.t}</span>
            </span>
          ) : (
            <span className={tok.key ? "w k" : "w"}>{tok.t}</span>
          )}
          {i < out.length - 1 && !/['’]$/.test(tok.t) ? " " : ""}
        </Fragment>
      ))}
    </>
  );
}
