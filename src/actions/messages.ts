"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import { connectDb } from "@/lib/db";
import { type FormState, failure } from "@/lib/form-state";
import { Message } from "@/models";
import { objectId } from "@/schemas/common";

// Les messages ne sont jamais publics : pas de publication du site ici,
// seulement la boîte de réception et les compteurs de l'admin.
async function update(id: string, set: { read?: boolean; archived?: boolean }, message: string) {
  await requireAdmin();
  const parsed = objectId.safeParse(id);
  if (!parsed.success) return failure("Requête invalide.");
  await connectDb();
  const res = await Message.updateOne({ _id: parsed.data }, { $set: set });
  if (res.matchedCount === 0) return failure("Ce message n'existe plus.");
  revalidatePath("/admin", "layout");
  return { status: "success", message } satisfies FormState;
}

export async function setMessageRead(id: string, read: boolean): Promise<FormState> {
  if (typeof read !== "boolean") return failure("Valeur invalide.");
  return update(id, { read }, read ? "Marqué comme lu." : "Marqué comme non lu.");
}

export async function setMessageArchived(id: string, archived: boolean): Promise<FormState> {
  if (typeof archived !== "boolean") return failure("Valeur invalide.");
  // Un message archivé est forcément traité : on le marque lu au passage
  return update(
    id,
    archived ? { archived, read: true } : { archived },
    archived ? "Message archivé." : "Message remis dans la boîte de réception.",
  );
}

export async function deleteMessage(id: string): Promise<FormState> {
  await requireAdmin();
  const parsed = objectId.safeParse(id);
  if (!parsed.success) return failure("Requête invalide.");
  await connectDb();
  const res = await Message.deleteOne({ _id: parsed.data });
  if (res.deletedCount === 0) return failure("Ce message a déjà été supprimé.");
  revalidatePath("/admin", "layout");
  return { status: "success", message: "Message supprimé." };
}
