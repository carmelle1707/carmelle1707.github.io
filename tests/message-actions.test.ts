import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteMessage, setMessageArchived, setMessageRead } from "@/actions/messages";
import { Message } from "@/models";
import { setupMemoryDb } from "./helpers/memory-db";

const mocks = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

vi.mock("@/lib/db", () => ({ connectDb: async () => undefined }));
vi.mock("@/lib/admin-session", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

setupMemoryDb();

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue({ email: "admin@exemple.ci" });
});

const newMessage = () =>
  Message.create({
    name: "Awa",
    email: "awa@exemple.ci",
    projectType: "site-vitrine",
    message: "Je voudrais un site pour mon restaurant.",
  });

describe("actions de la boîte de réception", () => {
  it("exigent une session admin", async () => {
    const m = await newMessage();
    mocks.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(setMessageRead(String(m._id), true)).rejects.toThrow();
    await expect(deleteMessage(String(m._id))).rejects.toThrow();
    expect(await Message.countDocuments()).toBe(1);
  });

  it("marquent lu puis non lu", async () => {
    const m = await newMessage();
    expect((await setMessageRead(String(m._id), true)).status).toBe("success");
    expect((await Message.findById(m._id).lean())?.read).toBe(true);
    await setMessageRead(String(m._id), false);
    expect((await Message.findById(m._id).lean())?.read).toBe(false);
  });

  it("archivent (en marquant lu) puis désarchivent", async () => {
    const m = await newMessage();
    await setMessageArchived(String(m._id), true);
    expect(await Message.findById(m._id).lean()).toMatchObject({ archived: true, read: true });
    await setMessageArchived(String(m._id), false);
    expect(await Message.findById(m._id).lean()).toMatchObject({ archived: false, read: true });
  });

  it("suppriment, et refusent un identifiant invalide ou inconnu", async () => {
    const m = await newMessage();
    expect((await deleteMessage("pas-un-id")).status).toBe("error");
    expect((await deleteMessage(String(m._id))).status).toBe("success");
    expect(await Message.countDocuments()).toBe(0);
    expect((await deleteMessage(String(m._id))).status).toBe("error");
    expect((await setMessageRead(String(m._id), true)).status).toBe("error");
  });
});
