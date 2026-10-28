import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // Une base MongoDB en mémoire peut prendre quelques secondes à démarrer
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
