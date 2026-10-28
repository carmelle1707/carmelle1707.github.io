import type { CSSProperties } from "react";
import type { SiteContent } from "@/lib/content-types";
import { SectionHead } from "./section-head";

export function Method({ steps }: Pick<SiteContent, "steps">) {
  if (!steps.length) return null;
  const cols = { "--n": Math.min(steps.length, 4) } as CSSProperties;
  return (
    <section id="methode" className="band py-24" aria-labelledby="methode-title">
      <div className="wrap">
        <SectionHead
          id="methode-title"
          eyebrow="Méthode"
          title="Comment on travaille *ensemble*"
          text="Un déroulé simple, avec vous à chaque étape. Vous voyez le projet avancer, sans surprise."
        />
        <div className="relative min-[861px]:pt-7" data-steps>
          <div className="rail hidden min-[861px]:block" aria-hidden="true">
            <i />
          </div>
          <ol
            className="m-0 grid list-none grid-cols-1 gap-y-10 p-0 min-[481px]:grid-cols-2 min-[861px]:grid-cols-[repeat(var(--n),1fr)] min-[861px]:gap-y-0"
            style={cols}
          >
            {steps.map((s, i) => (
              <li
                key={s.id}
                className="step relative grid min-w-0 content-start gap-2.5 pr-6"
                data-reveal
              >
                <span className="n font-mono text-sm text-band-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[23px] font-bold">{s.title}</h3>
                <p className="text-[15.5px] text-band-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
