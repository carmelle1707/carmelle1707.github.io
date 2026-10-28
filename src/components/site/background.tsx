import type { SiteContent } from "@/lib/content-types";
import { SectionHead } from "./section-head";

/** Compétences et parcours, côte à côte sur desktop. */
export function Background({
  skills,
  education,
  profile,
}: Pick<SiteContent, "skills" | "education" | "profile">) {
  if (!skills.length && !education.length) return null;
  return (
    <section id="parcours" className="py-24" aria-label="Compétences et parcours">
      <div className="wrap grid gap-16 min-[861px]:grid-cols-2 min-[861px]:gap-14">
        {skills.length > 0 && (
          <div>
            <SectionHead
              id="competences-title"
              eyebrow="Compétences"
              title="Mes *outils*"
              compact
            />
            <dl className="m-0 grid gap-[22px]">
              {skills.map((g, i) => (
                <div
                  key={g.id}
                  className={`grid gap-1.5 pb-[22px] min-[421px]:grid-cols-[110px_1fr] min-[421px]:gap-4 ${
                    i < skills.length - 1 ? "border-b border-line" : ""
                  }`}
                  data-reveal
                >
                  <dt className="pt-1 font-mono text-[13px] tracking-[0.08em] text-muted uppercase">
                    {g.group}
                  </dt>
                  <dd className="m-0 min-w-0">
                    <ul className="chips m-0 flex list-none flex-wrap gap-2 p-0">
                      {g.items.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <SectionHead id="parcours-title" eyebrow="Formation" title="Mon *parcours*" compact />
            <ol className="m-0 grid list-none gap-[26px] p-0">
              {education.map((e) => (
                <li
                  key={e.id}
                  className="grid gap-1.5 min-[421px]:grid-cols-[110px_1fr] min-[421px]:gap-4"
                  data-reveal
                >
                  <span className="pt-[3px] font-mono text-[13px] text-accent tabular-nums">
                    {e.period}
                  </span>
                  <div>
                    <h3 className="font-sans text-[19px] font-bold tracking-normal">{e.title}</h3>
                    {e.desc && <p className="mt-1 text-[15.5px] text-muted">{e.desc}</p>}
                  </div>
                </li>
              ))}
            </ol>
            {profile.cv && (
              <p className="mt-7">
                <a
                  className="btn btn-ghost"
                  href={profile.cv.url}
                  target="_blank"
                  rel="noopener"
                  data-magnetic
                >
                  Télécharger mon CV{" "}
                  <span className="arr" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
