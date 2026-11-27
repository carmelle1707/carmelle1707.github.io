import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { SITE_CONTENT_TAG } from "@/lib/content";

/**
 * Après une modification dans l'admin : le cache du contenu public est vidé et toutes les
 * pages publiques (accueil, pages d'offres et de projets, sitemap) sont régénérées.
 */
export function publishSite() {
  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
  // La V2 en 3D est un site statique : on la reconstruit pour qu'elle reprenne le nouveau contenu.
  const hook = process.env.V2_DEPLOY_HOOK_URL;
  if (hook) {
    after(async () => {
      try {
        await fetch(hook, { method: "POST" });
      } catch (error) {
        console.error("[publish] reconstruction de la V2 non déclenchée", error);
      }
    });
  }
}
