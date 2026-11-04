import "server-only";
import contentJson from "../../data/content.json";
import { contentFromFile } from "@/lib/content-from-file";
import { connectDb } from "@/lib/db";
import { hasContent, seedContent, upsertAdmin } from "@/lib/seed";
import { AdminUser, RateLimit } from "@/models";
import { adminSeedSchema } from "@/schemas/auth";
import { contentFileSchema } from "@/schemas/content-file";

/**
 * Premier démarrage sur une base neuve (déploiement Vercel) : importe data/content.json
 * et crée le compte admin depuis ADMIN_EMAIL / ADMIN_PASSWORD, sans lancer `npm run seed`.
 * Ne remplace jamais un contenu ou un compte existant.
 */
async function run() {
  await connectDb();

  if (!(await hasContent())) {
    // Verrou : si plusieurs requêtes arrivent ensemble, une seule importe le contenu.
    // Il expire au bout de 10 minutes au cas où l'import échouerait en route.
    const locked = await RateLimit.create({
      key: "bootstrap:content",
      count: 1,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    }).then(
      () => true,
      (error: { code?: number }) => {
        if (error.code === 11000) return false;
        throw error;
      },
    );
    if (locked && !(await hasContent())) {
      await seedContent(contentFromFile(contentFileSchema.parse(contentJson)));
      console.log("[premier démarrage] contenu importé depuis data/content.json");
    }
  }

  if (!(await AdminUser.exists({}))) {
    const admin = adminSeedSchema.safeParse(process.env);
    if (admin.success) {
      await upsertAdmin(admin.data.ADMIN_EMAIL, admin.data.ADMIN_PASSWORD);
      console.log("[premier démarrage] compte admin créé");
    }
  }
}

const globalForBootstrap = globalThis as typeof globalThis & { __bootstrap?: Promise<void> };

/** Une seule fois par processus ; un échec est retenté à l'appel suivant. */
export function ensureBootstrap(): Promise<void> {
  globalForBootstrap.__bootstrap ??= run().catch((error: unknown) => {
    globalForBootstrap.__bootstrap = undefined;
    throw error;
  });
  return globalForBootstrap.__bootstrap;
}
