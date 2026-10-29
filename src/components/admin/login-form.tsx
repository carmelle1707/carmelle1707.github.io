"use client";

import { useActionState, useEffect, useRef } from "react";
import { type LoginState, login } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const passwordRef = useRef<HTMLInputElement>(null);

  // Après un échec, on vide le mot de passe et on y replace le curseur
  useEffect(() => {
    if (state.error && passwordRef.current) {
      passwordRef.current.value = "";
      passwordRef.current.focus();
    }
  }, [state]);

  return (
    <form action={action} className="grid gap-5" aria-busy={pending}>
      {state.error && (
        <p
          role="alert"
          className="rounded-[10px] border border-danger/40 bg-danger/8 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      )}
      <div className="grid gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state.email}
          className="admin-input"
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="login-password" className="text-sm font-semibold">
          Mot de passe
        </label>
        <input
          ref={passwordRef}
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="admin-input"
        />
      </div>
      <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
