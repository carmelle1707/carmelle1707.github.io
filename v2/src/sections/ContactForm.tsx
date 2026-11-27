import { useState, type FormEvent } from "react";
import { CONTACT_API } from "../content/site";
import { setStage } from "../state/store";

/** Les mêmes choix que le formulaire du site Next.js : l'API les valide de la même façon. */
const PROJECT_TYPES = [
  ["site-vitrine", "Site vitrine"],
  ["application-web", "Application web"],
  ["application-mobile", "Application mobile"],
  ["autre", "Autre"],
] as const;

const BUDGETS = [
  ["", "Je ne sais pas encore"],
  ["moins-300k", "Moins de 300 000 FCFA"],
  ["300k-1m", "300 000 à 1 000 000 FCFA"],
  ["plus-1m", "Plus de 1 000 000 FCFA"],
  ["a-definir", "À définir ensemble"],
] as const;

type Field = "name" | "email" | "projectType" | "budget" | "message";
type State =
  | { status: "idle" | "sending" | "success" }
  | { status: "error"; message: string; fieldErrors: Partial<Record<Field, string>> };

/**
 * Le message part vers l'API du site Next.js : il arrive dans la même boîte de l'admin
 * et par email, avec la même protection anti-spam (champ piège, 5 messages par heure).
 */
export function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });
  const errors = state.status === "error" ? state.fieldErrors : {};

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ status: "sending" });
    try {
      const res = await fetch(CONTACT_API, { method: "POST", body: new FormData(form) });
      const data = (await res.json()) as State;
      if (data.status === "success") {
        form.reset();
        setState({ status: "success" });
        setStage({ celebrate: Date.now() });
      } else if (data.status === "error") {
        setState({ status: "error", message: data.message, fieldErrors: data.fieldErrors ?? {} });
        const first = Object.keys(data.fieldErrors ?? {})[0];
        if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      } else {
        throw new Error("réponse inattendue");
      }
    } catch {
      setState({
        status: "error",
        message: "Le message n'est pas parti. Réessayez, ou écrivez-moi sur WhatsApp.",
        fieldErrors: {},
      });
    }
  }

  const describe = (f: Field) => (errors[f] ? `contact-${f}-error` : undefined);
  const error = (f: Field) =>
    errors[f] ? (
      <p id={`contact-${f}-error`} className="field-error">
        {errors[f]}
      </p>
    ) : null;

  if (state.status === "success") {
    return (
      <div className="form-done" role="status">
        <p className="form-done-title">Message envoyé, merci.</p>
        <p>Je vous réponds sous 24 h, par email.</p>
        <button type="button" className="btn-text" onClick={() => setState({ status: "idle" })}>
          Écrire un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-name">Votre nom</label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe("name")}
          />
          {error("name")}
        </div>
        <div className="field">
          <label htmlFor="contact-email">Votre email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describe("email")}
          />
          {error("email")}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="contact-projectType">Type de projet</label>
          <select
            id="contact-projectType"
            name="projectType"
            required
            defaultValue=""
            aria-invalid={errors.projectType ? true : undefined}
            aria-describedby={describe("projectType")}
          >
            <option value="" disabled>
              Choisir
            </option>
            {PROJECT_TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {error("projectType")}
        </div>
        <div className="field">
          <label htmlFor="contact-budget">Budget (facultatif)</label>
          <select id="contact-budget" name="budget" defaultValue="" aria-describedby={describe("budget")}>
            {BUDGETS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {error("budget")}
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-message">Votre projet</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={20}
          maxLength={4000}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describe("message")}
        />
        {error("message")}
      </div>
      {/* Champ piège : invisible pour les visiteurs, rempli par les robots. */}
      <div className="trap" aria-hidden="true">
        <label htmlFor="contact-website">Ne pas remplir</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot">
        <button type="submit" className="btn btn-primary" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Envoi en cours" : "Envoyer le message"}
        </button>
        <p className="form-status" role="status" aria-live="polite">
          {state.status === "error" ? state.message : ""}
        </p>
      </div>
    </form>
  );
}
