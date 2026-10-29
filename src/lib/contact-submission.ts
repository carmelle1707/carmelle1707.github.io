import "server-only";
import { connectDb } from "@/lib/db";
import { type ContactMail, sendContactMail } from "@/lib/contact-mail";
import { consumeRateLimit, hashIp } from "@/lib/rate-limit";
import { Message } from "@/models";
import { contactMessageSchema } from "@/schemas/message";

export const CONTACT_FIELDS = ["name", "email", "projectType", "budget", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<ContactField, string>>;
      values: Partial<Record<ContactField, string>>;
    };

/** 5 messages par heure et par visiteur. */
export const CONTACT_LIMIT = 5;
export const CONTACT_WINDOW_MS = 60 * 60 * 1000;

type Deps = { send: (m: ContactMail) => Promise<unknown> };

export async function submitContact(
  formData: FormData,
  ip: string,
  deps: Deps = { send: sendContactMail },
): Promise<ContactFormState> {
  const raw = Object.fromEntries(
    [...CONTACT_FIELDS, "website"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const values = Object.fromEntries(CONTACT_FIELDS.map((k) => [k, raw[k]]));

  // Champ piège rempli : c'est un robot. On répond « envoyé » sans rien enregistrer.
  if (raw.website) return { status: "success" };

  const parsed = contactMessageSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField;
      fieldErrors[field] ??= issue.message;
    }
    return { status: "error", message: "Certains champs sont à corriger.", fieldErrors, values };
  }

  const fail = (message: string): ContactFormState => ({
    status: "error",
    message,
    fieldErrors: {},
    values,
  });

  try {
    await connectDb();
    const allowed = await consumeRateLimit(
      `contact:${hashIp(ip)}`,
      CONTACT_LIMIT,
      CONTACT_WINDOW_MS,
    );
    if (!allowed) {
      return fail("Vous avez envoyé plusieurs messages en peu de temps. Réessayez dans une heure.");
    }
    const { name, email, projectType, budget, message } = parsed.data;
    const data = { name, email, projectType, budget, message };
    await Message.create(data);

    // Le message est enregistré : un échec d'email ne doit pas faire échouer l'envoi.
    try {
      await deps.send(data);
    } catch (error) {
      console.error("[contact] email non envoyé", error);
    }
    return { status: "success" };
  } catch (error) {
    console.error("[contact] enregistrement impossible", error);
    return fail("L'envoi n'a pas abouti. Réessayez ou écrivez-moi sur WhatsApp.");
  }
}
