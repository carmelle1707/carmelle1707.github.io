import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, InnerPage } from "@/components/site/inner-page";
import { ServiceIcon } from "@/components/site/service-icon";
import { getPagesContent, projectPath, servicePath } from "@/lib/pages";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, servicePageData } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { services } = await getPagesContent();
  return services.map((s) => ({ slug: s.slug }));
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const pages = await getPagesContent();
  const service = pages.services.find((s) => s.slug === slug);
  return service ? { ...pages, service } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { service, content } = data;
  const title = `${service.title} à Abidjan · ${content.profile.name}`;
  const description = [service.desc, service.for && `Idéal pour ${service.for}.`]
    .filter(Boolean)
    .join(" ");
  const path = servicePath(service.slug);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "fr_FR", url: path, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ServicePage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { service: s, services, projects, content: c } = data;
  const path = servicePath(s.slug);
  const others = services.filter((o) => o.slug !== s.slug);

  return (
    <InnerPage content={c}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(servicePageData(c, s, siteUrl(), path)) }}
      />
      <article className="wrap grid gap-14 pt-12 pb-24">
        <header className="grid max-w-[760px] gap-5">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/#services" },
              { label: s.title },
            ]}
          />
          <div className="svc-icon">
            <ServiceIcon name={s.icon} />
          </div>
          <h1 className="text-[clamp(40px,6vw,68px)] font-extrabold">
            {s.title} <em>à Abidjan</em>
          </h1>
          <p className="max-w-[56ch] text-[clamp(18px,2vw,20px)] text-muted">{s.desc}</p>
          {s.for && (
            <p className="text-[15px]">
              <strong className="font-semibold">Idéal pour</strong>{" "}
              <span className="text-muted">{s.for}</span>
            </p>
          )}
        </header>

        {s.features.length > 0 && (
          <section aria-labelledby="inclus" className="grid gap-5">
            <h2 id="inclus" className="text-[clamp(28px,3.4vw,38px)] font-extrabold">
              Ce qui est <em>inclus</em>
            </h2>
            <ul className="m-0 grid list-none gap-3 p-0 min-[641px]:grid-cols-2">
              {s.features.map((f) => (
                <li
                  key={f}
                  className="flex gap-3 rounded-[14px] border border-line bg-surface p-5 text-[17px]"
                >
                  <span aria-hidden="true" className="text-accent">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {c.steps.length > 0 && (
          <section aria-labelledby="deroule" className="grid gap-5">
            <h2 id="deroule" className="text-[clamp(28px,3.4vw,38px)] font-extrabold">
              Comment ça <em>se passe</em>
            </h2>
            <ol className="m-0 grid list-none gap-6 p-0 min-[641px]:grid-cols-2 min-[961px]:grid-cols-4">
              {c.steps.map((step, i) => (
                <li key={step.id} className="grid content-start gap-2 border-t-2 border-gold pt-4">
                  <span className="font-mono text-sm text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-[15px] text-muted">{step.desc}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {projects.length > 0 && (
          <section aria-labelledby="exemples" className="grid gap-4">
            <h2 id="exemples" className="text-[clamp(24px,2.8vw,30px)] font-extrabold">
              Quelques réalisations
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={projectPath(p.slug)}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {others.length > 0 && (
          <nav aria-label="Autres offres" className="border-t border-line pt-8">
            <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
              Autres offres
            </p>
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-lg">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={servicePath(o.slug)}
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    {o.title} à Abidjan →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </article>
    </InnerPage>
  );
}
