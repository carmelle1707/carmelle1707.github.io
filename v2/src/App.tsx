import { useEffect, useState, type ComponentType } from "react";
import { Boot } from "./intro/Boot";
import { About, Contact, Footer, Header, Hero, Projects, Skills, Steps } from "./sections/Sections";
import { detectSceneMode, useReducedMotion, useWideScreen, type SceneMode } from "./lib/capabilities";
import { setStage } from "./state/store";
import type { SectionId } from "./content/site";
import { matchRoute } from "./content/routes";
import { ProjectPage } from "./pages/ProjectPage";
import { NotFound, VideoPage } from "./pages/VideoPage";

type StageProps = { reduced: boolean; wide: boolean; waiting: boolean; onReady: () => void; onDecline: () => void };

const BOOT_KEY = "carmelle-boot";

/** La section qui occupe le milieu de l'écran pilote la tour. */
function useActiveSection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStage({ section: e.target.getAttribute("data-section") as SectionId });
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [enabled]);
}

/** Image fixe de la tour : appareils sans WebGL, peu puissants ou en économie de données. */
function Still() {
  return (
    <picture className="tower-still">
      <source srcSet="/stills/tour-sombre.webp" media="(prefers-color-scheme: dark)" />
      <img src="/stills/tour.webp" alt="" width={1200} height={1200} decoding="async" />
    </picture>
  );
}

export default function App({ path }: { path: string }) {
  const route = matchRoute(path);
  const home = route.kind === "home";
  /** La tour n'a pas sa place sur la vidéo ni sur la page introuvable. */
  const tower = home || route.kind === "project";
  const reduced = useReducedMotion();
  const wide = useWideScreen();
  const [mode, setMode] = useState<SceneMode>("pending");
  const [Stage, setStageComponent] = useState<ComponentType<StageProps> | null>(null);
  const [fonts, setFonts] = useState(false);
  const [frame, setFrame] = useState(false);
  const [boot, setBoot] = useState(false);

  useActiveSection(home);

  useEffect(() => {
    const root = document.documentElement;
    // Le script de index.html cache la page derrière l'écran de démarrage : seul l'accueil le garde.
    if (!tower) {
      delete root.dataset.boot;
      return;
    }
    const m = detectSceneMode();
    setMode(m);
    if (m === "3d" && home && root.dataset.boot === "1") setBoot(true);
    delete root.dataset.boot;
    document.fonts.ready.then(() => setFonts(true));
  }, [tower, home]);

  useEffect(() => {
    if (mode !== "3d") return;
    let alive = true;
    import("./scene/Stage").then((mod) => {
      if (alive) setStageComponent(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, [mode]);

  const finishBoot = () => {
    setBoot(false);
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // Navigation privée : l'intro reviendra à la prochaine visite, rien de grave.
    }
    // Le dialogue disparaît : le focus revient au début du contenu, pas dans le vide.
    document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  };

  const scene =
    mode === "still" ? (
      <Still />
    ) : Stage ? (
      <Stage
        reduced={reduced}
        wide={wide}
        waiting={boot}
        onReady={() => setFrame(true)} onDecline={() => setMode("still")} />
    ) : null;

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {boot && <Boot fonts={fonts} scene={Stage !== null} frame={frame} onDone={finishBoot} />}
      <Header home={home} />
      {tower ? (
        <div className="layout">
          <main id="contenu" className="content">
            {route.kind === "project" ? (
              <ProjectPage project={route.project} stage={wide ? null : scene} />
            ) : (
              <>
                <Hero stage={wide ? null : scene} />
                <About />
                <Skills />
                <Projects />
                <Steps />
                <Contact />
              </>
            )}
          </main>
          <aside className="stage" aria-hidden="true">
            <div className="stage-sticky">{wide ? scene : null}</div>
          </aside>
        </div>
      ) : (
        <main id="contenu" className="single">
          {route.kind === "video" ? <VideoPage /> : <NotFound />}
        </main>
      )}
      <Footer />
    </>
  );
}
