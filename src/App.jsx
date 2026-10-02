import { useState } from 'react'
import Introduction from './components/Introduction.jsx'
import Loader from './components/Loader.jsx'
import WorldIntro from './components/WorldIntro.jsx'

const navItems = [
  { label: 'Accueil', href: '#home' },
  { label: 'À propos', href: '#about' },
  { label: 'Formations', href: '#education' },
  { label: 'Compétences', href: '#skills' },
  { label: 'Projets', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

const expertise = [
  {
    title: 'Développement Web',
    icon: 'fa-code',
    description:
      'Création de sites et plateformes web modernes, dynamiques et responsives.',
    tone: 'rose',
  },
  {
    title: 'Développement Mobile',
    icon: 'fa-mobile-screen-button',
    description:
      'Conception d’applications mobiles performantes multiplateformes avec React Native.',
    tone: 'lilac',
  },
  {
    title: 'Apprentissage Continu',
    icon: 'fa-wand-magic-sparkles',
    description:
      'Veille technologique active et adaptation constante aux nouveaux outils et standards.',
    tone: 'gold',
  },
]

const education = [
  {
    period: '2025 — 2026',
    title: "Université Virtuelle de Côte d'Ivoire (UVCI)",
    details: "Licence 1 — Développement d'Applications et E-services (en cours)",
    color: 'rose',
  },
  {
    period: 'Janvier 2026 — en cours',
    title: 'WeCode',
    details:
      'Formation en Développement Full Stack et mobile : front-end, back-end, API et bases de données, à travers des projets concrets.',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'Laravel', 'Vue.js', 'Inertia.js', 'MySQL', 'Tailwind CSS', 'Git & GitHub', 'React Native & Expo Go'],
    color: 'lilac',
  },
  {
    period: 'décembre 2025',
    title: 'Tech For Girls',
    details: 'Formation en programmation et robotique.',
    tags: ['Python', 'Carte Arduino', 'Hubs', 'Lego'],
    color: 'gold',
  },
  {
    period: '2025',
    title: "DigiFemme Côte d'Ivoire",
    details: 'JA Social Equity',
    color: 'rose',
  },
  {
    period: '2024 — 2025',
    title: "Lycée Classique d'Abidjan",
    details: 'Baccalauréat',
    color: 'gold',
  },
]

const skillGroups = [
  { title: 'Frontend', items: ['React', 'React Native', 'Next.js', 'Tailwind CSS', 'JavaScript', 'HTML5', 'CSS3'] },
  { title: 'Backend', items: ['Node.js', 'Express', 'PHP', 'Laravel', 'API REST', 'MySQL', 'MongoDB'] },
  { title: 'Outils', items: ['GitHub', 'Figma', 'Expo Go', 'Postman', 'VS Code', 'Notion'] },
]

const projects = [
  {
    name: 'Portfolio personnel',
    type: 'UI/UX • Frontend',
    description: 'Une vitrine moderne pour présenter mon parcours, mes compétences et mes projets.',
    stack: ['React', 'Vite', 'Tailwind'],
  },
  {
    name: 'App de gestion',
    type: 'Fullstack',
    description: 'Une application de suivi de tâches et de ressources avec interface fluide et ergonomique.',
    stack: ['Node.js', 'MongoDB', 'React'],
  },
  {
    name: 'Projet mobile',
    type: 'React Native',
    description: 'Une application mobile pensée pour une expérience claire, rapide et centrée sur l’utilisateur.',
    stack: ['Expo', 'React Native', 'API'],
  },
]

function App() {
  const [showIntro, setShowIntro] = useState(false)

  if (!showIntro) {
    return <Loader onComplete={() => setShowIntro(true)} />
  }

  return (
    <>
      <Introduction />
      <WorldIntro />

      <div className="portfolio-shell">
        <header className="topbar">
          <div className="topbar__brand">
            <img
              alt="Ange Carmelle"
              className="topbar__avatar"
              src="/image/photo-shooting-lps.jpeg"
            />
            <span className="topbar__name">Ange Carmelle</span>
          </div>

          <nav aria-label="Navigation principale" className="topbar__nav">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
            <a className="topbar__cta" href="/mon CV.pdf" download>
              CV
            </a>
          </nav>
        </header>

        <main>
          <section className="hero" id="home">
            <div className="hero__content">
              <div className="hero__line" aria-hidden="true" />
              <div>
                <h1>
                  Salut, je suis{' '}
                  <span className="hero__highlight">Ange Carmelle</span>
                </h1>
                <p>
                  Développeuse Web &amp; Mobile passionnée par la création d’applications modernes,
                  raffinées et centrées sur l’expérience utilisateur.
                </p>

                <div className="hero__actions">
                  <a className="button button--primary" href="#projects">
                    Voir mes projets
                  </a>
                  <div className="socials" aria-label="Réseaux sociaux">
                    <a href="https://github.com/carmelle1707" rel="noreferrer" target="_blank" aria-label="GitHub">
                      <i className="fa-brands fa-github" aria-hidden="true" />
                    </a>
                    <a href="https://www.linkedin.com/in/ange-carmelle-gbedji-1a11b237a" rel="noreferrer" target="_blank" aria-label="LinkedIn">
                      <i className="fa-brands fa-linkedin" aria-hidden="true" />
                    </a>
                    <a href="mailto:gbedjiangecarmelle@gmail.com" aria-label="Email">
                      <i className="fa-solid fa-envelope" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero__visual" aria-label="Photo de profil de Carmelle">
              <div className="hero__glow hero__glow--rose" aria-hidden="true" />
              <div className="hero__glow hero__glow--lilac" aria-hidden="true" />

              <div className="hero__ring" aria-hidden="true">
                <span className="ring-dot ring-dot--1" />
                <span className="ring-dot ring-dot--2" />
                <span className="ring-dot ring-dot--3" />
                <span className="ring-dot ring-dot--4" />
              </div>

              <div className="profile-card">
                <img alt="Ange Carmelle" src="/image/photo-shooting-lps.jpeg" />
              </div>

              <div className="chip chip--1"><i className="fa-brands fa-react" /> React</div>
              <div className="chip chip--2"><i className="fa-solid fa-n" /> Next.js</div>
              <div className="chip chip--3"><i className="fa-solid fa-mobile-screen-button" /> Expo Go</div>
              <div className="chip chip--4"><i className="fa-solid fa-database" /> MongoDB</div>
              <div className="chip chip--5"><i className="fa-brands fa-react" /> React Native</div>
              <div className="chip chip--6"><i className="fa-solid fa-database" /> MySQL</div>
              <div className="chip chip--7"><i className="fa-brands fa-node-js" /> Node.js</div>
              <div className="chip chip--8"><i className="fa-brands fa-css3-alt" /> Tailwind</div>
            </div>
          </section>

          <div className="section-divider" aria-hidden="true">
            <span className="sparkle-wrap">
              <i className="fa-solid fa-sparkles sparkle-icon" aria-hidden="true" />
            </span>
          </div>

          <section className="content-section" id="about">
            <p className="eyebrow">Introduction</p>
            <h2>
              Vue d’ensemble<span className="accent">.</span>
            </h2>
            <p className="lead">
              Je suis une développeuse web et mobile basée en Côte d’Ivoire, passionnée par la
              création d’applications modernes et intuitives. J’aime transformer des idées en
              solutions numériques utiles grâce à React, React Native, Node.js et MongoDB. Mon
              objectif est de continuer à apprendre, relever de nouveaux défis techniques et
              contribuer à des projets innovants.
            </p>

            <div className="expertise-grid">
              {expertise.map((item) => (
                <article key={item.title} className={`card card--${item.tone}`}>
                  <div className="card__icon">
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" aria-hidden="true">
            <span className="sparkle-wrap">
              <i className="fa-solid fa-star sparkle-icon sparkle-icon--secondary" aria-hidden="true" />
            </span>
          </div>

          <section className="content-section" id="education">
            <div className="section-header">
              <p className="eyebrow">Mon parcours</p>
              <h2>
                Formations<span className="accent">.</span>
              </h2>
            </div>

            <div className="timeline">
              {education.map((item) => (
                <article key={`${item.title}-${item.period}`} className="timeline__item">
                  <div className={`timeline__dot timeline__dot--${item.color}`} aria-hidden="true" />
                  <div className="timeline__card">
                    <div className="timeline__meta">
                      <h3>{item.title}</h3>
                      <span>{item.period}</span>
                    </div>
                    <p>{item.details}</p>
                    {item.tags && (
                      <div className="tag-list">
                        {item.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" aria-hidden="true">
            <span className="sparkle-wrap">
              <i className="fa-solid fa-gem sparkle-icon sparkle-icon--danger" aria-hidden="true" />
            </span>
          </div>

          <section className="content-section" id="skills">
            <div className="section-header">
              <p className="eyebrow">Compétences</p>
              <h2>
                Stack &amp; outils<span className="accent">.</span>
              </h2>
            </div>

            <div className="skills-grid">
              {skillGroups.map((group) => (
                <div key={group.title} className="skills-group">
                  <h3>{group.title}</h3>
                  <div className="skill-pills">
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="section-divider" aria-hidden="true">
            <span className="sparkle-wrap">
              <i className="fa-solid fa-folder sparkle-icon sparkle-icon--gold" aria-hidden="true" />
            </span>
          </div>

          <section className="content-section" id="projects">
            <div className="section-header">
              <p className="eyebrow">Projets</p>
              <h2>
                Travaux récents<span className="accent">.</span>
              </h2>
            </div>

            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.name} className="project-card">
                  <div className="project-card__header">
                    <span>{project.type}</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <ul>
                    {project.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <div className="section-divider" aria-hidden="true">
            <span className="sparkle-wrap">
              <i className="fa-solid fa-paper-plane sparkle-icon sparkle-icon--primary" aria-hidden="true" />
            </span>
          </div>

          <section className="content-section content-section--contact" id="contact">
            <p className="eyebrow">Contact</p>
            <h2>
              Parlons d’un prochain projet<span className="accent">.</span>
            </h2>
            <div className="contact-box">
              <a href="mailto:gbedjiangecarmelle@gmail.com">gbedjiangecarmelle@gmail.com</a>
              <div className="socials">
                <a href="https://github.com/carmelle1707" rel="noreferrer" target="_blank" aria-label="GitHub">
                  <i className="fa-brands fa-github" aria-hidden="true" />
                </a>
                <a href="https://www.linkedin.com/in/ange-carmelle-gbedji-1a11b237a" rel="noreferrer" target="_blank" aria-label="LinkedIn">
                  <i className="fa-brands fa-linkedin" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}

export default App
