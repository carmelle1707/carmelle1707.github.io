import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { SITE_CONTENT_TAG } from "@/lib/content";

/**
 * Après une modification dans l'admin : le cache du contenu public est vidé et toutes les
 * pages publiques (accueil, pages d'offres et de projets, sitemap) sont régénérées.
 */
export function publishSite() {
  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
}
