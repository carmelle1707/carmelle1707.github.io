import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "./fixtures";

test.describe("connexion admin", () => {
  test("une page admin sans session renvoie vers la connexion", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/connexion/);
    await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible();
  });

  test("refuse un mauvais mot de passe", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Mot de passe").fill("pas-le-bon-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByRole("alert")).toHaveText("Email ou mot de passe incorrect.");
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });

  test("connexion puis déconnexion de l'admin", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel("Email").fill(E2E_ADMIN.email);
    await page.getByLabel("Mot de passe").fill(E2E_ADMIN.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Voir le site/ })).toHaveAttribute("href", "/");

    await page.getByRole("button", { name: "Déconnexion" }).click();
    await expect(page).toHaveURL(/\/admin\/connexion/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/connexion/);
  });
});
