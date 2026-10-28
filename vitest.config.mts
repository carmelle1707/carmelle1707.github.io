import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // « server-only » bloque l'import hors de Next.js : on le neutralise pour les tests
    alias: { "server-only": new URL("./tests/helpers/empty.ts", import.meta.url).pathname },
    // Une base MongoDB en mémoire peut prendre quelques secondes à démarrer
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
