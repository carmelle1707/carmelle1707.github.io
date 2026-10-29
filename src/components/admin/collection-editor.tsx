"use client";

import { useEffect, useId } from "react";
import { saveCollectionItem } from "@/actions/collections";
import {
  type CollectionItem,
  COLLECTIONS,
  type EditableCollection,
  type FieldDef,
} from "@/lib/collection-fields";
import { useAdminForm } from "./use-admin-form";

type Props = {
  collection: EditableCollection;
  item: CollectionItem | null;
  onDone: () => void;
};

/** Formulaire d'ajout ou de modification d'un élément, construit d'après COLLECTIONS. */
export function CollectionEditor({ collection, item, onDone }: Props) {
  const def = COLLECTIONS[collection];
  const action = saveCollectionItem.bind(null, collection, item?.id ?? null);
  const { formRef, onSubmit, pending, ready, errors, state } = useAdminForm(action);
  const uid = useId();

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);

  // Une erreur sur `features.3` s'affiche sous le champ `features`
  const errorFor = (name: string) =>
    errors[name] ?? Object.entries(errors).find(([k]) => k.startsWith(`${name}.`))?.[1];

  return (
    <form
      ref={formRef}
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="grid gap-4 border-t border-line bg-bg p-4 min-[641px]:p-5"
    >
      {def.fields.map((f: FieldDef) => (
        <Field
          key={f.name}
          id={`${uid}-${f.name}`}
          field={f}
          value={item?.[f.name]}
          error={errorFor(f.name)}
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending || !ready}>
          {pending ? "Enregistrement…" : item ? "Enregistrer" : "Ajouter"}
        </button>
        <button type="button" className="admin-btn" onClick={onDone} disabled={pending}>
          Annuler
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  field: f,
  value,
  error,
}: {
  id: string;
  field: FieldDef;
  value: string | string[] | undefined;
  error?: string;
}) {
  const describedBy = [f.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const common = {
    id,
    name: f.name,
    className: "admin-input",
    maxLength: f.maxLength,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  };
  const text = Array.isArray(value) ? value.join("\n") : (value ?? "");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {f.label}
        {!f.required && <span className="font-normal text-muted"> (facultatif)</span>}
      </label>
      {f.kind === "select" ? (
        <select {...common} defaultValue={text || f.options?.[0]?.value}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : f.kind === "text" ? (
        <input {...common} defaultValue={text} />
      ) : (
        <textarea {...common} rows={f.kind === "lines" ? 5 : 3} defaultValue={text} />
      )}
      {f.hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {f.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
