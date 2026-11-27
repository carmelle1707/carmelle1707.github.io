// Après `vite build` et `vite build --ssr` : écrit le HTML pré-rendu de chaque page
// (accueil, projets, vidéo, 404) avec ses balises SEO, puis sitemap.xml et robots.txt.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const server = fileURLToPath(new URL("../dist-ssr/", import.meta.url));
const { render, headTags, sitemap, robots, ROUTES } = await import(`${server}entry-server.js`);
const template = await readFile(`${dist}index.html`, "utf8");
for (const mark of ["<!--app-->", "<!--head-->"]) {
  if (!template.includes(mark)) throw new Error(`Marqueur ${mark} absent de dist/index.html`);
}
for (const { path, file } of ROUTES) {
  const out = `${dist}${file}`;
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, template.replace("<!--head-->", headTags(path)).replace("<!--app-->", render(path)));
}
await writeFile(`${dist}sitemap.xml`, sitemap(new Date().toISOString().slice(0, 10)));
await writeFile(`${dist}robots.txt`, robots());
await rm(server, { recursive: true, force: true });
console.log(`${ROUTES.length} pages pré-rendues, sitemap.xml et robots.txt écrits`);
