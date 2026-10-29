import { defineConfig, devices } from "@playwright/test";
import { E2E_PORT as PORT } from "./e2e/fixtures";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    locale: "fr-FR",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Base jetable + compte admin de test (voir scripts/e2e-server.ts). Lancer `npm run build` avant.
    command: "npx tsx scripts/e2e-server.ts",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
