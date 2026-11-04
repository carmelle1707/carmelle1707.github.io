import { hkdfSync } from "node:crypto";

/**
 * Secret serveur : la variable dédiée si elle existe, sinon une clé dérivée (HKDF) de
 * MONGODB_URI, qui contient déjà le mot de passe aléatoire de la base. Évite d'avoir à
 * saisir AUTH_SECRET et RATE_LIMIT_SALT à la main sur Vercel.
 * Conséquence : changer le mot de passe de la base déconnecte l'admin (rien d'autre).
 */
export function serverSecret(envName: "AUTH_SECRET" | "RATE_LIMIT_SALT"): string | undefined {
  const explicit = process.env[envName]?.trim();
  if (explicit) return explicit;
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return undefined;
  return Buffer.from(hkdfSync("sha256", uri, "portfolio-ange-carmelle", envName, 32)).toString(
    "base64",
  );
}
