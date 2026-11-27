// Injecte le HTML pré-rendu dans dist/index.html après `vite build` et `vite build --ssr`.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const server = fileURLToPath(new URL("../dist-ssr/", import.meta.url));
const { render } = await import(`${server}entry-server.js`);
const template = await readFile(`${dist}index.html`, "utf8");
if (!template.includes("<!--app-->")) throw new Error("Marqueur <!--app--> absent de dist/index.html");
await writeFile(`${dist}index.html`, template.replace("<!--app-->", render()));
await rm(server, { recursive: true, force: true });
console.log("index.html pré-rendu");
