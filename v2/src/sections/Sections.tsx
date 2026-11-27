import { useState, type ReactNode } from "react";
import { CONTACT, LAYERS, NAV, PROFILE, PROJECTS, STEPS, TOOLS, type SectionId } from "../content/site";
import { setStage, useStage } from "../state/store";

/** Un fait que le contenu ne donne pas encore : un emplacement visible, jamais une valeur inventée. */
export function Fill({ children }: { children: ReactNode }) {
  return <span className="fill">{children}</span>;
}

export function Header() {
  const section = useStage((s) => s.section);
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#accueil" aria-label="Ange Carmelle, retour à l'accueil">
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
                  href={`#${n.id}`}
                  aria-current={section === n.id ? "true" : undefined}
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

type Sectioned = { id: SectionId; children: ReactNode; className?: string; labelledBy: string };

function Section({ id, children, className, labelledBy }: Sectioned) {
  return (
    <section id={id} data-section={id} className={`section ${className ?? ""}`} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

export function Hero({ stage }: { stage: ReactNode }) {
  return (
    <Section id="accueil" className="hero" labelledBy="hero-title">
      <h1 id="hero-title" tabIndex={-1}>
        {PROFILE.name}
      </h1>
      <p className="hero-role">Développeuse full stack à Abidjan, de la base de données à l'écran.</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#projets">
          Voir mes projets
        </a>
        <a className="btn-text" href="#contact">
          Me contacter
        </a>
      </div>
      <div className="hero-stage">{stage}</div>
    </Section>
  );
}

export function About() {
  return (
    <Section id="parcours" className="about" labelledBy="about-title">
      <h2 id="about-title">Construite à Abidjan, étage par étage</h2>
      <figure className="portrait">
        <img
          src={PROFILE.portrait.src}
          alt={PROFILE.portrait.alt}
          width={PROFILE.portrait.width}
          height={PROFILE.portrait.height}
          loading="lazy"
          decoding="async"
        />
      </figure>
      <p>
        Je suis développeuse full stack, formée chez WeCode et à l'Université Virtuelle de Côte d'Ivoire. Au Groupe
        Tasnim, j'ai travaillé sur le front-end, le back-end, l'intégration d'API et les tests fonctionnels.
      </p>
      <p>Je maquette sur Figma avant d'écrire la première ligne, et je suis de près l'intelligence artificielle.</p>
    </Section>
  );
}

export function Skills() {
  const active = useStage((s) => s.layer);
  // Affichées dans l'ordre de la tour : le mobile en haut, les données en bas.
  const layers = [...LAYERS].reverse();
  return (
    <Section id="competences" className="skills" labelledBy="skills-title">
      <h2 id="skills-title">Ma pile, couche par couche</h2>
      <p className="section-lead">Survolez une couche&nbsp;: elle s'allume dans la tour.</p>
      <ul className="layer-list">
        {layers.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              className="layer"
              aria-pressed={active === l.id}
              onMouseEnter={() => setStage({ layer: l.id })}
              onFocus={() => setStage({ layer: l.id })}
              onClick={() => setStage({ layer: l.id })}
            >
              <span className="layer-name">{l.name}</span>
              <span className="layer-role">{l.role}</span>
              <span className="chips">
                {l.tech.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="tools">Autour de la pile&nbsp;: {TOOLS.join(", ")}.</p>
    </Section>
  );
}

export function Projects() {
  const current = useStage((s) => s.project);
  const project = PROJECTS.find((p) => p.slug === current) ?? PROJECTS[0];
  return (
    <Section id="projets" className="projects" labelledBy="projects-title">
      <h2 id="projects-title">Chaque projet a sa propre pile</h2>
      <ul className="project-index" aria-label="Choisir un projet">
        {PROJECTS.map((p) => (
          <li key={p.slug}>
            <button
              type="button"
              aria-pressed={p.slug === project.slug}
              aria-controls="project-detail"
              onClick={() => setStage({ project: p.slug })}
            >
              {p.title}
            </button>
          </li>
        ))}
      </ul>
      <article id="project-detail" className="project-detail" aria-live="polite">
        <h3>{project.title}</h3>
        <p className="project-context">{project.context}</p>
        {project.image ? (
          <img
            className="project-shot"
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="project-shot project-shot-empty">
            <Fill>Capture d'écran à ajouter</Fill>
          </div>
        )}
        {project.desc && <p>{project.desc}</p>}
        <dl className="project-facts">
          {project.role && (
            <div>
              <dt>Mon rôle</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {project.stack.length > 0 && (
            <div>
              <dt>Technologies</dt>
              <dd className="chips">
                {project.stack.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
        {project.missing && project.image && <Fill>{project.missing}</Fill>}
        {project.missing && !project.image && project.missing !== "Capture d'écran à ajouter" && (
          <Fill>{project.missing}</Fill>
        )}
        {project.links.length > 0 && (
          <p className="project-links">
            {project.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener">
                {l.label}
              </a>
            ))}
          </p>
        )}
      </article>
    </Section>
  );
}

export function Steps() {
  return (
    <Section id="etapes" className="steps" labelledBy="steps-title">
      <h2 id="steps-title">Le parcours, de bas en haut</h2>
      <ol className="timeline" onMouseLeave={() => setStage({ step: null })}>
        {STEPS.map((s, i) => (
          <li key={s.title} onMouseEnter={() => setStage({ step: i })}>
            <p className="timeline-period">{s.period || <Fill>{s.missing}</Fill>}</p>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Contact() {
  return (
    <Section id="contact" className="contact" labelledBy="contact-title">
      <h2 id="contact-title">Un projet en tête&nbsp;? Écrivez-moi.</h2>
      <p className="section-lead">Je réponds sous 24 h.</p>
      <ul className="contact-list">
        <li>
          <span>WhatsApp</span>
          <a href={CONTACT.whatsapp.href} target="_blank" rel="noopener">
            {CONTACT.whatsapp.label}
          </a>
        </li>
        <li>
          <span>LinkedIn</span>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener">
            Ange Carmelle Gbedji
          </a>
        </li>
        <li>
          <span>GitHub</span>
          <a href={CONTACT.github} target="_blank" rel="noopener">
            carmelle1707
          </a>
        </li>
        <li>
          <span>CV</span>
          <a href={PROFILE.cv} target="_blank" rel="noopener">
            Télécharger le PDF
          </a>
        </li>
      </ul>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>© 2026 {PROFILE.name}</p>
      <a href={PROFILE.classicSite}>Version classique du portfolio</a>
    </footer>
  );
}
