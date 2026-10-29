import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { verifyAdminCredentials } from "@/lib/admin-auth";

/** Code renvoyé à la page de connexion quand il y a trop de tentatives. */
export class TooManyAttempts extends CredentialsSignin {
  code = "rate-limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "inconnue";
        const result = await verifyAdminCredentials(credentials, ip);
        if (!result.ok) {
          if (result.reason === "rate-limited") throw new TooManyAttempts();
          return null;
        }
        return { id: result.admin.id, email: result.admin.email };
      },
    }),
  ],
});
