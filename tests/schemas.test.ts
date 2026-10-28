import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adminSeedSchema, loginSchema } from "@/schemas/auth";
import { reorderSchema } from "@/schemas/common";
import {
  contactSchema,
  profileSchema,
  projectSchema,
  serviceSchema,
  skillGroupSchema,
} from "@/schemas/content";
import { contentFileSchema } from "@/schemas/content-file";
import { contactMessageSchema } from "@/schemas/message";

const validMessage = {
  name: "Awa Koné",
  email: "Awa@Exemple.ci",
  projectType: "site-vitrine",
  budget: "",
  message: "Bonjour, je voudrais un site pour mon restaurant à Cocody.",
  website: "",
};

describe("contactMessageSchema", () => {
  it("accepte un message valide et normalise l'email", () => {
    const r = contactMessageSchema.parse(validMessage);
    expect(r.email).toBe("awa@exemple.ci");
    expect(r.budget).toBeUndefined();
  });

  it("refuse un honeypot rempli", () => {
    expect(
      contactMessageSchema.safeParse({ ...validMessage, website: "http://spam" }).success,
    ).toBe(false);
  });

  it("refuse un message trop court avec un message en français", () => {
    const r = contactMessageSchema.safeParse({ ...validMessage, message: "Salut" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toMatch(/20 caractères/);
  });

  it("refuse un type de projet inconnu", () => {
    expect(contactMessageSchema.safeParse({ ...validMessage, projectType: "jeu" }).success).toBe(
      false,
    );
  });

  it("accepte un budget connu", () => {
    expect(contactMessageSchema.parse({ ...validMessage, budget: "300k-1m" }).budget).toBe(
      "300k-1m",
    );
  });
});

describe("projectSchema", () => {
  const base = { title: "YOWL", desc: "Plateforme de commentaires." };

  it("applique les valeurs par défaut (brouillon, sans image)", () => {
    const r = projectSchema.parse(base);
    expect(r.published).toBe(false);
    expect(r.image).toBeNull();
    expect(r.demoUrl).toBe("");
  });

  it("nettoie les technologies (vides et doublons)", () => {
    const r = projectSchema.parse({ ...base, stack: ["Laravel", " ", "Laravel", "SQL"] });
    expect(r.stack).toEqual(["Laravel", "SQL"]);
  });

  it("refuse un lien qui n'est pas en http(s)", () => {
    expect(projectSchema.safeParse({ ...base, githubUrl: "javascript:alert(1)" }).success).toBe(
      false,
    );
  });

  it("accepte une image locale ou Vercel Blob, pas un autre schéma", () => {
    expect(projectSchema.safeParse({ ...base, image: { url: "/images/yowl.png" } }).success).toBe(
      true,
    );
    expect(
      projectSchema.safeParse({
        ...base,
        image: { url: "https://x.public.blob.vercel-storage.com/a.png" },
      }).success,
    ).toBe(true);
    expect(
      projectSchema.safeParse({ ...base, image: { url: "data:image/png;base64,AA" } }).success,
    ).toBe(false);
  });

  it("refuse une adresse « //domaine » déguisée en chemin local", () => {
    expect(
      projectSchema.safeParse({ ...base, image: { url: "//evil.example/a.png" } }).success,
    ).toBe(false);
  });

  it("exige un titre", () => {
    expect(projectSchema.safeParse({ ...base, title: "  " }).success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("refuse une icône inconnue", () => {
    expect(
      serviceSchema.safeParse({ icon: "rocket", title: "Site", desc: "Un site." }).success,
    ).toBe(false);
  });
});

describe("contactSchema", () => {
  it("accepte un email vide mais pas un email invalide", () => {
    expect(contactSchema.safeParse({ title: "Contact", email: "" }).success).toBe(true);
    expect(contactSchema.safeParse({ title: "Contact", email: "pas-un-email" }).success).toBe(
      false,
    );
  });

  it("valide le numéro WhatsApp", () => {
    expect(contactSchema.safeParse({ title: "C", whatsapp: "+225 01 05 45 87 67" }).success).toBe(
      true,
    );
    expect(contactSchema.safeParse({ title: "C", whatsapp: "appelez-moi" }).success).toBe(false);
  });
});

describe("skillGroupSchema / reorderSchema", () => {
  it("garde les outils dans l'ordre", () => {
    expect(
      skillGroupSchema.parse({ group: "Mobile", items: ["React Native", "Expo"] }).items,
    ).toEqual(["React Native", "Expo"]);
  });

  it("refuse un identifiant invalide", () => {
    expect(reorderSchema.safeParse({ ids: ["123"] }).success).toBe(false);
    expect(reorderSchema.safeParse({ ids: ["65a1f0c2b3d4e5f6a7b8c9d0"] }).success).toBe(true);
  });
});

describe("auth", () => {
  it("normalise l'email de connexion", () => {
    expect(loginSchema.parse({ email: " Admin@Site.CI ", password: "x" }).email).toBe(
      "admin@site.ci",
    );
  });

  it("exige un mot de passe admin d'au moins 12 caractères", () => {
    expect(
      adminSeedSchema.safeParse({ ADMIN_EMAIL: "a@b.ci", ADMIN_PASSWORD: "court" }).success,
    ).toBe(false);
  });
});

describe("data/content.json", () => {
  const raw: unknown = JSON.parse(readFileSync("data/content.json", "utf8"));

  it("respecte le format attendu par le seed", () => {
    expect(contentFileSchema.safeParse(raw).success).toBe(true);
  });

  it("produit un profil valide", () => {
    const { profile } = contentFileSchema.parse(raw);
    const r = profileSchema.safeParse({
      ...profile,
      photo: { url: "/images/photo-profil.jpeg" },
      cv: null,
    });
    expect(r.success).toBe(true);
  });
});
