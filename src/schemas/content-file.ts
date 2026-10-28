import { z } from "zod";

/** Forme du fichier data/content.json, lu une seule fois par le seed. */
export const contentFileSchema = z.object({
  profile: z.object({
    name: z.string(),
    shortName: z.string(),
    role: z.string(),
    available: z.boolean(),
    status: z.string(),
    headline: z.string(),
    lead: z.string(),
    photo: z.string(),
    location: z.string(),
    language: z.string(),
    response: z.string(),
    badge: z.string(),
    cv: z.string(),
  }),
  contact: z.object({
    title: z.string(),
    text: z.string(),
    whatsapp: z.string(),
    email: z.string(),
    linkedin: z.string(),
    github: z.string(),
  }),
  marquee: z.array(z.string()),
  services: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      desc: z.string(),
      features: z.array(z.string()),
      for: z.string(),
    }),
  ),
  steps: z.array(z.object({ title: z.string(), desc: z.string() })),
  projects: z.array(
    z.object({
      title: z.string(),
      tag: z.string(),
      desc: z.string(),
      role: z.string(),
      stack: z.array(z.string()),
      image: z.string(),
      github: z.string(),
      demo: z.string(),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  education: z.array(z.object({ period: z.string(), title: z.string(), desc: z.string() })),
});

export type ContentFile = z.infer<typeof contentFileSchema>;
