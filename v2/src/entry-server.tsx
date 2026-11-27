import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

export { headTags, robots, sitemap } from "./seo";

/** Rendu HTML de la page, sans la scène 3D : lisible sans JavaScript et par les moteurs de recherche. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
