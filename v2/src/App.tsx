import { useEffect, useState, type ComponentType } from "react";
import { Boot } from "./intro/Boot";
import { About, Contact, Footer, Header, Hero, Projects, Skills, Timeline } from "./sections/Sections";
import { detectSceneMode, useReducedMotion, useWideScreen, type SceneMode } from "./lib/capabilities";
import { setStage } from "./state/store";
import { matchRoute } from "./content/routes";
import { ProjectPage } from "./pages/ProjectPage";
import { NotFound, VideoPage } from "./pages/VideoPage";
import { useChapters } from "./motion/chapters";
import { ScrollTrigger } from "./motion/scroll";

type StageProps = { reduced: boolean; wide: boolean; waiting: boolean; onReady: () => void; onDecline: () => void };

const BOOT_KEY = "carmelle-boot";

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
  const [boot, setBoot] = useState<boolean | null>(null);

  useChapters(home);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ready = "1";
    // Le script de index.html cache la page derrière l'écran de démarrage : seul l'accueil le garde.
    const m = tower ? detectSceneMode() : "still";
    setMode(m);
    if (m !== "3d" && root.classList.contains("scene-3d")) {
      root.classList.remove("scene-3d");
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    const withBoot = m === "3d" && home && root.dataset.boot === "1";
    setBoot(withBoot);
    delete root.dataset.boot;
    document.fonts.ready.then(() => setFonts(true));
  }, [tower, home]);

  // Sans écran de démarrage (ou une fois parti), les ouvertures peuvent jouer.
  useEffect(() => {
    if (boot === false) setStage({ started: true });
  }, [boot]);

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

  const decline = () => {
    setMode("still");
    document.documentElement.classList.remove("scene-3d");
    // Sur téléphone, les fenêtres sur la tour disparaissent : toutes les positions de défilement changent.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {boot && <Boot fonts={fonts} scene={Stage !== null} frame={frame} onDone={finishBoot} />}
      <Header home={home} />
      {home && <div className="night" aria-hidden="true" />}
      {tower && mode === "3d" && Stage && (
        <div className="scene" aria-hidden="true">
          <Stage reduced={reduced} wide={wide} waiting={boot !== false} onReady={() => setFrame(true)} onDecline={decline} />
        </div>
      )}
      <main id="contenu" className={home ? "chapters" : tower ? "project-main" : "single"}>
        {route.kind === "project" ? (
          <ProjectPage project={route.project} />
        ) : home ? (
          <>
            <Hero />
            <About />
            <Timeline />
            <Skills />
            <Projects />
            <Contact />
          </>
        ) : route.kind === "video" ? (
          <VideoPage />
        ) : (
          <NotFound />
        )}
      </main>
      <Footer />
    </>
  );
}
