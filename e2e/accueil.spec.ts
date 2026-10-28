import { expect, test } from "@playwright/test";

test("la page d'accueil affiche toutes les sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");

  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toHaveAccessibleName(
    "Je crée des sites et des apps mobiles qui font travailler votre business.",
  );
  await expect(title.locator("em")).toHaveText("travailler votre business");

  for (const id of ["services", "methode", "projets", "parcours", "contact"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  await expect(page.getByRole("heading", { name: "YOWL" })).toBeVisible();
});

test("aucun débordement horizontal", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
