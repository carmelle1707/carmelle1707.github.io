import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveContact, saveProfile, setAvailable } from "@/actions/profile";
import { idleState } from "@/lib/form-state";
import { Contact, Profile } from "@/models";
import { setupMemoryDb } from "./helpers/memory-db";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  publishSite: vi.fn(),
  del: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ connectDb: async () => undefined }));
vi.mock("@/lib/admin-session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/publish", () => ({ publishSite: mocks.publishSite }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@vercel/blob", () => ({ del: mocks.del }));

setupMemoryDb();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "admin@exemple.ci" });
  process.env.BLOB_READ_WRITE_TOKEN = "test";
});

const BLOB = "https://abc.public.blob.vercel-storage.com";

function profileForm(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const values: Record<string, string> = {
    name: "Ange Carmelle Gbedji",
    shortName: "Ange Carmelle",
    role: "Développeuse web et mobile",
    status: "Disponible",
    headline: "Je crée des *sites*",
    lead: "Texte d'introduction.",
    location: "Abidjan",
    "photo.url": `${BLOB}/profil/nouvelle.jpg`,
    "photo.pathname": "profil/nouvelle.jpg",
    "cv.url": "",
    ...overrides,
  };
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("saveProfile", () => {
  it("exige une session admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveProfile(idleState, profileForm())).rejects.toThrow("NEXT_REDIRECT");
    expect(await Profile.countDocuments()).toBe(0);
  });

  it("enregistre le profil, publie le site et lit l'interrupteur Disponible", async () => {
    const fd = profileForm();
    fd.set("available", "on");
    const res = await saveProfile(idleState, fd);

    expect(res.status).toBe("success");
    const saved = await Profile.findOne({ key: "main" }).lean();
    expect(saved).toMatchObject({ available: true, photo: { pathname: "profil/nouvelle.jpg" } });
    expect(saved?.cv).toBeNull();
    expect(mocks.publishSite).toHaveBeenCalledOnce();
  });

  it("case décochée = indisponible", async () => {
    await saveProfile(idleState, profileForm());
    expect((await Profile.findOne().lean())?.available).toBe(false);
  });

  it("renvoie les erreurs par champ sans rien enregistrer", async () => {
    const res = await saveProfile(
      idleState,
      profileForm({ name: "", "photo.url": "javascript:x" }),
    );
    expect(res.status).toBe("error");
    if (res.status !== "error") return;
    expect(res.fieldErrors.name).toBe("Le nom est requis.");
    expect(res.fieldErrors["photo.url"]).toBe("Adresse de fichier invalide.");
    expect(await Profile.countDocuments()).toBe(0);
    expect(mocks.publishSite).not.toHaveBeenCalled();
  });

  it("supprime l'ancienne photo du Blob, jamais une image de public/", async () => {
    await saveProfile(idleState, profileForm({ "photo.url": `${BLOB}/profil/ancienne.jpg` }));
    await saveProfile(idleState, profileForm());
    expect(mocks.del).toHaveBeenCalledWith(`${BLOB}/profil/ancienne.jpg`);

    await saveProfile(idleState, profileForm({ "photo.url": "/images/photo-profil.jpeg" }));
    mocks.del.mockClear();
    await saveProfile(idleState, profileForm());
    expect(mocks.del).not.toHaveBeenCalled();
  });
});

describe("setAvailable", () => {
  it("bascule la disponibilité, même sur une base vide", async () => {
    expect((await setAvailable(false)).status).toBe("success");
    expect((await Profile.findOne().lean())?.available).toBe(false);
    await setAvailable(true);
    expect((await Profile.findOne().lean())?.available).toBe(true);
    expect(await Profile.countDocuments()).toBe(1);
  });
});

describe("saveContact", () => {
  it("enregistre les coordonnées et refuse un lien invalide", async () => {
    const fd = new FormData();
    fd.set("title", "Parlons-en.");
    fd.set("whatsapp", "+225 01 05 45 87 67");
    fd.set("linkedin", "linkedin.com/in/moi");
    const bad = await saveContact(idleState, fd);
    expect(bad.status).toBe("error");

    fd.set("linkedin", "https://www.linkedin.com/in/moi");
    expect((await saveContact(idleState, fd)).status).toBe("success");
    expect(await Contact.findOne({ key: "main" }).lean()).toMatchObject({
      title: "Parlons-en.",
      email: "",
    });
  });
});
