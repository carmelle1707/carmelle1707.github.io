import { useEffect, useState, type ComponentType } from "react";
import { Boot } from "./intro/Boot";
import { About, Contact, Footer, Header, Hero, Projects, Skills, Steps } from "./sections/Sections";
import { detectSceneMode, useReducedMotion, useWideScreen, type SceneMode } from "./lib/capabilities";
import { setStage } from "./state/store";
import type { SectionId } from "./content/site";

type StageProps = { reduced: boolean; wide: boolean; onReady: () => void; onDecline: () => void };

const BOOT_KEY = "carmelle-boot";

/** La section qui occupe le milieu de l'écran pilote la tour. */
function useActiveSection() {
  useEffect(() => {
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
  }, []);
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

export default function App() {
  const reduced = useReducedMotion();
  const wide = useWideScreen();
  const [mode, setMode] = useState<SceneMode>("pending");
  const [Stage, setStageComponent] = useState<ComponentType<StageProps> | null>(null);
  const [fonts, setFonts] = useState(false);
  const [frame, setFrame] = useState(false);
  const [boot, setBoot] = useState(false);

  useActiveSection();

  useEffect(() => {
    const m = detectSceneMode();
    setMode(m);
    const root = document.documentElement;
    // Le script de index.html a déjà caché la page derrière l'écran de démarrage si besoin.
    if (m === "3d" && root.dataset.boot === "1") setBoot(true);
    delete root.dataset.boot;
    document.fonts.ready.then(() => setFonts(true));
  }, []);

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
    document.getElementById("hero-title")?.focus({ preventScroll: true });
  };

  const scene =
    mode === "still" ? (
      <Still />
    ) : Stage ? (
      <Stage reduced={reduced} wide={wide} onReady={() => setFrame(true)} onDecline={() => setMode("still")} />
    ) : null;

  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {boot && <Boot fonts={fonts} scene={Stage !== null} frame={frame} onDone={finishBoot} />}
      <Header />
      <div className="layout">
        <main id="contenu" className="content">
          <Hero stage={wide ? null : scene} />
          <About />
          <Skills />
          <Projects />
          <Steps />
          <Contact />
        </main>
        <aside className="stage" aria-hidden="true">
          <div className="stage-sticky">{wide ? scene : null}</div>
        </aside>
      </div>
      <Footer />
    </>
  );
}
