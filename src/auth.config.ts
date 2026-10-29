import type { NextAuthConfig } from "next-auth";

export const LOGIN_PATH = "/admin/connexion";

/**
 * Partie de la config sans accès à la base : utilisée par le proxy, qui doit rester léger.
 * Le fournisseur d'identifiants est ajouté dans src/auth.ts.
 */
export const authConfig = {
  pages: { signIn: LOGIN_PATH },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  // Le site est derrière Vercel (ou en local) : l'en-tête Host est fiable
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const loggedIn = Boolean(auth?.user);
      if (pathname === LOGIN_PATH) {
        return loggedIn ? Response.redirect(new URL("/admin", request.nextUrl)) : true;
      }
      // false → redirection vers la page de connexion
      return pathname.startsWith("/admin") ? loggedIn : true;
    },
  },
} satisfies NextAuthConfig;
