import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { SITE_CONTENT_TAG } from "@/lib/content";

/**
 * Après une modification dans l'admin : le cache du contenu public est vidé
 * et la page d'accueil est régénérée à la prochaine visite.
 */
export function publishSite() {
  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/");
}
