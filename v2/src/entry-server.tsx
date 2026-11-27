// Point d'entrée du pré-rendu (Node) : pas de rechargement à chaud ici.
/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

export { headTags, robots, sitemap } from "./seo";
export { ROUTES } from "./content/routes";

/** Rendu HTML de la page, sans la scène 3D : lisible sans JavaScript et par les moteurs de recherche. */
export function render(path = "/") {
  return renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  );
}
