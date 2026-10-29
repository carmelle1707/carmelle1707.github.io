import { describe, expect, it, vi } from "vitest";
import { contactMailText } from "@/lib/contact-mail";
import { CONTACT_LIMIT, submitContact } from "@/lib/contact-submission";
import { Message } from "@/models";
import { setupMemoryDb } from "./helpers/memory-db";

// La connexion est déjà ouverte par setupMemoryDb
vi.mock("@/lib/db", () => ({ connectDb: async () => undefined }));

setupMemoryDb();

const valid = {
  name: "Awa Koné",
  email: "Awa@Exemple.ci",
  projectType: "site-vitrine",
  budget: "300k-1m",
  message: "Je voudrais un site pour présenter mon restaurant à Cocody.",
  website: "",
};

function form(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("submitContact", () => {
  it("enregistre le message et envoie l'email", async () => {
    const send = vi.fn().mockResolvedValue("sent");
    const res = await submitContact(form(valid), "1.1.1.1", { send });

    expect(res).toEqual({ status: "success" });
    const saved = await Message.findOne().lean();
    expect(saved).toMatchObject({ name: "Awa Koné", email: "awa@exemple.ci", read: false });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ budget: "300k-1m" }));
  });

  it("ignore en silence un robot qui remplit le champ piège", async () => {
    const send = vi.fn();
    const res = await submitContact(form({ ...valid, website: "spam" }), "1.1.1.1", { send });

    expect(res).toEqual({ status: "success" });
    expect(await Message.countDocuments()).toBe(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("renvoie les erreurs par champ et garde la saisie", async () => {
    const res = await submitContact(
      form({ name: "A", email: "pas-un-email", message: "trop court" }),
      "1.1.1.1",
      { send: vi.fn() },
    );

    expect(res.status).toBe("error");
    if (res.status !== "error") return;
    expect(Object.keys(res.fieldErrors).sort()).toEqual(
      ["email", "message", "name", "projectType"].sort(),
    );
    expect(res.values.email).toBe("pas-un-email");
    expect(await Message.countDocuments()).toBe(0);
  });

  it(`bloque au-delà de ${CONTACT_LIMIT} messages par heure pour une même IP`, async () => {
    const deps = { send: vi.fn() };
    for (let i = 0; i < CONTACT_LIMIT; i++) {
      expect((await submitContact(form(valid), "2.2.2.2", deps)).status).toBe("success");
    }
    const blocked = await submitContact(form(valid), "2.2.2.2", deps);
    expect(blocked.status).toBe("error");
    expect(await submitContact(form(valid), "3.3.3.3", deps)).toEqual({ status: "success" });
    expect(await Message.countDocuments()).toBe(CONTACT_LIMIT + 1);
  });

  it("garde le message même si l'email échoue", async () => {
    const send = vi.fn().mockRejectedValue(new Error("Resend en panne"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await submitContact(form(valid), "4.4.4.4", { send })).toEqual({ status: "success" });
    expect(await Message.countDocuments()).toBe(1);
    spy.mockRestore();
  });
});

describe("contactMailText", () => {
  it("met les libellés lisibles et signale un budget absent", () => {
    const text = contactMailText({
      ...valid,
      projectType: "application-mobile",
      budget: undefined,
    });
    expect(text).toContain("Projet : Application mobile");
    expect(text).toContain("Budget : non précisé");
    expect(text).toContain(valid.message);
  });
});
