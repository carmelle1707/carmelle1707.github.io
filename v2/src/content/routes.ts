import { PROJECTS, type Project } from "./site";

/** Les pages de la V2 : l'accueil, une page par projet, la vidéo. Tout est pré-rendu au build. */
export type Route =
  | { kind: "home"; path: "/" }
  | { kind: "project"; path: string; project: Project }
  | { kind: "video"; path: "/video" }
  | { kind: "notfound"; path: string };

export const projectPath = (slug: string) => `/projets/${slug}`;

export function matchRoute(raw: string): Route {
  const path = raw.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  if (path === "/") return { kind: "home", path: "/" };
  if (path === "/video") return { kind: "video", path: "/video" };
  const m = path.match(/^\/projets\/([^/]+)$/);
  const project = m && PROJECTS.find((p) => p.slug === decodeURIComponent(m[1]));
  if (project) return { kind: "project", path, project };
  return { kind: "notfound", path };
}

/** Chaque page à écrire dans dist/, avec le fichier qui la sert. */
export const ROUTES: { path: string; file: string }[] = [
  { path: "/", file: "index.html" },
  { path: "/video", file: "video/index.html" },
  ...PROJECTS.map((p) => ({ path: projectPath(p.slug), file: `projets/${p.slug}/index.html` })),
  { path: "/404", file: "404.html" },
];
