/**
 * La V2 en 3D (autre projet Vercel, dossier v2 de la branche dev) lit son contenu ici
 * et y envoie ses messages : une seule admin pour les deux sites.
 */
export const V2_URL = "https://ange-carmelle-gbedji-3d.vercel.app";

/** Origines autorisées à appeler l'API publique depuis un navigateur (CORS). */
export function allowedOrigins(): string[] {
  const extra = (process.env.V2_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return [V2_URL, "http://localhost:4317", "http://localhost:5173", ...extra];
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (origin && allowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}
