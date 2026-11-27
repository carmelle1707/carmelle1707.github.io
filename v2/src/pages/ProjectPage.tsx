import { useEffect, type ReactNode } from "react";
import { LAYERS, PROJECTS, type Project } from "../content/site";
import { projectPath } from "../content/routes";
import { setStage } from "../state/store";
import { Fill } from "../sections/Sections";

/**
 * La page d'un projet : la tour se reconstruit avec les seules couches qu'il utilise,
 * et la fiche dit ce que j'y ai fait, avec quoi.
 */
export function ProjectPage({ project, stage }: { project: Project; stage: ReactNode }) {
  useEffect(() => {
    setStage({ section: "projets", project: project.slug, layer: null, step: null });
  }, [project.slug]);

  const index = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const layers = LAYERS.filter((l) => project.layers.includes(l.id));

  return (
    <article className="project-page" aria-labelledby="project-title" data-section="projets">
      <nav aria-label="Fil d'Ariane" className="crumbs">
        <a href="/#projets">Tous les projets</a>
      </nav>
      <header className="project-head">
        <h1 id="project-title" tabIndex={-1}>
          {project.title}
        </h1>
        {project.context && <p className="project-context">{project.context}</p>}
      </header>
      <div className="hero-stage">{stage}</div>
      {project.image ? (
        <img
          className="project-shot"
          src={project.image.src}
          alt={project.image.alt}
          width={project.image.width}
          height={project.image.height}
          decoding="async"
        />
      ) : (
        <div className="project-shot project-shot-empty">
          <span>Pas encore de capture</span>
        </div>
      )}
      {project.desc && <p className="project-lead">{project.desc}</p>}
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
        {layers.length > 0 && (
          <div>
            <dt>Couches de la pile</dt>
            <dd>{layers.map((l) => l.name).join(", ")}</dd>
          </div>
        )}
      </dl>
      {project.missing && <Fill>{project.missing}</Fill>}
      {project.links.length > 0 && (
        <p className="project-links">
          {project.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener">
              {l.label}
            </a>
          ))}
        </p>
      )}
      {next && next.slug !== project.slug && (
        <nav className="project-next" aria-label="Projet suivant">
          <span>Projet suivant</span>
          <a href={projectPath(next.slug)}>{next.title}</a>
        </nav>
      )}
    </article>
  );
}
