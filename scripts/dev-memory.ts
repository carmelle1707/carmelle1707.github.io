/**
 * npm run dev:memory → lance le site avec une base MongoDB locale (aucune clé Atlas nécessaire).
 * Les données sont gardées dans .data/mongo entre deux lancements.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { contentFromFile } from "../src/lib/content-from-file";
import { hasContent, seedContent, upsertAdmin } from "../src/lib/seed";
import { adminSeedSchema } from "../src/schemas/auth";
import { contentFileSchema } from "../src/schemas/content-file";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Pas de .env.local : le site marche quand même, seul l'admin ne sera pas créé
}

async function main() {
  const dbPath = join(process.cwd(), ".data/mongo");
  mkdirSync(dbPath, { recursive: true });
  const server = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: "wiredTiger", port: 27027 },
  });
  const uri = server.getUri("portfolio");

  await mongoose.connect(uri);
  await mongoose.connection.syncIndexes();
  if (!(await hasContent())) {
    const file = contentFileSchema.parse(JSON.parse(readFileSync("data/content.json", "utf8")));
    await seedContent(contentFromFile(file));
    console.log("✓ Base locale remplie depuis data/content.json");
  }
  const admin = adminSeedSchema.safeParse(process.env);
  if (admin.success) await upsertAdmin(admin.data.ADMIN_EMAIL, admin.data.ADMIN_PASSWORD);
  await mongoose.disconnect();

  // Sans AUTH_SECRET, un secret temporaire suffit en local (les sessions sautent au redémarrage)
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = randomBytes(32).toString("base64");
    console.warn("! AUTH_SECRET absent de .env.local : secret temporaire utilisé.");
  }
  if (!admin.success) {
    console.warn("! ADMIN_EMAIL / ADMIN_PASSWORD absents : aucun compte admin pour se connecter.");
  }

  const next = spawn("npx", ["next", "dev", ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, MONGODB_URI: uri },
  });
  const stop = async () => {
    next.kill("SIGINT");
    await server.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  next.on("exit", stop);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
