import { z } from "zod";
import { BUDGETS, PROJECT_TYPES } from "./constants";

/** Formulaire de contact public. `website` est le champ piège (honeypot). */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(80, "Nom trop long."),
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse email invalide.")),
  projectType: z.enum(PROJECT_TYPES, "Choisissez un type de projet."),
  budget: z
    .union([z.literal(""), z.enum(BUDGETS)])
    .optional()
    .transform((v) => (v ? v : undefined)),
  message: z
    .string()
    .trim()
    .min(20, "Décrivez votre projet en quelques phrases (20 caractères minimum).")
    .max(4000, "Message trop long (4000 caractères maximum)."),
  website: z.string().max(0).optional().default(""),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
