"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
import { LOGIN_PATH } from "@/auth.config";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (error) {
    // En cas de succès, signIn lève une redirection : elle doit remonter telle quelle
    if (!(error instanceof AuthError)) throw error;
    const limited = error instanceof CredentialsSignin && error.code === "rate-limited";
    return {
      email,
      error: limited
        ? "Trop de tentatives. Réessayez dans un quart d'heure."
        : "Email ou mot de passe incorrect.",
    };
  }
  return {};
}

export async function logout() {
  await signOut({ redirectTo: LOGIN_PATH });
}
