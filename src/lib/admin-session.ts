import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LOGIN_PATH } from "@/auth.config";

/**
 * Deuxième barrière, côté serveur : à appeler dans chaque page et chaque action de l'admin.
 * Le proxy peut être contourné (appel direct d'une action), cette vérification non.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) redirect(LOGIN_PATH);
  return session.user;
}
