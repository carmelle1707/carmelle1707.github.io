"use client";

import { saveContact } from "@/actions/profile";
import type { SiteContent } from "@/lib/content-types";
import { FieldSet, TextField } from "./fields";
import { SaveBar } from "./profile-form";
import { useAdminForm } from "./use-admin-form";

export function ContactInfoForm({ contact: c }: { contact: SiteContent["contact"] }) {
  const { formRef, onSubmit, pending, ready, errors } = useAdminForm(saveContact);
  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} className="grid gap-6" noValidate>
      <FieldSet title="Section contact">
        <TextField
          name="title"
          label="Titre"
          defaultValue={c.title}
          error={errors.title}
          hint="Entourez de *étoiles* les mots à mettre en italique doré."
          required
        />
        <TextField name="text" label="Texte" defaultValue={c.text} error={errors.text} rows={3} />
      </FieldSet>

      <FieldSet title="Moyens de contact">
        <p className="-mt-2 text-sm text-muted">
          Un champ laissé vide n&apos;apparaît pas sur le site.
        </p>
        <div className="grid gap-5 min-[641px]:grid-cols-2">
          <TextField
            name="whatsapp"
            label="WhatsApp"
            type="tel"
            defaultValue={c.whatsapp}
            error={errors.whatsapp}
            placeholder="+225 01 02 03 04 05"
          />
          <TextField
            name="email"
            label="Email affiché"
            type="email"
            defaultValue={c.email}
            error={errors.email}
            hint="Les messages du formulaire arrivent toujours sur CONTACT_TO_EMAIL."
          />
          <TextField
            name="linkedin"
            label="LinkedIn"
            type="url"
            defaultValue={c.linkedin}
            error={errors.linkedin}
            placeholder="https://www.linkedin.com/in/…"
          />
          <TextField
            name="github"
            label="GitHub"
            type="url"
            defaultValue={c.github}
            error={errors.github}
            placeholder="https://github.com/…"
          />
        </div>
      </FieldSet>

      <SaveBar pending={pending} ready={ready} />
    </form>
  );
}
