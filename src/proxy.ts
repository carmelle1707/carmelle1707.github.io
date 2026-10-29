import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

/** Première barrière : sans session, toute page /admin renvoie vers la connexion. */
export const proxy = auth;

export const config = { matcher: ["/admin/:path*"] };
