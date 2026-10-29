import "server-only";
import { Resend } from "resend";
import type { ContactMessageInput } from "@/schemas/message";
import { BUDGET_LABELS, PROJECT_TYPE_LABELS } from "@/schemas/constants";

export type ContactMail = Pick<
  ContactMessageInput,
  "name" | "email" | "projectType" | "budget" | "message"
>;

/** Texte de l'email reçu par Ange Carmelle ; « Répondre » écrit directement au visiteur. */
export function contactMailText(m: ContactMail): string {
  return [
    `Nouveau message depuis le portfolio`,
    ``,
    `Nom : ${m.name}`,
    `Email : ${m.email}`,
    `Projet : ${PROJECT_TYPE_LABELS[m.projectType]}`,
    `Budget : ${m.budget ? BUDGET_LABELS[m.budget] : "non précisé"}`,
    ``,
    m.message,
  ].join("\n");
}

/**
 * Envoie la notification par Resend. Sans RESEND_API_KEY, l'envoi est ignoré :
 * le message reste enregistré en base et visible dans l'admin.
 */
export async function sendContactMail(m: ContactMail): Promise<"sent" | "skipped"> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    console.warn("[contact] RESEND_API_KEY ou CONTACT_TO_EMAIL absent : email non envoyé.");
    return "skipped";
  }
  const { error } = await new Resend(key).emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    to,
    replyTo: m.email,
    subject: `Portfolio : ${m.name} (${PROJECT_TYPE_LABELS[m.projectType]})`,
    text: contactMailText(m),
  });
  if (error) throw new Error(`Resend : ${error.message}`);
  return "sent";
}
