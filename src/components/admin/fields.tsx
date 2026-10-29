import type { HTMLInputTypeAttribute } from "react";

type TextFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  type?: HTMLInputTypeAttribute;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
};

/** Champ texte (ou zone de texte avec `rows`) avec libellé, aide et erreur reliés. */
export function TextField({ name, label, error, hint, rows, required, ...rest }: TextFieldProps) {
  const id = `field-${name}`;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  const common = {
    id,
    name,
    className: "admin-input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    ...rest,
  };
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {!required && <span className="font-normal text-muted"> (facultatif)</span>}
      </label>
      {rows ? <textarea rows={rows} {...common} /> : <input {...common} />}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
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

/** Interrupteur on/off (case à cocher accessible, rôle switch). */
export function SwitchField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex items-start justify-between gap-4 rounded-[10px] border border-line bg-bg p-3.5">
      <div className="grid gap-0.5">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {description && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {description}
          </p>
        )}
      </div>
      <input
        id={id}
        name={name}
        type="checkbox"
        role="switch"
        defaultChecked={defaultChecked}
        aria-describedby={description ? `${id}-hint` : undefined}
        className="admin-switch"
      />
    </div>
  );
}

/** Groupe de champs titré, pour découper les longs formulaires. */
export function FieldSet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-5 rounded-[14px] border border-line bg-surface p-5 min-[641px]:p-6">
      <legend className="px-1 font-display text-lg font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}
