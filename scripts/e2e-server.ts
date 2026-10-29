/**
 * Serveur des tests Playwright : base MongoDB jetable (en mémoire), contenu de data/content.json,
 * compte admin de test, puis `next start` sur le build existant. Rien ne touche à .env.local.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { E2E_ADMIN, E2E_PORT } from "../e2e/fixtures";
import { contentFromFile } from "../src/lib/content-from-file";
import { seedContent, upsertAdmin } from "../src/lib/seed";
import { contentFileSchema } from "../src/schemas/content-file";

async function main() {
  const server = await MongoMemoryServer.create();
  const uri = server.getUri("portfolio-e2e");

  await mongoose.connect(uri);
  await mongoose.connection.syncIndexes();
  const file = contentFileSchema.parse(JSON.parse(readFileSync("data/content.json", "utf8")));
  await seedContent(contentFromFile(file));
  await upsertAdmin(E2E_ADMIN.email, E2E_ADMIN.password);
  await mongoose.disconnect();

  const next = spawn("npx", ["next", "start", "-p", String(E2E_PORT)], {
    stdio: "inherit",
    env: {
      ...process.env,
      MONGODB_URI: uri,
      AUTH_SECRET: randomBytes(32).toString("base64"),
      RATE_LIMIT_SALT: "e2e",
      // Aucun email réel pendant les tests
      RESEND_API_KEY: "",
    },
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
