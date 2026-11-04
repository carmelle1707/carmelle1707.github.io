"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-session";
import { removeReplacedBlob } from "@/lib/blob";
import {
  COLLECTIONS,
  EDITABLE_COLLECTIONS,
  type EditableCollection,
  type FieldDef,
  readField,
} from "@/lib/collection-fields";
import { COLLECTION_SCHEMAS, modelOf } from "@/lib/collections-server";
import { connectDb } from "@/lib/db";
import { type FormState, failure, invalid } from "@/lib/form-state";
import { publishSite } from "@/lib/publish";
import { objectId, reorderSchema } from "@/schemas/common";

// Les arguments d'une action serveur viennent du navigateur : on les revalide tous
const editableKey = z.enum(EDITABLE_COLLECTIONS);

function done(key: EditableCollection, message: string): FormState {
  publishSite();
  revalidatePath(COLLECTIONS[key].path);
  revalidatePath("/admin");
  return { status: "success", message };
}

/** Crée (id null) ou modifie un élément d'une liste. */
export async function saveCollectionItem(
  key: string,
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const k = editableKey.safeParse(key);
  const itemId = id === null ? null : objectId.safeParse(id);
  if (!k.success || (itemId && !itemId.success)) return failure("Requête invalide.");

  const fields = COLLECTIONS[k.data].fields as readonly FieldDef[];
  const raw = Object.fromEntries(fields.map((f) => [f.name, readField(f, formData)]));
  const parsed = COLLECTION_SCHEMAS[k.data].safeParse(raw);
  if (!parsed.success) return invalid(parsed.error);

  await connectDb();
  const model = modelOf(k.data);
  if (itemId?.success) {
    const previous = await model
      .findOneAndUpdate({ _id: itemId.data }, { $set: parsed.data })
      .lean();
    if (!previous) return failure("Cet élément n'existe plus. Rechargez la page.");
    // Capture remplacée ou retirée : l'ancien fichier part du Blob
    const next = parsed.data as Record<string, unknown>;
    await Promise.all(
      fields
        .filter((f) => f.kind === "media")
        .map((f) =>
          removeReplacedBlob(
            previous[f.name] as { url: string } | null | undefined,
            next[f.name] as { url: string } | null,
          ),
        ),
    );
    return done(k.data, "Modification enregistrée et publiée.");
  }
  // Un nouvel élément se place à la fin de la liste
  const last = await model.findOne().sort({ order: -1 }).select({ order: 1 }).lean();
  await model.create({ ...parsed.data, order: (last?.order ?? -1) + 1 });
  return done(k.data, "Ajout enregistré et publié.");
}

export async function deleteCollectionItem(key: string, id: string): Promise<FormState> {
  await requireAdmin();
  const k = editableKey.safeParse(key);
  const itemId = objectId.safeParse(id);
  if (!k.success || !itemId.success) return failure("Requête invalide.");

  await connectDb();
  const doc = await modelOf(k.data).findOneAndDelete({ _id: itemId.data }).lean();
  if (!doc) return failure("Cet élément a déjà été supprimé.");
  // Un projet supprimé emporte sa capture d'écran
  await removeReplacedBlob(doc.image as { url: string } | null | undefined, null);
  return done(k.data, "Suppression effectuée.");
}

/** Nouvel ordre après un glisser-déposer : `ids` doit contenir tous les éléments, une fois. */
export async function reorderCollection(key: string, ids: string[]): Promise<FormState> {
  await requireAdmin();
  const k = editableKey.safeParse(key);
  const parsed = reorderSchema.safeParse({ ids });
  if (!k.success || !parsed.success) return failure("Requête invalide.");

  await connectDb();
  const model = modelOf(k.data);
  const unique = new Set(parsed.data.ids);
  const total = await model.countDocuments();
  const found = await model.countDocuments({ _id: { $in: [...unique] } });
  if (unique.size !== parsed.data.ids.length || found !== total || total !== unique.size) {
    return failure("La liste a changé entre-temps. Rechargez la page.");
  }
  await model.bulkWrite(
    parsed.data.ids.map((id, order) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order } } },
    })),
  );
  return done(k.data, "Nouvel ordre enregistré.");
}
