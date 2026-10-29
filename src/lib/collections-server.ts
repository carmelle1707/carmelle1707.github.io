import "server-only";
import type { Model } from "mongoose";
import { connection } from "next/server";
import { type CollectionItem, COLLECTIONS, type EditableCollection } from "@/lib/collection-fields";
import { connectDb } from "@/lib/db";
import { type OrderedCollection, orderedModels } from "@/models";
import {
  educationSchema,
  marqueeWordSchema,
  serviceSchema,
  skillGroupSchema,
  stepSchema,
} from "@/schemas/content";

export const COLLECTION_SCHEMAS = {
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
  for (const f of COLLECTIONS[key].fields) {
    const v = doc[f.name];
    item[f.name] = Array.isArray(v) ? v.map(String) : String(v ?? "");
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
