import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { AdminUser, Message, Profile, Project, RateLimit } from "@/models";
import type { PROJECT_TYPES } from "@/schemas/constants";
import { setupMemoryDb } from "./helpers/memory-db";

type ProjectType = (typeof PROJECT_TYPES)[number];

setupMemoryDb();

describe("modèles Mongoose", () => {
  it("crée un projet en brouillon par défaut, sans __v", async () => {
    const p = await Project.create({ title: "YOWL", desc: "Plateforme." });
    const raw = await mongoose.connection.collection("projects").findOne({ _id: p._id });
    expect(raw?.published).toBe(false);
    expect(raw?.image).toBeNull();
    expect(raw).not.toHaveProperty("__v");
    expect(raw?.createdAt).toBeInstanceOf(Date);
  });

  it("trie les projets selon le champ order", async () => {
    await Project.create([
      { title: "B", desc: "b", order: 1 },
      { title: "A", desc: "a", order: 0 },
    ]);
    const list = await Project.find().sort({ order: 1 }).lean();
    expect(list.map((p) => p.title)).toEqual(["A", "B"]);
  });

  it("n'autorise qu'un seul profil principal", async () => {
    const base = { name: "A", shortName: "A", role: "Dev", headline: "T", lead: "L" };
    await Profile.create(base);
    await expect(Profile.create(base)).rejects.toThrow(/duplicate key/);
  });

  it("enregistre l'email admin en minuscules et l'impose unique", async () => {
    await AdminUser.create({ email: "Admin@Site.CI", passwordHash: "x" });
    expect(await AdminUser.findOne({ email: "admin@site.ci" })).not.toBeNull();
    await expect(AdminUser.create({ email: "admin@site.ci", passwordHash: "y" })).rejects.toThrow();
  });

  it("marque les nouveaux messages comme non lus", async () => {
    const m = await Message.create({
      name: "Awa",
      email: "awa@exemple.ci",
      projectType: "site-vitrine",
      message: "Bonjour, je veux un site.",
    });
    expect(m.read).toBe(false);
    expect(m.archived).toBe(false);
  });

  it("refuse un type de projet inconnu", async () => {
    // Valeur volontairement hors de la liste, pour vérifier la validation côté base
    const projectType = "jeu" as ProjectType;
    await expect(
      Message.create({ name: "A", email: "a@b.ci", projectType, message: "x" }),
    ).rejects.toThrow(/projectType/);
  });

  it("déclare un index d'expiration sur les limites de fréquence", async () => {
    const indexes = await RateLimit.collection.indexes();
    const ttl = indexes.find((i) => i.key.expiresAt === 1);
    expect(ttl?.expireAfterSeconds).toBe(0);
  });
});
