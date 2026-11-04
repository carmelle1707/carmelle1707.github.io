import "server-only";
import bcrypt from "bcryptjs";
import { ensureBootstrap } from "@/lib/bootstrap";
import { connectDb } from "@/lib/db";
import { consumeRateLimit, hashIp } from "@/lib/rate-limit";
import { AdminUser } from "@/models";
import { loginSchema } from "@/schemas/auth";

/** 10 tentatives de connexion par quart d'heure et par IP. */
export const LOGIN_LIMIT = 10;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Hash factice : on compare quand même quand l'email est inconnu, pour un temps de réponse identique
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("compte-inexistant", 12));

export type AdminIdentity = { id: string; email: string };

export type LoginResult =
  { ok: true; admin: AdminIdentity } | { ok: false; reason: "invalid" | "rate-limited" };

export async function verifyAdminCredentials(raw: unknown, ip: string): Promise<LoginResult> {
  await connectDb();
  // Base neuve : le compte admin est créé ici au premier essai de connexion
  await ensureBootstrap();
  if (!(await consumeRateLimit(`login:${hashIp(ip)}`, LOGIN_LIMIT, LOGIN_WINDOW_MS))) {
    return { ok: false, reason: "rate-limited" };
  }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const user = await AdminUser.findOne({ email: parsed.data.email }).lean();
  const matches = await bcrypt.compare(
    parsed.data.password,
    user?.passwordHash ?? (await getDummyHash()),
  );
  if (!user || !matches) return { ok: false, reason: "invalid" };
  return { ok: true, admin: { id: String(user._id), email: user.email } };
}
