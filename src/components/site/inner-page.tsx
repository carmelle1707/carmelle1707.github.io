import Link from "next/link";
import type { SiteContent } from "@/lib/content-types";
import { whatsappLink } from "@/lib/links";
import { RichTitle, stripEmphasis } from "@/lib/rich-title";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Gabarit des pages intérieures (offres, projets) : mêmes en-tête, grain et pied que l'accueil. */
export function InnerPage({
  content: c,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <SiteHeader shortName={c.profile.shortName || c.profile.name} home={false} />
      <main id="top">{children}</main>
      <PageCta content={c} />
      <SiteFooter name={c.profile.name} />
    </>
  );
}

/** Fil d'Ariane visible, cohérent avec le BreadcrumbList du JSON-LD. */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="font-mono text-[13px] tracking-[0.04em] text-muted">
      <ol className="m-0 flex list-none flex-wrap gap-x-2 p-0">
        {items.map((it, i) => (
          <li key={it.label} className="flex gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {it.href ? (
              <Link
                href={it.href}
                className="text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Bandeau d'appel à l'action en bas des pages intérieures. */
function PageCta({ content: { contact, profile } }: { content: SiteContent }) {
  const wa = whatsappLink(contact.whatsapp);
  return (
    <section className="band py-20" aria-labelledby="cta-title">
      <div className="wrap grid items-end gap-10 min-[861px]:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="eyebrow">Contact</span>
          <h2
            id="cta-title"
            className="mt-3.5 text-[clamp(34px,5vw,56px)] font-extrabold"
            aria-label={stripEmphasis(contact.title)}
          >
            <RichTitle text={contact.title} />
          </h2>
          {profile.response && (
            <p className="mt-4 text-band-muted">Réponse {profile.response}. Devis gratuit.</p>
          )}
        </div>
        <div className="grid gap-3">
          {wa && (
            <a className="channel main" href={wa} target="_blank" rel="noopener">
              <strong className="inline-flex items-center gap-2 font-semibold">
                WhatsApp <span aria-hidden="true">→</span>
              </strong>
              <span>{contact.whatsapp}</span>
            </a>
          )}
          <Link className="channel" href="/#contact">
            <strong className="inline-flex items-center gap-2 font-semibold">
              Décrire mon projet <span aria-hidden="true">→</span>
            </strong>
            <span>formulaire</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
