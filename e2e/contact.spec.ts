import { expect, test } from "@playwright/test";

test.describe("formulaire de contact", () => {
  test("signale les champs à corriger", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.getByRole("alert")).toContainText("Certains champs sont à corriger");
    await expect(page.getByLabel("Votre nom")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Votre nom")).toBeFocused();
  });

  test("envoie un message valide", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByLabel("Votre nom").fill("Test Playwright");
    await page.getByLabel("Votre email").fill("test@exemple.ci");
    await page.getByText("Application web", { exact: true }).click();
    await page
      .getByLabel("Votre projet")
      .fill("Un tableau de bord pour suivre mes ventes en ligne.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();

    await expect(page.getByRole("status")).toContainText("Message envoyé");
  });
});
