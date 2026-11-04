import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./login";

test("ajout d'un projet publié, visible ensuite sur le site", async ({ page }, testInfo) => {
  // Un nom différent par appareil testé : la base est partagée entre les projets Playwright
  const title = `Projet test ${testInfo.project.name}`;
  await loginAsAdmin(page);

  await page.getByRole("link", { name: "Projets" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Projets" })).toBeVisible();
  await page.getByRole("button", { name: "+ Ajouter un projet" }).click();

  const form = page.getByRole("region", { name: "Ajouter un projet" });
  await form.getByLabel("Publié sur le site").check();
  await form.getByLabel("Nom du projet").fill(title);
  await form
    .getByLabel("Description", { exact: true })
    .fill("Un projet créé par le test de bout en bout.");
  await form.getByLabel("Technologies").fill("Next.js\nPlaywright");
  await form.getByRole("button", { name: "Ajouter", exact: true }).click();

  await expect(page.getByText("Ajout enregistré et publié.")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: title })).toContainText("Publié");

  await page.goto("/");
  const card = page.locator("#projets article").filter({ hasText: title });
  await expect(card.getByRole("heading", { name: title })).toBeVisible();
  await expect(card.getByText("Playwright", { exact: true })).toBeVisible();
});
