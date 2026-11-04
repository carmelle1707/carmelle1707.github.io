import { COLLECTIONS, type EditableCollection } from "@/lib/collection-fields";
import { getCollectionItems } from "@/lib/collections-server";
import { CollectionManager } from "./collection-manager";

/** Page admin d'une liste : titre, rappel de ce qu'elle contrôle sur le site, puis la liste. */
export async function CollectionPage({ collection }: { collection: EditableCollection }) {
  const def = COLLECTIONS[collection];
  const items = await getCollectionItems(collection);
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[32px] font-extrabold">{def.title}</h1>
        <p className="mt-1 text-muted">{def.intro}</p>
      </div>
      <CollectionManager
        collection={collection}
        items={items}
        uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
      />
    </div>
  );
}
