import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide.")),
  // Espaces de début / fin ignorés des deux côtés : un copier-coller (Vercel, clavier mobile)
  // en ajoute souvent sans qu'on le voie
  password: z.string().trim().min(1, "Mot de passe requis.").max(200),
});

/** Variables utilisées par le seed pour créer le compte admin. */
export const adminSeedSchema = z.object({
  ADMIN_EMAIL: z.string().trim().toLowerCase().pipe(z.email("ADMIN_EMAIL invalide.")),
  ADMIN_PASSWORD: z
    .string()
    .trim()
    .min(12, "ADMIN_PASSWORD doit faire au moins 12 caractères (espaces de début et fin exclus)."),
});

export type LoginInput = z.infer<typeof loginSchema>;
