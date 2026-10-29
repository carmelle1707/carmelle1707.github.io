"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { starterContent } from "@/lib/content";
import { removeReplacedBlob } from "@/lib/blob";
import { connectDb } from "@/lib/db";
import { type FormState, failure, invalid, mediaFrom, textFrom } from "@/lib/form-state";
import { publishSite } from "@/lib/publish";
import { Contact, Profile } from "@/models";
import { contactSchema, profileSchema } from "@/schemas/content";

const PROFILE_TEXT = [
  "name",
  "shortName",
  "role",
  "status",
  "headline",
  "lead",
  "location",
  "language",
  "response",
  "badge",
] as const;
const CONTACT_TEXT = ["title", "text", "whatsapp", "email", "linkedin", "github"] as const;

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = profileSchema.safeParse({
    ...Object.fromEntries(PROFILE_TEXT.map((k) => [k, textFrom(formData, k)])),
    available: formData.get("available") === "on",
    photo: mediaFrom(formData, "photo"),
    cv: mediaFrom(formData, "cv"),
  });
  if (!parsed.success) return invalid(parsed.error);

  await connectDb();
  const previous = await Profile.findOne({ key: "main" }).lean();
  await Profile.updateOne({ key: "main" }, { $set: parsed.data }, { upsert: true });
  await Promise.all([
    removeReplacedBlob(previous?.photo, parsed.data.photo),
    removeReplacedBlob(previous?.cv, parsed.data.cv),
  ]);

  publishSite();
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Profil enregistré. Le site est à jour." };
}

/** Bascule rapide « Disponible » depuis le tableau de bord. */
export async function setAvailable(available: boolean): Promise<FormState> {
  await requireAdmin();
  if (typeof available !== "boolean") return failure("Valeur invalide.");
  await connectDb();
  const exists = await Profile.exists({ key: "main" });
  if (exists) {
    await Profile.updateOne({ key: "main" }, { $set: { available } });
  } else {
    // Base encore vide : on part du contenu de départ
    await Profile.create({ ...starterContent().profile, key: "main", available });
  }
  publishSite();
  revalidatePath("/admin", "layout");
  return {
    status: "success",
    message: available
      ? "Le badge « Disponible » est affiché sur le site."
      : "Le badge « Disponible » est masqué sur le site.",
  };
}

export async function saveContact(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = contactSchema.safeParse(
    Object.fromEntries(CONTACT_TEXT.map((k) => [k, textFrom(formData, k)])),
  );
  if (!parsed.success) return invalid(parsed.error);

  await connectDb();
  await Contact.updateOne({ key: "main" }, { $set: parsed.data }, { upsert: true });
  publishSite();
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Coordonnées enregistrées. Le site est à jour." };
}
