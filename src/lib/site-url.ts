/**
 * Adresse publique du site, sans « / » final : NEXT_PUBLIC_SITE_URL en priorité,
 * sinon le domaine de production fourni par Vercel, sinon le serveur local.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
