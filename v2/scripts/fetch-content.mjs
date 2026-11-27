// Avant chaque build : récupère le contenu publié depuis l'admin du portfolio Next.js
// (une seule admin pour les deux sites). Si l'API ne répond pas, le dernier instantané
// (src/content/admin.json, versionné) sert tel quel : le build ne casse jamais pour ça.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API = process.env.CONTENT_API ?? "https://ange-carmelle-gbedji.vercel.app/api/public/content";
const out = fileURLToPath(new URL("../src/content/admin.json", import.meta.url));

/** Seulement ce que la V2 affiche. */
function pick(c) {
  const { name, shortName, role, bio, location, photo, cv } = c.profile;
  return {
    profile: { name, shortName, role, bio, location, photo, cv },
    contact: c.contact,
    projects: c.projects.map(({ slug, title, tag, desc, role, stack, image, demoUrl, githubUrl }) => ({
      slug, title, tag, desc, role, stack, image, demoUrl, githubUrl,
    })),
    skills: c.skills.map(({ group, items }) => ({ group, items })),
    education: c.education.map(({ period, title, desc }) => ({ period, title, desc })),
  };
}

try {
  const res = await fetch(API, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = pick(await res.json());
  if (!data.profile?.name || !Array.isArray(data.projects)) throw new Error("réponse incomplète");
  await writeFile(out, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`contenu de l'admin récupéré : ${data.projects.length} projets`);
} catch (error) {
  console.warn(`admin injoignable (${error.message}) : on garde src/content/admin.json`);
}
