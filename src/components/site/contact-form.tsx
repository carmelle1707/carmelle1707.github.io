"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendContactMessage } from "@/actions/contact";
import type { ContactField, ContactFormState } from "@/lib/contact-submission";
import { BUDGETS, BUDGET_LABELS, PROJECT_TYPES, PROJECT_TYPE_LABELS } from "@/schemas/constants";

const idle: ContactFormState = { status: "idle" };

type ErrorState = Extract<ContactFormState, { status: "error" }> | null;

function FieldError({ field, error }: { field: ContactField; error: ErrorState }) {
  const text = error?.fieldErrors[field];
  if (!text) return null;
  return (
    <p id={`contact-${field}-error`} className="field-error">
      {text}
    </p>
  );
}

/** Formulaire de contact. Chaque nouvel envoi repart d'un formulaire vierge. */
export function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormInner key={round} onReset={() => setRound((r) => r + 1)} />;
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const [state, action, pending] = useActionState(sendContactMessage, idle);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // Après une erreur, le focus va au premier champ à corriger (ou au message général).
  useEffect(() => {
    if (state.status === "error") {
      const target =
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        formRef.current?.querySelector<HTMLElement>("[data-form-error]");
      target?.focus();
    }
    if (state.status === "success") doneRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="contact-done outline-none">
        <p className="font-display text-2xl font-bold">Message envoyé, merci.</p>
        <p className="mt-2 text-band-muted">
          Je l&apos;ai bien reçu et je vous réponds par email très vite.
        </p>
        <button type="button" className="contact-again mt-6" onClick={onReset}>
          Écrire un autre message
        </button>
      </div>
    );
  }

  const err = state.status === "error" ? state : null;
  const value = (f: ContactField) => err?.values[f] ?? "";
  const fieldProps = (f: ContactField) => ({
    id: `contact-${f}`,
    name: f,
    "aria-invalid": err?.fieldErrors[f] ? true : undefined,
    "aria-describedby": err?.fieldErrors[f] ? `contact-${f}-error` : undefined,
  });

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-6" aria-busy={pending}>
      {err && (
        <p data-form-error tabIndex={-1} role="alert" className="form-error outline-none">
          {err.message}
        </p>
      )}

      <div className="grid gap-6 min-[601px]:grid-cols-2">
        <div className="field">
          <label htmlFor="contact-name">Votre nom</label>
          <input {...fieldProps("name")} autoComplete="name" defaultValue={value("name")} />
          <FieldError field="name" error={err} />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Votre email</label>
          <input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            defaultValue={value("email")}
          />
          <FieldError field="email" error={err} />
        </div>
      </div>

      <fieldset className="field">
        <legend>Type de projet</legend>
        <div className="choices">
          {PROJECT_TYPES.map((t) => (
            <label key={t} className="choice">
              <input
                {...fieldProps("projectType")}
                id={undefined}
                type="radio"
                value={t}
                defaultChecked={value("projectType") === t}
              />
              <span>{PROJECT_TYPE_LABELS[t]}</span>
            </label>
          ))}
        </div>
        <FieldError field="projectType" error={err} />
      </fieldset>

      <div className="field">
        <label htmlFor="contact-budget">
          Budget <span className="optional">(facultatif)</span>
        </label>
        <select {...fieldProps("budget")} defaultValue={value("budget")}>
          <option value="">Je ne sais pas encore</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {BUDGET_LABELS[b]}
            </option>
          ))}
        </select>
        <FieldError field="budget" error={err} />
      </div>

      <div className="field">
        <label htmlFor="contact-message">Votre projet</label>
        <textarea
          {...fieldProps("message")}
          rows={6}
          placeholder="Votre activité, ce que vous voulez construire, vos délais…"
          defaultValue={value("message")}
        />
        <FieldError field="message" error={err} />
      </div>

      {/* Champ piège : invisible pour les humains, rempli par les robots */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <button type="submit" className="btn btn-gold" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le message"}
          <span className="arr" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}
