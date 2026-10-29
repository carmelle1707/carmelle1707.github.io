import { describe, expect, it, vi } from "vitest";
import { LOGIN_LIMIT, verifyAdminCredentials } from "@/lib/admin-auth";
import { upsertAdmin } from "@/lib/seed";
import { setupMemoryDb } from "./helpers/memory-db";

vi.mock("@/lib/db", () => ({ connectDb: async () => undefined }));

setupMemoryDb();

const EMAIL = "admin@exemple.ci";
const PASSWORD = "un-mot-de-passe-solide";

describe("verifyAdminCredentials", () => {
  it("accepte le bon mot de passe, sans tenir compte de la casse de l'email", async () => {
    await upsertAdmin(EMAIL, PASSWORD);
    const res = await verifyAdminCredentials(
      { email: " Admin@Exemple.CI ", password: PASSWORD },
      "ip",
    );
    expect(res).toMatchObject({ ok: true, admin: { email: EMAIL } });
  });

  it("refuse un mauvais mot de passe ou un email inconnu", async () => {
    await upsertAdmin(EMAIL, PASSWORD);
    expect(await verifyAdminCredentials({ email: EMAIL, password: "faux" }, "ip")).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(
      await verifyAdminCredentials({ email: "autre@exemple.ci", password: PASSWORD }, "ip"),
    ).toEqual({ ok: false, reason: "invalid" });
  });

  it("refuse une saisie mal formée", async () => {
    expect(await verifyAdminCredentials({ email: "x", password: "" }, "ip")).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it(`bloque après ${LOGIN_LIMIT} tentatives, même avec le bon mot de passe`, async () => {
    await upsertAdmin(EMAIL, PASSWORD);
    for (let i = 0; i < LOGIN_LIMIT; i++) {
      await verifyAdminCredentials({ email: EMAIL, password: "faux" }, "9.9.9.9");
    }
    expect(await verifyAdminCredentials({ email: EMAIL, password: PASSWORD }, "9.9.9.9")).toEqual({
      ok: false,
      reason: "rate-limited",
    });
    // Une autre IP n'est pas concernée
    expect((await verifyAdminCredentials({ email: EMAIL, password: PASSWORD }, "8.8.8.8")).ok).toBe(
      true,
    );
  });
});
