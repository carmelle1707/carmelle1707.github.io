"use client";

import { useSyncExternalStore } from "react";

export const THEME_KEY = "ac-theme";
type Theme = "light" | "dark";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function current(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return media().matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  media().addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media().removeEventListener("change", onChange);
  };
}

/** Bascule clair / sombre. Par défaut le site suit le réglage du téléphone ou de l'ordinateur. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix vaut pour cette visite
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-ink"
      aria-label={next === "dark" ? "Passer en mode sombre" : "Passer en mode clair"}
      suppressHydrationWarning
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        )}
      </svg>
    </button>
  );
}

/** Script exécuté avant l'affichage pour éviter un flash du mauvais thème. */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
