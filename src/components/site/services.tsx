import type { SiteContent } from "@/lib/content-types";
import { SectionHead } from "./section-head";
import { ServiceIcon } from "./service-icon";

export function Services({ services }: Pick<SiteContent, "services">) {
  if (!services.length) return null;
  return (
    <section id="services" className="py-24" aria-labelledby="services-title">
      <div className="wrap">
        <SectionHead
          id="services-title"
          eyebrow="Services"
          title="Ce que je peux faire *pour vous*"
          text="Des offres adaptées à la taille de votre activité. Devis gratuit après un premier échange."
        />
        <div className="grid gap-5 perspective-[1000px] min-[901px]:grid-cols-3">
          {services.map((s) => (
            <article
              key={s.id}
              className="svc flex min-w-0 flex-col gap-3.5 p-7"
              data-tilt
              data-reveal
            >
              <div className="svc-icon">
                <ServiceIcon name={s.icon} />
              </div>
              <h3 className="text-[25px] font-bold">{s.title}</h3>
              <p className="text-base text-muted">{s.desc}</p>
              {s.features.length > 0 && (
                <ul className="mt-1 grid list-none gap-2 p-0 text-[15px]">
                  {s.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {s.for && (
                <p className="mt-auto border-t border-dashed border-line pt-3.5 text-sm text-muted">
                  <strong className="font-semibold text-ink">Idéal pour</strong> {s.for}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
