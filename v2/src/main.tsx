import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "./styles/app.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// En production, la page est pré-rendue (scripts/prerender.mjs) : on hydrate le HTML existant.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
