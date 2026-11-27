import { useState, type ReactNode } from "react";
import { NAV, PROFILE, type SectionId } from "../content/site";
import { useStage } from "../state/store";

export { Hero } from "./Hero";
export { About } from "./About";
export { Timeline } from "./Timeline";
export { Skills } from "./Skills";
export { Projects } from "./Projects";
export { Contact } from "./Contact";

/** Un fait que le contenu ne donne pas encore : un emplacement visible, jamais une valeur inventée. */
export function Fill({ children }: { children: ReactNode }) {
  return <span className="fill">{children}</span>;
}

/** Image fixe de la tour : appareils sans WebGL, peu puissants ou en économie de données. */
export function Still() {
  return (
    <picture className="tower-still">
      <source srcSet="/stills/tour-sombre.webp" media="(prefers-color-scheme: dark)" />
      <img src="/stills/tour.webp" alt="" width={1200} height={1200} decoding="async" />
    </picture>
  );
}

export function Header({ home }: { home: boolean }) {
  // Hors de l'accueil, les ancres renvoient vers les sections de l'accueil.
  const base = home ? "" : "/";
  const section = useStage((s) => s.section);
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href={home ? "#accueil" : "/"} aria-label="Ange Carmelle, retour à l'accueil">
          Ange Carmelle
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Fermer" : "Menu"}
        </button>
        <nav id="site-nav" className="site-nav" data-open={open} aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`${base}#${n.id}`}
                  aria-current={home && section === n.id ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

type ChapterProps = {
  id: SectionId;
  children: ReactNode;
  className?: string;
  labelledBy: string;
  /**
   * Sur téléphone, la tour vit en haut de l'écran : une « fenêtre » transparente la laisse voir
   * avant (ou après) le panneau de texte qui défile par-dessus.
   */
  window?: "start" | "end";
  ref?: React.Ref<HTMLElement>;
};

export function Chapter({ id, children, className, labelledBy, window: win, ref }: ChapterProps) {
  const pane = <div className="chapter-window" data-window aria-hidden="true" />;
  return (
    <section ref={ref} id={id} data-section={id} className={`chapter ${className ?? ""}`} aria-labelledby={labelledBy}>
      {win === "start" && pane}
      <div className="panel">{children}</div>
      {win === "end" && pane}
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>© 2026 {PROFILE.name}</p>
      <a href="/video">La vidéo de présentation</a>
      <a href={PROFILE.classicSite}>Version classique du portfolio</a>
    </footer>
  );
}
