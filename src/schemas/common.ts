import { z } from "zod";

export const requiredText = (label: string, max = 200) =>
  z
    .string({ error: `${label} est requis.` })
    .trim()
    .min(1, `${label} est requis.`)
    .max(max, `${label} : ${max} caractères maximum.`);

export const optionalText = (max = 500) =>
  z.string().trim().max(max, `${max} caractères maximum.`).default("");

/** Lien http(s) ou chaîne vide (champ facultatif). */
export const optionalUrl = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
    "Lien invalide : il doit commencer par https://",
  )
  .default("");

/** Fichier : chemin local (/images/…) ou adresse Vercel Blob. */
export const mediaSchema = z
  .object({
    url: z
      .string()
      .trim()
      .refine(
        (v) => /^\/(?!\/)\S*$/.test(v) || /^https:\/\/\S+$/i.test(v),
        "Adresse de fichier invalide.",
      ),
    pathname: z.string().trim().default(""),
  })
  .nullable()
  .default(null);

/** Liste de mots (étiquettes), sans doublons ni vides. */
export const tagList = (max = 30) =>
  z
    .array(z.string().trim().max(60))
    .max(max, `${max} éléments maximum.`)
    .transform((items) => [...new Set(items.filter(Boolean))])
    .default([]);

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Identifiant invalide.");

export const reorderSchema = z.object({
  ids: z.array(objectId).min(1).max(200),
});

export type Media = z.infer<typeof mediaSchema>;
