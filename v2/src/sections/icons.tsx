import type { LayerId } from "../content/site";

/** Une icône dessinée par couche, d'un seul trait. `pathLength` permet de les tracer à l'écran. */
const PATHS: Record<LayerId, string[]> = {
  mobile: ["M8 2.5h8a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2z", "M10.5 18.5h3"],
  interface: ["M3 4.5h18v11.5H3z", "M12 16v4", "M8 20h8", "M6.5 8h6", "M6.5 11h9"],
  api: [
    "M8.5 4C6.5 4 5.5 5 5.5 7v2.2c0 1.4-.8 2.3-2.2 2.8 1.4.5 2.2 1.4 2.2 2.8V17c0 2 1 3 3 3",
    "M15.5 4c2 0 3 1 3 3v2.2c0 1.4.8 2.3 2.2 2.8-1.4.5-2.2 1.4-2.2 2.8V17c0 2-1 3-3 3",
  ],
  serveur: ["M4 3.5h16v7H4z", "M4 13.5h16v7H4z", "M7.5 7h2", "M7.5 17h2", "M13 7h4", "M13 17h4"],
  donnees: [
    "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z",
    "M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6",
    "M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  ],
};

export function LayerIcon({ id }: { id: LayerId }) {
  return (
    <svg className="layer-icon" viewBox="0 0 24 24" width="56" height="56" aria-hidden="true" focusable="false">
      {PATHS[id].map((d) => (
        <path key={d} d={d} pathLength={1} />
      ))}
    </svg>
  );
}

/** Éclats de plaques qui flottent autour de la présentation : de la géométrie, pas une illustration. */
export function Shard({ variant }: { variant: "slab" | "thin" | "braces" }) {
  if (variant === "braces")
    return (
      <svg viewBox="0 0 40 24" aria-hidden="true" focusable="false">
        <path d="M12 2c-3 0-4 1.5-4 4v2.5c0 1.8-1 3-3 3.5 2 .5 3 1.7 3 3.5V18c0 2.5 1 4 4 4" />
        <path d="M28 2c3 0 4 1.5 4 4v2.5c0 1.8 1 3 3 3.5-2 .5-3 1.7-3 3.5V18c0 2.5-1 4-4 4" />
      </svg>
    );
  const t = variant === "slab" ? 4 : 2;
  return (
    <svg viewBox="0 0 64 36" aria-hidden="true" focusable="false">
      <path d="M2 14 L32 2 L62 14 L32 26 Z" />
      <path d={`M2 14v${t} L32 ${26 + t} L62 ${14 + t}v-${t}`} />
      <path d={`M32 26v${t}`} />
    </svg>
  );
}
