import bcrypt from "bcryptjs";
import {
  AdminUser,
  Contact,
  Education,
  MarqueeWord,
  Profile,
  Project,
  Service,
  SkillGroup,
  Step,
} from "@/models";
import type { SeedContent } from "./content-from-file";

export const BCRYPT_ROUNDS = 12;

const withOrder = <T extends object>(list: T[]) => list.map((item, order) => ({ ...item, order }));

/** Le contenu est-il déjà en base ? (le seed ne l'écrase pas sans --force) */
export async function hasContent(): Promise<boolean> {
  return (await Profile.exists({ key: "main" })) !== null;
}

/** Remplace tout le contenu éditorial. Les messages et le compte admin ne sont pas touchés. */
export async function seedContent(content: SeedContent): Promise<void> {
  await Promise.all([
    Profile.deleteMany({}),
    Contact.deleteMany({}),
    Service.deleteMany({}),
    Step.deleteMany({}),
    Project.deleteMany({}),
    SkillGroup.deleteMany({}),
    Education.deleteMany({}),
    MarqueeWord.deleteMany({}),
  ]);
  await Promise.all([
    Profile.create({ key: "main", ...content.profile }),
    Contact.create({ key: "main", ...content.contact }),
    Service.insertMany(withOrder(content.services)),
    Step.insertMany(withOrder(content.steps)),
    Project.insertMany(withOrder(content.projects)),
    SkillGroup.insertMany(withOrder(content.skills)),
    Education.insertMany(withOrder(content.education)),
    MarqueeWord.insertMany(withOrder(content.marquee)),
  ]);
}

/** Crée le compte admin, ou met à jour son mot de passe s'il existe déjà. */
export async function upsertAdmin(email: string, password: string): Promise<"created" | "updated"> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    return "updated";
  }
  // Un seul compte admin : on remplace un éventuel ancien compte avec une autre adresse
  await AdminUser.deleteMany({});
  await AdminUser.create({ email, passwordHash });
  return "created";
}
