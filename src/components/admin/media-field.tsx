"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { Media } from "@/schemas/common";
import { UPLOAD_RULES, type UploadKind, checkUpload } from "@/lib/upload-rules";

type Props = {
  name: string;
  label: string;
  kind: UploadKind;
  folder: string;
  defaultValue: Media;
  /** false quand BLOB_READ_WRITE_TOKEN manque : on affiche l'existant sans pouvoir envoyer. */
  uploadsEnabled: boolean;
  error?: string;
};

/**
 * Fichier (image ou PDF) envoyé directement vers Vercel Blob. Le formulaire parent reçoit
 * l'adresse via deux champs cachés ; rien n'est enregistré tant qu'on n'a pas cliqué sur Enregistrer.
 */
export function MediaField({
  name,
  label,
  kind,
  folder,
  defaultValue,
  uploadsEnabled,
  error,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<Media>(defaultValue);
  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const rule = UPLOAD_RULES[kind];
  const changed = media?.url !== defaultValue?.url;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    const refused = checkUpload(kind, file);
    if (refused) return setProblem(refused);
    setProgress(0);
    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        clientPayload: kind,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      setMedia({ url: blob.url, pathname: blob.pathname });
    } catch (e) {
      setProblem(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const message = problem ?? error;
  return (
    <div className="grid gap-2" role="group" aria-labelledby={`${id}-label`}>
      <span id={`${id}-label`} className="text-sm font-semibold">
        {label}
      </span>
      <input type="hidden" name={`${name}.url`} value={media?.url ?? ""} />
      <input type="hidden" name={`${name}.pathname`} value={media?.pathname ?? ""} />

      <div className="flex flex-wrap items-center gap-4 rounded-[10px] border border-line bg-bg p-3">
        {media && kind === "image" ? (
          <Image
            src={media.url}
            alt=""
            width={72}
            height={90}
            unoptimized
            className="h-[90px] w-[72px] rounded-md border border-line object-cover"
          />
        ) : null}
        <div className="grid min-w-0 flex-1 gap-1 text-sm">
          {media ? (
            <a
              href={media.url}
              target="_blank"
              rel="noopener"
              className="truncate text-second underline underline-offset-2"
            >
              {media.pathname || media.url}
            </a>
          ) : (
            <span className="text-muted">Aucun fichier</span>
          )}
          {changed && (
            <span className="text-xs text-muted">Nouveau fichier : pensez à enregistrer.</span>
          )}
          {progress !== null && (
            <span className="text-xs text-muted" aria-live="polite">
              Envoi… {progress} %
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={`${id}-file`}
            type="file"
            accept={rule.types.join(",")}
            className="sr-only"
            disabled={!uploadsEnabled || progress !== null}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <label
            htmlFor={`${id}-file`}
            className="admin-btn aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-disabled={!uploadsEnabled || progress !== null}
          >
            {media ? "Remplacer" : "Choisir un fichier"}
          </label>
          {media && (
            <button
              type="button"
              className="admin-btn admin-btn-quiet"
              onClick={() => setMedia(null)}
            >
              Retirer
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">
        {uploadsEnabled
          ? rule.label
          : "Envoi désactivé : ajoutez BLOB_READ_WRITE_TOKEN dans .env.local."}
      </p>
      {message && (
        <p className="text-sm text-danger" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
