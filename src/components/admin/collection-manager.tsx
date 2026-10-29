"use client";

import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCollectionItem, reorderCollection } from "@/actions/collections";
import {
  type CollectionItem,
  COLLECTIONS,
  type EditableCollection,
  summaryOf,
} from "@/lib/collection-fields";
import { CollectionEditor } from "./collection-editor";
import { ConfirmButton } from "./confirm-button";

type Props = { collection: EditableCollection; items: CollectionItem[] };

/**
 * Liste d'une collection : ajout, modification en place, suppression confirmée et
 * réordonnancement par glisser-déposer (souris, doigt ou clavier : Espace puis flèches).
 */
export function CollectionManager({ collection, items: initial }: Props) {
  const def = COLLECTIONS[collection];
  // Les données du serveur font foi : on ne garde un ordre local que pendant un déplacement
  const [items, setItems] = useState(initial);
  const [seen, setSeen] = useState(initial);
  if (seen !== initial) {
    setSeen(initial);
    setItems(initial);
  }
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [, startTransition] = useTransition();
  const close = useCallback(() => setEditing(null), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: string | number) => {
    const item = items.find((i) => i.id === id);
    return item ? summaryOf(collection, item).title : "l'élément";
  };
  const position = (id: string | number) => items.findIndex((i) => i.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${titleOf(active.id)} saisi, position ${position(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${titleOf(active.id)} déplacé en position ${position(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} déposé en position ${position(over.id)}.`
        : "Déplacement annulé.",
    onDragCancel: ({ active }) => `Déplacement de ${titleOf(active.id)} annulé.`,
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const before = items;
    const next = arrayMove(
      items,
      items.findIndex((i) => i.id === active.id),
      items.findIndex((i) => i.id === over.id),
    );
    setItems(next);
    startTransition(async () => {
      const res = await reorderCollection(
        collection,
        next.map((i) => i.id),
      ).catch(() => null);
      if (res?.status === "success") toast.success(res.message);
      else {
        setItems(before);
        toast.error(res?.status === "error" ? res.message : "Ordre non enregistré. Réessayez.");
      }
    });
  }

  async function remove(item: CollectionItem) {
    const res = await deleteCollectionItem(collection, item.id).catch(() => null);
    if (res?.status === "success") toast.success(res.message);
    else toast.error(res?.status === "error" ? res.message : "Suppression impossible.");
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {items.length > 1 ? "Glissez la poignée ⠿ pour changer l'ordre." : null}
        </p>
        {editing !== "new" && (
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => setEditing("new")}
          >
            + Ajouter {def.one}
          </button>
        )}
      </div>

      {editing === "new" && (
        <section
          aria-label={`Ajouter ${def.one}`}
          className="overflow-hidden rounded-[14px] border border-line"
        >
          <p className="bg-surface px-5 py-3 font-semibold">Nouvel élément</p>
          <CollectionEditor collection={collection} item={null} onDone={close} />
        </section>
      )}

      {items.length === 0 ? (
        <p className="rounded-[14px] border border-dashed border-line p-6 text-center text-muted">
          Aucun élément pour l&apos;instant.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                "Pour déplacer cet élément, appuyez sur Espace, utilisez les flèches haut et bas, puis Espace pour déposer ou Échap pour annuler.",
            },
          }}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <ol className="m-0 grid list-none divide-y divide-line overflow-hidden rounded-[14px] border border-line p-0">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  collection={collection}
                  editing={editing === item.id}
                  onEdit={() => setEditing(editing === item.id ? null : item.id)}
                  onClose={close}
                  onDelete={() => remove(item)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableRow({
  item,
  collection,
  editing,
  onEdit,
  onClose,
  onDelete,
}: {
  item: CollectionItem;
  collection: EditableCollection;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const { title, detail } = summaryOf(collection, item);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      className="sort-row"
      data-dragging={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="flex items-center gap-2 py-2 pr-3 pl-1.5 min-[641px]:pr-4">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="drag-handle"
          aria-label={`Déplacer « ${title} »`}
          {...attributes}
          {...listeners}
        >
          <svg width="12" height="18" viewBox="0 0 12 18" aria-hidden="true" fill="currentColor">
            {[3, 9, 15].flatMap((y) => [
              <circle key={`a${y}`} cx="3" cy={y} r="1.6" />,
              <circle key={`b${y}`} cx="9" cy={y} r="1.6" />,
            ])}
          </svg>
        </button>
        <div className="min-w-0 flex-1 py-1">
          <p className="truncate font-semibold">{title}</p>
          {detail && <p className="truncate text-sm text-muted">{detail}</p>}
        </div>
        <div className="flex flex-none gap-1">
          <button
            type="button"
            className="admin-btn admin-btn-quiet"
            aria-expanded={editing}
            aria-label={`Modifier « ${title} »`}
            onClick={onEdit}
          >
            Modifier
          </button>
          <ConfirmButton
            label="Supprimer"
            ariaLabel={`Supprimer « ${title} »`}
            title={`Supprimer « ${title} » ?`}
            message="Il disparaîtra aussi du site. Cette action est définitive."
            confirmLabel="Supprimer"
            onConfirm={onDelete}
          />
        </div>
      </div>
      {editing && <CollectionEditor collection={collection} item={item} onDone={onClose} />}
    </li>
  );
}
