import type { CSSProperties } from "react";
import { parseEmphasis } from "@/lib/rich-title";

/**
 * Découpe un titre en mots (chacun dans un masque) pour l'animation mot par mot.
 * Les *étoiles* restent des <em>. Le texte complet est exposé aux lecteurs d'écran
 * par l'aria-label du titre parent.
 */
export function SplitText({ text }: { text: string }) {
  let index = 0;
  return (
    <>
      {parseEmphasis(text).map((part, p) => {
        const words = part.text.split(/(\s+)/).map((chunk, c) => {
          if (!chunk) return null;
          if (/^\s+$/.test(chunk)) return " ";
          const style = { "--wi": index++ } as CSSProperties;
          return (
            <span className="w" key={c} aria-hidden="true">
              <span className="wi" style={style}>
                {chunk}
              </span>
            </span>
          );
        });
        return part.em ? <em key={p}>{words}</em> : <span key={p}>{words}</span>;
      })}
    </>
  );
}
