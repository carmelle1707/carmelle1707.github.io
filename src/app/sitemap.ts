import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** Une seule page publique : l'accueil (les sections sont des ancres). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl()}/`, changeFrequency: "monthly", priority: 1 }];
}
