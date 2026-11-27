// Après `vite build` et `vite build --ssr` : injecte le HTML pré-rendu et les balises SEO
// dans dist/index.html, puis écrit sitemap.xml et robots.txt à partir du même contenu.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const server = fileURLToPath(new URL("../dist-ssr/", import.meta.url));
const { render, headTags, sitemap, robots } = await import(`${server}entry-server.js`);
const template = await readFile(`${dist}index.html`, "utf8");
for (const mark of ["<!--app-->", "<!--head-->"]) {
  if (!template.includes(mark)) throw new Error(`Marqueur ${mark} absent de dist/index.html`);
}
await writeFile(`${dist}index.html`, template.replace("<!--head-->", headTags()).replace("<!--app-->", render()));
await writeFile(`${dist}sitemap.xml`, sitemap(new Date().toISOString().slice(0, 10)));
await writeFile(`${dist}robots.txt`, robots());
await rm(server, { recursive: true, force: true });
console.log("index.html pré-rendu, sitemap.xml et robots.txt écrits");
