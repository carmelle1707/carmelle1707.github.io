import type { CSSProperties } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content-types";
import { SectionHead } from "./section-head";

export function Projects({ projects }: Pick<SiteContent, "projects">) {
  if (!projects.length) return null;
  return (
    <section id="projets" className="py-24" aria-labelledby="projets-title">
      <div className="wrap">
        <SectionHead
          id="projets-title"
          eyebrow="Réalisations"
          title="Projets *récents*"
          text="Une sélection de projets, du back-end au front, sur web et mobile."
        />
        <div className="grid gap-7" data-projects>
          {projects.map((p, i) => (
            <article
              key={p.id}
              className="proj grid items-center gap-[22px] p-[18px] min-[861px]:grid-cols-[1.1fr_1fr] min-[861px]:gap-9 min-[861px]:p-6"
              style={{ "--i": i } as CSSProperties}
              data-project
              data-reveal
            >
              <div className={`shot ${i % 2 ? "min-[861px]:order-2" : ""}`} data-cursor="view">
                {p.image ? (
                  <Image
                    src={p.image.url}
                    alt={`Capture d'écran du projet ${p.title}`}
                    fill
                    sizes="(max-width: 860px) 100vw, 560px"
                    className="object-cover object-top"
                  />
                ) : (
                  <span className="ph" aria-hidden="true">
                    {p.title}
                  </span>
                )}
              </div>
              <div className="grid min-w-0 gap-3.5">
                {p.tag && <span className="font-mono text-[12.5px] text-muted">{p.tag}</span>}
                <h3 className="text-[clamp(26px,3vw,36px)] font-extrabold">{p.title}</h3>
                <p className="text-muted">{p.desc}</p>
                {p.role && (
                  <p className="text-[15px] text-ink">
                    <strong className="font-semibold">Mon rôle :</strong> {p.role}
                  </p>
                )}
                {p.stack.length > 0 && (
                  <ul
                    className="chips m-0 flex list-none flex-wrap gap-2 p-0"
                    aria-label="Technologies"
                  >
                    {p.stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
                {(p.demoUrl || p.githubUrl) && (
                  <div className="links flex flex-wrap gap-[18px] text-[15px] font-semibold">
                    {p.demoUrl && (
                      <a href={p.demoUrl} target="_blank" rel="noopener">
                        Voir le site<span className="sr-only"> {p.title}</span>
                      </a>
                    )}
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noopener">
                        Code sur GitHub<span className="sr-only"> ({p.title})</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
