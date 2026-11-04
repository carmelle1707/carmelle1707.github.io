import "server-only";
import type { Model } from "mongoose";
import { connection } from "next/server";
import {
  type CollectionItem,
  COLLECTIONS,
  type EditableCollection,
  type FieldDef,
} from "@/lib/collection-fields";
import { connectDb } from "@/lib/db";
import { type OrderedCollection, orderedModels } from "@/models";
import {
  educationSchema,
  marqueeWordSchema,
  projectSchema,
  serviceSchema,
  skillGroupSchema,
  stepSchema,
} from "@/schemas/content";

export const COLLECTION_SCHEMAS = {
  projects: projectSchema,
  services: serviceSchema,
  steps: stepSchema,
  skills: skillGroupSchema,
  education: educationSchema,
  marquee: marqueeWordSchema,
} as const;

type AnyDoc = Record<string, unknown> & { order: number };

/** Les modèles n'ont pas le même type : on les manipule ici par leurs champs communs. */
export const modelOf = (key: OrderedCollection) => orderedModels[key] as unknown as Model<AnyDoc>;

function toItem(key: EditableCollection, doc: Record<string, unknown>): CollectionItem {
  const item: CollectionItem = { id: String(doc._id) };
  for (const f of COLLECTIONS[key].fields as readonly FieldDef[]) {
    const v = doc[f.name];
    if (f.kind === "switch") item[f.name] = Boolean(v);
    else if (f.kind === "media") {
      const m = v as { url?: string; pathname?: string } | null | undefined;
      item[f.name] = m?.url ? { url: m.url, pathname: m.pathname ?? "" } : null;
    } else item[f.name] = Array.isArray(v) ? v.map(String) : String(v ?? "");
  }
  return item;
}

/** Lecture fraîche (jamais mise en cache ni pré-rendue) pour l'admin. */
export async function getCollectionItems(key: EditableCollection): Promise<CollectionItem[]> {
  await connection();
  await connectDb();
  const docs = await modelOf(key).find().sort({ order: 1, _id: 1 }).lean();
  return docs.map((d) => toItem(key, d));
}
