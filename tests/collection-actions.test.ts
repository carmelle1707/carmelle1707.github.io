import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCollectionItem, reorderCollection, saveCollectionItem } from "@/actions/collections";
import { idleState } from "@/lib/form-state";
import { MarqueeWord, Project, Service, Step } from "@/models";
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

const form = (values: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
};

const service = {
  icon: "web",
  title: "Site vitrine",
  desc: "Un site clair et rapide.",
  features: "Design sur mesure\n\nHébergement\nDesign sur mesure\n",
  for: "Commerces",
};

describe("saveCollectionItem", () => {
  it("exige une session admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveCollectionItem("services", null, idleState, form(service))).rejects.toThrow();
    expect(await Service.countDocuments()).toBe(0);
  });

  it("ajoute à la fin, une ligne = un point (sans vides ni doublons), puis publie", async () => {
    await Step.create({ title: "A", desc: "a", order: 0 });
    await saveCollectionItem("steps", null, idleState, form({ title: "B", desc: "b" }));
    const steps = await Step.find().sort({ order: 1 }).lean();
    expect(steps.map((s) => s.title)).toEqual(["A", "B"]);

    const res = await saveCollectionItem("services", null, idleState, form(service));
    expect(res.status).toBe("success");
    const saved = await Service.findOne().lean();
    expect(saved?.features).toEqual(["Design sur mesure", "Hébergement"]);
    expect(mocks.publishSite).toHaveBeenCalledTimes(2);
  });

  it("modifie un élément existant", async () => {
    const word = await MarqueeWord.create({ text: "Vite", order: 0 });
    const res = await saveCollectionItem(
      "marquee",
      String(word._id),
      idleState,
      form({ text: "Rapide" }),
    );
    expect(res.status).toBe("success");
    expect((await MarqueeWord.findById(word._id).lean())?.text).toBe("Rapide");
  });

  it("renvoie les erreurs par champ et refuse une collection ou un id inconnus", async () => {
    const res = await saveCollectionItem(
      "services",
      null,
      idleState,
      form({ ...service, title: "", icon: "x" }),
    );
    expect(res.status).toBe("error");
    if (res.status === "error") {
      expect(res.fieldErrors.title).toBe("Le nom du service est requis.");
      expect(res.fieldErrors.icon).toBe("Icône inconnue.");
    }
    expect((await saveCollectionItem("admins", null, idleState, form({}))).status).toBe("error");
    expect((await saveCollectionItem("steps", "pas-un-id", idleState, form({}))).status).toBe(
      "error",
    );
    expect(mocks.publishSite).not.toHaveBeenCalled();
  });
});

describe("reorderCollection", () => {
  it("enregistre le nouvel ordre", async () => {
    const [a, b, c] = await Step.create([
      { title: "A", desc: "a", order: 0 },
      { title: "B", desc: "b", order: 1 },
      { title: "C", desc: "c", order: 2 },
    ]);
    const res = await reorderCollection(
      "steps",
      [c, a, b].map((s) => String(s._id)),
    );
    expect(res.status).toBe("success");
    const titles = (await Step.find().sort({ order: 1 }).lean()).map((s) => s.title);
    expect(titles).toEqual(["C", "A", "B"]);
  });

  it("refuse une liste incomplète ou avec doublons", async () => {
    const [a, b] = await Step.create([
      { title: "A", desc: "a", order: 0 },
      { title: "B", desc: "b", order: 1 },
    ]);
    expect((await reorderCollection("steps", [String(a._id)])).status).toBe("error");
    expect((await reorderCollection("steps", [String(a._id), String(a._id)])).status).toBe("error");
    expect((await Step.findById(b._id).lean())?.order).toBe(1);
  });
});

describe("deleteCollectionItem", () => {
  it("supprime l'élément", async () => {
    const s = await Step.create({ title: "A", desc: "a", order: 0 });
    expect((await deleteCollectionItem("steps", String(s._id))).status).toBe("success");
    expect(await Step.countDocuments()).toBe(0);
    expect((await deleteCollectionItem("steps", String(s._id))).status).toBe("error");
  });

  it("supprime aussi la capture d'un projet stockée dans le Blob", async () => {
    const url = "https://abc.public.blob.vercel-storage.com/projets/flot.png";
    const p = await Project.create({
      title: "Flot",
      desc: "d",
      image: { url, pathname: "projets/flot.png" },
    });
    await deleteCollectionItem("projects", String(p._id));
    expect(mocks.del).toHaveBeenCalledWith(url);
  });
});

describe("projets", () => {
  const project = {
    title: "Flot",
    desc: "Application de suivi de trésorerie.",
    stack: "Next.js\nMongoDB\n",
    demoUrl: "",
    githubUrl: "https://github.com/carmelle1707/flot",
  };
  const BLOB = "https://abc.public.blob.vercel-storage.com/projets";

  it("crée un brouillon quand l'interrupteur « Publié » est décoché", async () => {
    const res = await saveCollectionItem("projects", null, idleState, form(project));
    expect(res.status).toBe("success");
    expect(await Project.findOne().lean()).toMatchObject({
      published: false,
      stack: ["Next.js", "MongoDB"],
      image: null,
    });
  });

  it("publie, refuse un lien invalide et remplace la capture en supprimant l'ancienne", async () => {
    const bad = await saveCollectionItem(
      "projects",
      null,
      idleState,
      form({ ...project, demoUrl: "flot.ci" }),
    );
    expect(bad.status).toBe("error");
    if (bad.status === "error") expect(bad.fieldErrors.demoUrl).toMatch(/https:\/\//);

    const p = await Project.create({
      ...project,
      stack: [],
      image: { url: `${BLOB}/ancienne.png`, pathname: "projets/ancienne.png" },
      order: 0,
    });
    const res = await saveCollectionItem(
      "projects",
      String(p._id),
      idleState,
      form({
        ...project,
        published: "on",
        "image.url": `${BLOB}/nouvelle.png`,
        "image.pathname": "projets/nouvelle.png",
      }),
    );
    expect(res.status).toBe("success");
    const saved = await Project.findById(p._id).lean();
    expect(saved).toMatchObject({ published: true, image: { pathname: "projets/nouvelle.png" } });
    expect(mocks.del).toHaveBeenCalledWith(`${BLOB}/ancienne.png`);
  });
});
