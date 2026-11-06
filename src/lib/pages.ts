import "server-only";
import { getSiteContent } from "@/lib/content";
import { withSlugs } from "@/lib/slug";

/** Offres et projets avec leur adresse de page (`/services/<slug>`, `/projets/<slug>`). */
export async function getPagesContent() {
  const c = await getSiteContent();
  return {
    content: c,
    services: withSlugs(c.services, (s) => s.title),
    projects: withSlugs(c.projects, (p) => p.title),
  };
}

export const servicePath = (slug: string) => `/services/${slug}`;
export const projectPath = (slug: string) => `/projets/${slug}`;
