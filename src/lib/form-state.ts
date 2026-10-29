import type { z } from "zod";

/** État renvoyé par les actions des formulaires de l'admin. */
export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors: Record<string, string> };

export const idleState: FormState = { status: "idle" };

/** Première erreur par champ, avec un chemin du type `photo.url` ou `features.2`. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    out[key] ??= issue.message;
  }
  return out;
}

export function invalid(error: z.ZodError): FormState {
  return {
    status: "error",
    message: "Certains champs sont à corriger.",
    fieldErrors: fieldErrorsOf(error),
  };
}

export const failure = (message: string): FormState => ({
  status: "error",
  message,
  fieldErrors: {},
});

/** Lit un fichier envoyé par MediaField (champs cachés `<nom>.url` et `<nom>.pathname`). */
export function mediaFrom(formData: FormData, name: string) {
  const url = String(formData.get(`${name}.url`) ?? "").trim();
  if (!url) return null;
  return { url, pathname: String(formData.get(`${name}.pathname`) ?? "") };
}

export const textFrom = (formData: FormData, name: string) => String(formData.get(name) ?? "");
