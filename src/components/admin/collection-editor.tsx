"use client";

import { useEffect, useId } from "react";
import { saveCollectionItem } from "@/actions/collections";
import {
  type CollectionItem,
  COLLECTIONS,
  type EditableCollection,
  type FieldDef,
  type FieldValue,
  type MediaValue,
} from "@/lib/collection-fields";
import { MediaField } from "./media-field";
import { useAdminForm } from "./use-admin-form";

type Props = {
  collection: EditableCollection;
  item: CollectionItem | null;
  uploadsEnabled: boolean;
  onDone: () => void;
};

/** Formulaire d'ajout ou de modification d'un élément, construit d'après COLLECTIONS. */
export function CollectionEditor({ collection, item, uploadsEnabled, onDone }: Props) {
  const fields = COLLECTIONS[collection].fields as readonly FieldDef[];
  const action = saveCollectionItem.bind(null, collection, item?.id ?? null);
  const { formRef, onSubmit, pending, ready, errors, state } = useAdminForm(action);
  const uid = useId();

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state, onDone]);

  // Une erreur sur `features.3` ou `image.url` s'affiche sous le champ `features` / `image`
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
      {fields.map((f) =>
        f.kind === "media" ? (
          <MediaField
            key={f.name}
            name={f.name}
            label={f.label}
            kind="image"
            folder={f.folder ?? collection}
            defaultValue={(item?.[f.name] as MediaValue) ?? null}
            uploadsEnabled={uploadsEnabled}
            error={errorFor(f.name)}
          />
        ) : (
          <Field
            key={f.name}
            id={`${uid}-${f.name}`}
            field={f}
            value={item?.[f.name]}
            error={errorFor(f.name)}
          />
        ),
      )}
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
  value: FieldValue | undefined;
  error?: string;
}) {
  const describedBy = [f.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const aria = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  };
  const hint = f.hint && (
    <p id={`${id}-hint`} className="text-xs text-muted">
      {f.hint}
    </p>
  );
  const errorText = error && (
    <p id={`${id}-error`} className="text-sm text-danger">
      {error}
    </p>
  );

  if (f.kind === "switch") {
    return (
      <div className="grid gap-1.5">
        <div className="flex items-start justify-between gap-4 rounded-[10px] border border-line bg-surface p-3.5">
          <div className="grid gap-0.5">
            <label htmlFor={id} className="text-sm font-semibold">
              {f.label}
            </label>
            {hint}
          </div>
          <input
            id={id}
            name={f.name}
            type="checkbox"
            role="switch"
            defaultChecked={value === true}
            className="admin-switch"
            {...aria}
          />
        </div>
        {errorText}
      </div>
    );
  }

  const common = {
    id,
    name: f.name,
    className: "admin-input",
    maxLength: f.maxLength,
    placeholder: f.placeholder,
    ...aria,
  };
  const text = Array.isArray(value) ? value.join("\n") : typeof value === "string" ? value : "";

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
      ) : f.kind === "text" || f.kind === "url" ? (
        <input
          {...common}
          type={f.kind === "url" ? "url" : "text"}
          inputMode={f.kind === "url" ? "url" : undefined}
          defaultValue={text}
        />
      ) : (
        <textarea {...common} rows={f.kind === "lines" ? 5 : 3} defaultValue={text} />
      )}
      {hint}
      {errorText}
    </div>
  );
}
