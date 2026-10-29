import "server-only";
import { del } from "@vercel/blob";

export const isBlobUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

/**
 * Supprime l'ancien fichier quand il a été remplacé ou retiré.
 * Les fichiers de public/ (images de départ) ne sont jamais touchés. Un échec n'empêche pas
 * l'enregistrement : au pire, un fichier orphelin reste dans le Blob.
 */
export async function removeReplacedBlob(
  previous: { url: string } | null | undefined,
  next: { url: string } | null | undefined,
) {
  if (!previous || previous.url === next?.url || !isBlobUrl(previous.url)) return;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(previous.url);
  } catch (error) {
    console.error("[blob] suppression impossible", error);
  }
}
