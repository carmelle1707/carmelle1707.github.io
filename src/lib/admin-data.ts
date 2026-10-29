import "server-only";
import { connection } from "next/server";
import { starterContent } from "@/lib/content";
import { connectDb } from "@/lib/db";
import type { SiteContent } from "@/lib/content-types";
import {
  Contact,
  Education,
  MarqueeWord,
  Message,
  Profile,
  Project,
  Service,
  SkillGroup,
  Step,
} from "@/models";

// Lectures de l'admin : toujours fraîches (jamais mises en cache ni pré-rendues au build),
// contrairement au site public.
async function fresh() {
  await connection();
  await connectDb();
}

const media = (m: { url: string; pathname?: string | null } | null | undefined) =>
  m ? { url: m.url, pathname: m.pathname ?? "" } : null;

export async function getAdminProfile(): Promise<SiteContent["profile"]> {
  await fresh();
  const p = await Profile.findOne({ key: "main" }).lean();
  if (!p) return starterContent().profile;
  return {
    name: p.name,
    shortName: p.shortName,
    role: p.role,
    available: p.available,
    status: p.status,
    headline: p.headline,
    lead: p.lead,
    photo: media(p.photo),
    location: p.location,
    language: p.language,
    response: p.response,
    badge: p.badge,
    cv: media(p.cv),
  };
}

export async function getAdminContact(): Promise<SiteContent["contact"]> {
  await fresh();
  const c = await Contact.findOne({ key: "main" }).lean();
  if (!c) return starterContent().contact;
  return {
    title: c.title,
    text: c.text,
    whatsapp: c.whatsapp,
    email: c.email,
    linkedin: c.linkedin,
    github: c.github,
  };
}

export async function getDashboard() {
  await fresh();
  const [profile, unread, messages, published, drafts, services, steps, skills, education, words] =
    await Promise.all([
      Profile.findOne({ key: "main" }, { available: 1, status: 1 }).lean(),
      Message.countDocuments({ read: false, archived: false }),
      Message.countDocuments({ archived: false }),
      Project.countDocuments({ published: true }),
      Project.countDocuments({ published: false }),
      Service.countDocuments(),
      Step.countDocuments(),
      SkillGroup.countDocuments(),
      Education.countDocuments(),
      MarqueeWord.countDocuments(),
    ]);
  return {
    available: profile?.available ?? true,
    status: profile?.status ?? "",
    hasProfile: Boolean(profile),
    unread,
    messages,
    published,
    drafts,
    services,
    steps,
    skills,
    education,
    words,
  };
}
