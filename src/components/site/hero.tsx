import type { CSSProperties } from "react";
import Image from "next/image";
import type { SiteContent } from "@/lib/content-types";
import { initials, whatsappLink } from "@/lib/links";
import { stripEmphasis } from "@/lib/rich-title";
import { AbidjanClock } from "./abidjan-clock";
import { SplitText } from "./split-text";

const delay = (s: number) => ({ "--dl": `${s}s` }) as CSSProperties;

export function Hero({ profile, contact }: Pick<SiteContent, "profile" | "contact">) {
  const wa = whatsappLink(contact.whatsapp);
  return (
    <section className="relative overflow-clip pt-[72px] pb-24" aria-labelledby="hero-title">
      <div className="glow" aria-hidden="true" data-glow />
      <div className="wrap grid items-center gap-11 min-[861px]:grid-cols-[1.25fr_.75fr] min-[861px]:gap-14">
        <div>
          {profile.available && (
            <span
              className="fade-up inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-2.5 text-sm font-medium"
              style={delay(0.05)}
            >
              <span className="status-dot" aria-hidden="true" />
              {profile.status || "Disponible"}
            </span>
          )}
          <h1
            id="hero-title"
            className="hero-title mt-[22px] text-[clamp(42px,6.6vw,80px)] font-extrabold"
            aria-label={stripEmphasis(profile.headline)}
          >
            <SplitText text={profile.headline} />
          </h1>
          <p
            className="fade-up mt-[22px] max-w-[56ch] text-[clamp(18px,2vw,20px)] text-muted"
            style={delay(0.75)}
          >
            {profile.lead}
          </p>
          <div className="fade-up mt-[34px] flex flex-wrap gap-3" style={delay(0.9)}>
            {wa && (
              <a className="btn btn-primary" href={wa} target="_blank" rel="noopener" data-magnetic>
                Discuter de votre projet{" "}
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </a>
            )}
            <a className="btn btn-ghost" href="#projets" data-magnetic>
              Voir mes réalisations{" "}
              <span className="arr" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
          <div
            className="fade-up scroll-hint mt-14 hidden items-center gap-2.5 font-mono text-xs tracking-[0.1em] text-muted uppercase min-[861px]:flex"
            style={delay(1.2)}
            aria-hidden="true"
          >
            <i />
            Défiler
          </div>
        </div>

        <div className="relative max-w-[340px] min-[861px]:max-w-none">
          <div className="photo" data-speed="-0.06">
            {profile.photo ? (
              <div className="photo-inner">
                <Image
                  src={profile.photo.url}
                  alt={`Portrait de ${profile.name}`}
                  fill
                  priority
                  sizes="(max-width: 860px) 340px, 400px"
                  className="object-cover"
                />
              </div>
            ) : (
              <span className="initials">{initials(profile.name)}</span>
            )}
          </div>
          {profile.badge && (
            <svg className="badge" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="disc" cx="60" cy="60" r="58" />
              <defs>
                <path id="badge-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <text>
                <textPath href="#badge-circle">{profile.badge}</textPath>
              </text>
              <circle className="core" cx="60" cy="60" r="7" />
            </svg>
          )}
          <dl className="fiche" aria-label="Infos pratiques" data-speed="0.08">
            {profile.location && (
              <div>
                <dt>Basée à</dt>
                <dd>{profile.location}</dd>
              </div>
            )}
            <div>
              <dt>Heure</dt>
              <dd>
                <AbidjanClock />
              </dd>
            </div>
            {profile.language && (
              <div>
                <dt>Langue</dt>
                <dd>{profile.language}</dd>
              </div>
            )}
            {profile.response && (
              <div>
                <dt>Réponse</dt>
                <dd>{profile.response}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
