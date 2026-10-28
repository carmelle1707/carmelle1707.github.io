import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide.")),
  password: z.string().min(1, "Mot de passe requis.").max(200),
});

/** Variables utilisées par le seed pour créer le compte admin. */
export const adminSeedSchema = z.object({
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email("ADMIN_EMAIL invalide.")),
  ADMIN_PASSWORD: z.string().min(12, "ADMIN_PASSWORD doit faire au moins 12 caractères."),
});

export type LoginInput = z.infer<typeof loginSchema>;
