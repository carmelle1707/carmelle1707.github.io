import "server-only";
import { createHash } from "node:crypto";
import { serverSecret } from "@/lib/secrets";
import { RateLimit } from "@/models";

/** Hash d'une IP : on ne stocke jamais l'adresse en clair. */
export function hashIp(ip: string): string {
  const salt = serverSecret("RATE_LIMIT_SALT") ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Compte un passage pour `key` dans une fenêtre glissante de `windowMs`.
 * Renvoie false quand la limite est dépassée. Les compteurs expirent seuls (index TTL).
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = new Date();
  // Le ménage TTL de MongoDB passe toutes les 60 s : on retire nous-mêmes un compteur périmé.
  await RateLimit.deleteOne({ key, expiresAt: { $lte: now } });
  const doc = await RateLimit.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) } },
    { upsert: true, new: true },
  ).lean();
  return (doc?.count ?? 0) <= limit;
}
