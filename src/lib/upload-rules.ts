/** Types et tailles acceptés pour les fichiers envoyés depuis l'admin (partagé client / serveur). */
export const UPLOAD_RULES = {
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 4 * 1024 * 1024,
    label: "JPG, PNG, WebP ou AVIF, 4 Mo maximum",
  },
  pdf: {
    types: ["application/pdf"],
    maxBytes: 5 * 1024 * 1024,
    label: "PDF, 5 Mo maximum",
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

export function checkUpload(kind: UploadKind, file: { type: string; size: number }): string | null {
  const rule = UPLOAD_RULES[kind];
  if (!(rule.types as readonly string[]).includes(file.type))
    return `Format refusé : ${rule.label}.`;
  if (file.size > rule.maxBytes) return `Fichier trop lourd : ${rule.label}.`;
  return null;
}
