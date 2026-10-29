"use client";

import { saveProfile } from "@/actions/profile";
import type { SiteContent } from "@/lib/content-types";
import { FieldSet, SwitchField, TextField } from "./fields";
import { MediaField } from "./media-field";
import { useAdminForm } from "./use-admin-form";

type Props = { profile: SiteContent["profile"]; uploadsEnabled: boolean };

export function ProfileForm({ profile: p, uploadsEnabled }: Props) {
  const { formRef, onSubmit, pending, ready, errors } = useAdminForm(saveProfile);
  return (
    <form ref={formRef} method="post" onSubmit={onSubmit} className="grid gap-6" noValidate>
      <FieldSet title="Disponibilité">
        <SwitchField
          name="available"
          label="Disponible pour de nouveaux projets"
          description="Affiche le badge vert en haut du site."
          defaultChecked={p.available}
        />
        <TextField
          name="status"
          label="Texte du badge"
          defaultValue={p.status}
          error={errors.status}
          placeholder="Disponible pour de nouveaux projets"
          maxLength={80}
        />
      </FieldSet>

      <FieldSet title="Identité">
        <div className="grid gap-5 min-[641px]:grid-cols-2">
          <TextField
            name="name"
            label="Nom complet"
            defaultValue={p.name}
            error={errors.name}
            required
            autoComplete="name"
          />
          <TextField
            name="shortName"
            label="Nom dans le menu"
            defaultValue={p.shortName}
            error={errors.shortName}
            required
          />
        </div>
        <TextField name="role" label="Métier" defaultValue={p.role} error={errors.role} required />
      </FieldSet>

      <FieldSet title="Accroche">
        <TextField
          name="headline"
          label="Grand titre"
          defaultValue={p.headline}
          error={errors.headline}
          hint="Entourez de *étoiles* les mots à mettre en italique doré."
          required
          maxLength={160}
        />
        <TextField
          name="lead"
          label="Texte d'introduction"
          defaultValue={p.lead}
          error={errors.lead}
          rows={4}
          required
          maxLength={600}
        />
        <TextField
          name="badge"
          label="Texte du cercle qui tourne"
          defaultValue={p.badge}
          error={errors.badge}
          maxLength={60}
        />
      </FieldSet>

      <FieldSet title="Fiche pratique">
        <div className="grid gap-5 min-[641px]:grid-cols-3">
          <TextField
            name="location"
            label="Basée à"
            defaultValue={p.location}
            error={errors.location}
          />
          <TextField
            name="language"
            label="Langue"
            defaultValue={p.language}
            error={errors.language}
          />
          <TextField
            name="response"
            label="Délai de réponse"
            defaultValue={p.response}
            error={errors.response}
          />
        </div>
      </FieldSet>

      <FieldSet title="Fichiers">
        <MediaField
          name="photo"
          label="Photo de profil"
          kind="image"
          folder="profil"
          defaultValue={p.photo}
          uploadsEnabled={uploadsEnabled}
          error={errors["photo.url"] ?? errors.photo}
        />
        <MediaField
          name="cv"
          label="CV"
          kind="pdf"
          folder="cv"
          defaultValue={p.cv}
          uploadsEnabled={uploadsEnabled}
          error={errors["cv.url"] ?? errors.cv}
        />
      </FieldSet>

      <SaveBar pending={pending} ready={ready} />
    </form>
  );
}

/** Barre d'enregistrement collée en bas de l'écran : toujours à portée sur mobile. */
export function SaveBar({ pending, ready }: { pending: boolean; ready: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-5 border-t border-line bg-bg/95 px-5 py-3 backdrop-blur-sm">
      <button
        type="submit"
        className="admin-btn admin-btn-primary w-full min-[641px]:w-auto"
        disabled={pending || !ready}
      >
        {pending ? "Enregistrement…" : "Enregistrer et publier"}
      </button>
    </div>
  );
}
