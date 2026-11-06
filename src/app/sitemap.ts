import type { MetadataRoute } from "next";
import { getPagesContent, projectPath, servicePath } from "@/lib/pages";
import { siteUrl } from "@/lib/site-url";

/** Accueil, une page par offre et une page par projet publié. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = siteUrl();
  const { services, projects } = await getPagesContent();
  return [
    { url: `${url}/`, changeFrequency: "monthly", priority: 1 },
    ...services.map((s) => ({
      url: `${url}${servicePath(s.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: `${url}${projectPath(p.slug)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
