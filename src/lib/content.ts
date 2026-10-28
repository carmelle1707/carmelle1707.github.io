import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import contentJson from "../../data/content.json";
import {
  Contact,
  Education,
  MarqueeWord,
  Profile,
  Project,
  Service,
  SkillGroup,
  Step,
} from "@/models";
import { contentFileSchema } from "@/schemas/content-file";
import { siteContentFromFile } from "./content-from-file";
import type { SiteContent } from "./content-types";
import { connectDb } from "./db";

export const SITE_CONTENT_TAG = "site-content";

const fallback = () => siteContentFromFile(contentFileSchema.parse(contentJson));
const media = (m: { url: string; pathname?: string | null } | null | undefined) =>
  m ? { url: m.url, pathname: m.pathname ?? "" } : null;

/**
 * Contenu public, mis en cache jusqu'à la prochaine publication depuis l'admin.
 * Sans base configurée (ou base vide), on affiche le contenu de départ de data/content.json.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(SITE_CONTENT_TAG);

  if (!process.env.MONGODB_URI) return fallback();
  await connectDb();

  const sort = { order: 1 } as const;
  const [profile, contact, marquee, services, steps, projects, skills, education] =
    await Promise.all([
      Profile.findOne({ key: "main" }).lean(),
      Contact.findOne({ key: "main" }).lean(),
      MarqueeWord.find().sort(sort).lean(),
      Service.find().sort(sort).lean(),
      Step.find().sort(sort).lean(),
      Project.find({ published: true }).sort(sort).lean(),
      SkillGroup.find().sort(sort).lean(),
      Education.find().sort(sort).lean(),
    ]);
  if (!profile || !contact) return fallback();

  return {
    profile: {
      name: profile.name,
      shortName: profile.shortName,
      role: profile.role,
      available: profile.available,
      status: profile.status,
      headline: profile.headline,
      lead: profile.lead,
      photo: media(profile.photo),
      location: profile.location,
      language: profile.language,
      response: profile.response,
      badge: profile.badge,
      cv: media(profile.cv),
    },
    contact: {
      title: contact.title,
      text: contact.text,
      whatsapp: contact.whatsapp,
      email: contact.email,
      linkedin: contact.linkedin,
      github: contact.github,
    },
    marquee: marquee.map((m) => m.text),
    services: services.map((s) => ({
      id: String(s._id),
      icon: s.icon,
      title: s.title,
      desc: s.desc,
      features: s.features,
      for: s.for,
    })),
    steps: steps.map((s) => ({ id: String(s._id), title: s.title, desc: s.desc })),
    projects: projects.map((p) => ({
      id: String(p._id),
      title: p.title,
      tag: p.tag,
      desc: p.desc,
      role: p.role,
      stack: p.stack,
      image: media(p.image),
      demoUrl: p.demoUrl,
      githubUrl: p.githubUrl,
      published: p.published,
    })),
    skills: skills.map((s) => ({ id: String(s._id), group: s.group, items: s.items })),
    education: education.map((e) => ({
      id: String(e._id),
      period: e.period,
      title: e.title,
      desc: e.desc,
    })),
  };
}
