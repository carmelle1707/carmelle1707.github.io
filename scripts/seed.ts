/**
 * npm run seed            → remplit la base depuis data/content.json (si elle est vide)
 * npm run seed -- --force → remplace le contenu existant (les messages sont conservés)
 * Crée ou met à jour le compte admin depuis ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import mongoose from "mongoose";
import { contentFromFile } from "../src/lib/content-from-file";
import { hasContent, seedContent, upsertAdmin } from "../src/lib/seed";
import { adminSeedSchema } from "../src/schemas/auth";
import { contentFileSchema } from "../src/schemas/content-file";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquant dans .env.local");
  const admin = adminSeedSchema.safeParse(process.env);
  if (!admin.success) throw new Error(admin.error.issues.map((i) => i.message).join("\n"));

  const file = contentFileSchema.parse(
    JSON.parse(readFileSync(join(process.cwd(), "data/content.json"), "utf8")),
  );

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  await mongoose.connection.syncIndexes();

  const force = process.argv.includes("--force");
  if ((await hasContent()) && !force) {
    console.log("• Contenu déjà présent : rien n'est écrasé (ajoute --force pour tout remplacer).");
  } else {
    await seedContent(contentFromFile(file));
    console.log("✓ Contenu importé depuis data/content.json");
  }

  const result = await upsertAdmin(admin.data.ADMIN_EMAIL, admin.data.ADMIN_PASSWORD);
  console.log(result === "created" ? "✓ Compte admin créé" : "✓ Mot de passe admin mis à jour");
}

main()
  .catch((error: unknown) => {
    console.error("✗ Seed impossible :", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
