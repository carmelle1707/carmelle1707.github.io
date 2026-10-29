"use server";

import { headers } from "next/headers";
import { type ContactFormState, submitContact } from "@/lib/contact-submission";

/** Action du formulaire de contact public (utilisée avec useActionState). */
export async function sendContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
  return submitContact(formData, ip);
}
