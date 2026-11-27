import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Three.js n'est importé que par la scène, chargée à part (import dynamique dans App.tsx) :
    // le texte de la page s'affiche sans l'attendre. Le gros fichier 3D est donc attendu.
    chunkSizeWarningLimit: 1100,
  },
});
