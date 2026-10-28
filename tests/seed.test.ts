import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { contentFromFile, siteContentFromFile } from "@/lib/content-from-file";
import { hasContent, seedContent, upsertAdmin } from "@/lib/seed";
import { AdminUser, MarqueeWord, Message, Profile, Project, Service } from "@/models";
import { contentFileSchema } from "@/schemas/content-file";
import { setupMemoryDb } from "./helpers/memory-db";

setupMemoryDb();

const file = contentFileSchema.parse(JSON.parse(readFileSync("data/content.json", "utf8")));

describe("contentFromFile", () => {
  it("reprend les chemins d'images rangés dans public/", () => {
    const c = contentFromFile(file);
    expect(c.profile.photo?.url).toBe("/images/photo-profil.jpeg");
    expect(c.profile.cv?.url).toBe("/cv.pdf");
    expect(c.projects.find((p) => p.title === "YOWL")?.image?.url).toBe("/images/yowl.png");
  });

  it("laisse sans image un projet dont le fichier n'existe pas (CinéScope)", () => {
    expect(contentFromFile(file).projects.find((p) => p.title === "CinéScope")?.image).toBeNull();
  });

  it("publie les projets de départ et renomme les liens", () => {
    const flot = contentFromFile(file).projects[0];
    expect(flot.published).toBe(true);
    expect(flot.githubUrl).toBe("https://github.com/carmelle1707");
  });

  it("donne un identifiant à chaque élément pour la page publique", () => {
    const site = siteContentFromFile(file);
    expect(site.services.map((s) => s.id)).toEqual(["service-0", "service-1", "service-2"]);
    expect(site.marquee).toEqual(file.marquee);
  });
});

describe("seed", () => {
  it("importe tout le contenu dans l'ordre de content.json", async () => {
    expect(await hasContent()).toBe(false);
    await seedContent(contentFromFile(file));
    expect(await hasContent()).toBe(true);
    const services = await Service.find().sort({ order: 1 }).lean();
    expect(services.map((s) => s.title)).toEqual(file.services.map((s) => s.title));
    expect(await Project.countDocuments({ published: true })).toBe(4);
    expect(await MarqueeWord.countDocuments()).toBe(4);
  });

  it("peut être relancé sans doublons et conserve les messages", async () => {
    await Message.create({
      name: "Awa",
      email: "awa@exemple.ci",
      projectType: "autre",
      message: "Un message à garder.",
    });
    await seedContent(contentFromFile(file));
    await seedContent(contentFromFile(file));
    expect(await Profile.countDocuments()).toBe(1);
    expect(await Service.countDocuments()).toBe(3);
    expect(await Message.countDocuments()).toBe(1);
  });

  it("crée le compte admin avec un mot de passe hashé, puis le met à jour", async () => {
    expect(await upsertAdmin("admin@exemple.ci", "un-mot-de-passe-solide")).toBe("created");
    const admin = await AdminUser.findOne({ email: "admin@exemple.ci" }).lean();
    expect(admin?.passwordHash).not.toContain("un-mot-de-passe-solide");
    expect(await bcrypt.compare("un-mot-de-passe-solide", admin?.passwordHash ?? "")).toBe(true);

    expect(await upsertAdmin("admin@exemple.ci", "nouveau-mot-de-passe")).toBe("updated");
    const updated = await AdminUser.findOne({ email: "admin@exemple.ci" }).lean();
    expect(await bcrypt.compare("nouveau-mot-de-passe", updated?.passwordHash ?? "")).toBe(true);
  });

  it("ne garde qu'un seul compte admin si l'adresse change", async () => {
    await upsertAdmin("ancien@exemple.ci", "un-mot-de-passe-solide");
    await upsertAdmin("nouveau@exemple.ci", "un-mot-de-passe-solide");
    expect(await AdminUser.countDocuments()).toBe(1);
  });
});
