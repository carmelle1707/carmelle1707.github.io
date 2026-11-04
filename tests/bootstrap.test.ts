import bcrypt from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureBootstrap } from "@/lib/bootstrap";
import { serverSecret } from "@/lib/secrets";
import { AdminUser, Profile, Project, Service } from "@/models";
import { setupMemoryDb } from "./helpers/memory-db";

vi.mock("@/lib/db", () => ({ connectDb: async () => undefined }));

setupMemoryDb();

const reset = () => {
  (globalThis as { __bootstrap?: unknown }).__bootstrap = undefined;
};

afterEach(() => {
  reset();
  vi.unstubAllEnvs();
});

describe("premier démarrage", () => {
  it("importe le contenu de départ et crée l'admin sur une base vide", async () => {
    vi.stubEnv("ADMIN_EMAIL", "Moi@Exemple.ci");
    vi.stubEnv("ADMIN_PASSWORD", "un-mot-de-passe-solide");
    await ensureBootstrap();

    expect(await Profile.countDocuments()).toBe(1);
    expect(await Project.countDocuments({ published: true })).toBe(4);
    const admin = await AdminUser.findOne().lean();
    expect(admin?.email).toBe("moi@exemple.ci");
    expect(await bcrypt.compare("un-mot-de-passe-solide", admin?.passwordHash ?? "")).toBe(true);
  });

  it("ne duplique rien quand plusieurs démarrages arrivent en même temps", async () => {
    await Promise.all([
      ensureBootstrap(),
      (reset(), ensureBootstrap()),
      (reset(), ensureBootstrap()),
    ]);
    reset();
    await ensureBootstrap();
    expect(await Profile.countDocuments()).toBe(1);
    expect(await Service.countDocuments()).toBe(3);
  });

  it("ne touche ni au contenu ni au compte existants", async () => {
    await Profile.create({
      key: "main",
      name: "X",
      shortName: "X",
      role: "R",
      headline: "H",
      lead: "L",
    });
    await AdminUser.create({ email: "deja@exemple.ci", passwordHash: "hash" });
    vi.stubEnv("ADMIN_EMAIL", "autre@exemple.ci");
    vi.stubEnv("ADMIN_PASSWORD", "un-mot-de-passe-solide");
    await ensureBootstrap();

    expect(await Service.countDocuments()).toBe(0);
    expect((await AdminUser.find().lean()).map((a) => a.email)).toEqual(["deja@exemple.ci"]);
  });

  it("sans ADMIN_EMAIL / ADMIN_PASSWORD, n'invente pas de compte", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("ADMIN_PASSWORD", "");
    await ensureBootstrap();
    expect(await AdminUser.countDocuments()).toBe(0);
  });
});

describe("serverSecret", () => {
  it("préfère la variable dédiée, sinon dérive une clé stable de MONGODB_URI", () => {
    vi.stubEnv("AUTH_SECRET", "explicite");
    expect(serverSecret("AUTH_SECRET")).toBe("explicite");

    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("RATE_LIMIT_SALT", "");
    vi.stubEnv("MONGODB_URI", "mongodb+srv://u:motdepasse@x.mongodb.net/portfolio");
    const auth = serverSecret("AUTH_SECRET");
    expect(auth).toHaveLength(44);
    expect(serverSecret("AUTH_SECRET")).toBe(auth);
    expect(serverSecret("RATE_LIMIT_SALT")).not.toBe(auth);
    expect(auth).not.toContain("motdepasse");

    vi.stubEnv("MONGODB_URI", "");
    expect(serverSecret("AUTH_SECRET")).toBeUndefined();
  });
});
