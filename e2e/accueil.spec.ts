import { expect, test } from "@playwright/test";

test("la page d'accueil s'affiche avec le titre mis en valeur", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toBeVisible();
  await expect(title.locator("em")).toHaveText("travailler votre business");
});
