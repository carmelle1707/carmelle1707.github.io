import { PROFILE, PROJECTS, VIDEO } from "../content/site";
import { projectPath } from "../content/routes";

/** Page de lecture : la vidéo est le premier contenu sous le titre, au format de l'écran. */
export function VideoPage() {
  const label = `Vidéo de présentation de ${PROFILE.name}`;
  return (
    <article className="video-page" aria-labelledby="video-title">
      <nav aria-label="Fil d'Ariane" className="crumbs">
        <a href="/">Accueil</a>
      </nav>
      <h1 id="video-title" tabIndex={-1}>
        {PROFILE.shortName} en 60 secondes
      </h1>
      <figure className="video-frame">
        <video
          className="video-square"
          controls
          playsInline
          preload="none"
          poster={VIDEO.square.poster}
          width={VIDEO.square.width}
          height={VIDEO.square.height}
          aria-label={label}
        >
          <source src={VIDEO.square.src} type="video/mp4" />
        </video>
        <video
          className="video-vertical"
          controls
          playsInline
          preload="none"
          poster={VIDEO.vertical.poster}
          width={VIDEO.vertical.width}
          height={VIDEO.vertical.height}
          aria-label={label}
        >
          <source src={VIDEO.vertical.src} type="video/mp4" />
        </video>
        <figcaption>{VIDEO.description} Durée 1 min, textes à l'écran en anglais.</figcaption>
      </figure>
      <nav className="video-projects" aria-label="Les projets de la vidéo">
        <h2>Les projets de la vidéo</h2>
        <ul>
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <a href={projectPath(p.slug)}>{p.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}

export function NotFound() {
  return (
    <article className="video-page" aria-labelledby="nf-title">
      <h1 id="nf-title" tabIndex={-1}>
        Cette page n'existe pas
      </h1>
      <p className="section-lead">L'adresse a peut-être changé. Le portfolio commence ici&nbsp;:</p>
      <p>
        <a className="btn btn-primary" href="/">
          Retour à l'accueil
        </a>
      </p>
    </article>
  );
}
