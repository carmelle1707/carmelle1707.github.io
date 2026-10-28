import { z } from "zod";
import { mediaSchema, optionalText, optionalUrl, requiredText, tagList } from "./common";
import { SERVICE_ICONS } from "./constants";

export const profileSchema = z.object({
  name: requiredText("Le nom", 80),
  shortName: requiredText("Le nom du menu", 40),
  role: requiredText("Le métier", 80),
  available: z.boolean().default(true),
  status: optionalText(80),
  headline: requiredText("Le grand titre", 160),
  lead: requiredText("Le texte d'introduction", 600),
  photo: mediaSchema,
  location: optionalText(60),
  language: optionalText(60),
  response: optionalText(60),
  badge: optionalText(60),
  cv: mediaSchema,
});

export const contactSchema = z.object({
  title: requiredText("Le titre", 120),
  text: optionalText(600),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\+?[\d\s.-]{8,20}$/.test(v),
      "Numéro invalide : +225 01 02 03 04 05",
    )
    .default(""),
  email: z.union([z.literal(""), z.email("Adresse email invalide.")]).default(""),
  linkedin: optionalUrl,
  github: optionalUrl,
});

export const serviceSchema = z.object({
  icon: z.enum(SERVICE_ICONS, "Icône inconnue."),
  title: requiredText("Le nom du service", 80),
  desc: requiredText("La description", 400),
  features: tagList(12),
  for: optionalText(160),
});

export const stepSchema = z.object({
  title: requiredText("Le nom de l'étape", 60),
  desc: requiredText("La description", 400),
});

export const projectSchema = z.object({
  title: requiredText("Le nom du projet", 100),
  tag: optionalText(120),
  desc: requiredText("La description", 600),
  role: optionalText(400),
  stack: tagList(15),
  image: mediaSchema,
  demoUrl: optionalUrl,
  githubUrl: optionalUrl,
  published: z.boolean().default(false),
});

export const skillGroupSchema = z.object({
  group: requiredText("Le nom de la catégorie", 40),
  items: tagList(30),
});

export const educationSchema = z.object({
  period: requiredText("La période", 30),
  title: requiredText("L'établissement ou le poste", 100),
  desc: optionalText(400),
});

export const marqueeWordSchema = z.object({
  text: requiredText("Le mot", 40),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type StepInput = z.infer<typeof stepSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type SkillGroupInput = z.infer<typeof skillGroupSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type MarqueeWordInput = z.infer<typeof marqueeWordSchema>;
