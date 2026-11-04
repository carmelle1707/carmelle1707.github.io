import { expect, type Page } from "@playwright/test";
import { E2E_ADMIN } from "./fixtures";

/** Ouvre une session admin avec le compte de test. */
export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/connexion");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Mot de passe").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
}
