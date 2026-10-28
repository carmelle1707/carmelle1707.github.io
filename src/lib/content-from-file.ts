import type { Media } from "@/schemas/common";
import {
  contactSchema,
  educationSchema,
  marqueeWordSchema,
  profileSchema,
  projectSchema,
  serviceSchema,
  skillGroupSchema,
  stepSchema,
} from "@/schemas/content";
import type { ContentFile } from "@/schemas/content-file";
import type { SiteContent } from "./content-types";

/** Fichiers de l'ancien site, rangés dans public/ lors de la migration. */
const LOCAL_MEDIA: Record<string, string> = {
  "image/photo-shooting-lps.jpeg": "/images/photo-profil.jpeg",
  "image/flot .png": "/images/flot.png",
  "image/yowl.png": "/images/yowl.png",
  "image/postit.png": "/images/postit.png",
  "mon CV.pdf": "/cv.pdf",
};

function localMedia(path: string): Media {
  const url = LOCAL_MEDIA[path];
  return url ? { url, pathname: "" } : null;
}

/** Convertit content.json en données validées, prêtes à insérer en base. */
export function contentFromFile(file: ContentFile) {
  return {
    profile: profileSchema.parse({
      ...file.profile,
      photo: localMedia(file.profile.photo),
      cv: localMedia(file.profile.cv),
    }),
    contact: contactSchema.parse(file.contact),
    marquee: file.marquee.map((text) => marqueeWordSchema.parse({ text })),
    services: file.services.map((s) => serviceSchema.parse(s)),
    steps: file.steps.map((s) => stepSchema.parse(s)),
    projects: file.projects.map((p) =>
      projectSchema.parse({
        title: p.title,
        tag: p.tag,
        desc: p.desc,
        role: p.role,
        stack: p.stack,
        image: localMedia(p.image),
        demoUrl: p.demo,
        githubUrl: p.github,
        published: true,
      }),
    ),
    skills: file.skills.map((s) => skillGroupSchema.parse(s)),
    education: file.education.map((e) => educationSchema.parse(e)),
  };
}

export type SeedContent = ReturnType<typeof contentFromFile>;

/** Même contenu, au format de la page publique (utilisé tant que la base est vide). */
export function siteContentFromFile(file: ContentFile): SiteContent {
  const c = contentFromFile(file);
  const ids = <T>(list: T[], prefix: string) =>
    list.map((item, i) => ({ ...item, id: `${prefix}-${i}` }));
  return {
    profile: c.profile,
    contact: c.contact,
    marquee: c.marquee.map((m) => m.text),
    services: ids(c.services, "service"),
    steps: ids(c.steps, "step"),
    projects: ids(c.projects, "project"),
    skills: ids(c.skills, "skill"),
    education: ids(c.education, "education"),
  };
}
