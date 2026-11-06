import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, InnerPage } from "@/components/site/inner-page";
import { getPagesContent, projectPath, servicePath } from "@/lib/pages";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, projectPageData } from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { projects } = await getPagesContent();
  return projects.map((p) => ({ slug: p.slug }));
}

async function load(params: Props["params"]) {
  const { slug } = await params;
  const pages = await getPagesContent();
  const project = pages.projects.find((p) => p.slug === slug);
  return project ? { ...pages, project } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { project: p, content } = data;
  const title = `${p.title} · Projet de ${content.profile.name}`;
  const description = [p.desc, p.stack.length && `Réalisé avec ${p.stack.join(", ")}.`]
    .filter(Boolean)
    .join(" ");
  const path = projectPath(p.slug);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url: path,
      title,
      description,
      images: p.image
        ? [{ url: p.image.url, alt: `Capture d'écran du projet ${p.title}` }]
        : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { project: p, projects, services, content: c } = data;
  const path = projectPath(p.slug);
  const index = projects.findIndex((o) => o.slug === p.slug);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;

  return (
    <InnerPage content={c}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(projectPageData(c, p, siteUrl(), path)) }}
      />
      <article className="wrap grid gap-12 pt-12 pb-24">
        <header className="grid max-w-[820px] gap-5">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Projets", href: "/#projets" },
              { label: p.title },
            ]}
          />
          {p.tag && <span className="font-mono text-[13px] text-muted">{p.tag}</span>}
          <h1 className="text-[clamp(38px,5.6vw,64px)] font-extrabold">{p.title}</h1>
          <p className="max-w-[60ch] text-[clamp(18px,2vw,20px)] text-muted">{p.desc}</p>
        </header>

        {p.image && (
          <div className="shot max-w-[1000px]">
            <Image
              src={p.image.url}
              alt={`Capture d'écran du projet ${p.title}`}
              fill
              priority
              sizes="(max-width: 1040px) 100vw, 1000px"
              className="object-cover object-top"
            />
          </div>
        )}

        <div className="grid gap-10 min-[861px]:grid-cols-[1.4fr_1fr]">
          {p.role && (
            <section aria-labelledby="role" className="grid content-start gap-3">
              <h2 id="role" className="text-[clamp(24px,2.8vw,30px)] font-extrabold">
                Mon <em>rôle</em>
              </h2>
              <p className="text-[17px]">{p.role}</p>
            </section>
          )}
          <aside className="grid content-start gap-5">
            {p.stack.length > 0 && (
              <div className="grid gap-3">
                <h2 className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
                  Technologies
                </h2>
                <ul className="chips m-0 flex list-none flex-wrap gap-2 p-0">
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {(p.demoUrl || p.githubUrl) && (
              <div className="links flex flex-wrap gap-[18px] text-[15px] font-semibold">
                {p.demoUrl && (
                  <a href={p.demoUrl} target="_blank" rel="noopener">
                    Voir le site
                  </a>
                )}
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noopener">
                    Code sur GitHub
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        <nav
          aria-label="Pour aller plus loin"
          className="grid gap-6 border-t border-line pt-8 min-[641px]:grid-cols-2"
        >
          {next && (
            <div>
              <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
                Projet suivant
              </p>
              <Link
                href={projectPath(next.slug)}
                className="mt-2 inline-block text-xl font-bold underline-offset-4 hover:underline"
              >
                {next.title} →
              </Link>
            </div>
          )}
          {services.length > 0 && (
            <div>
              <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
                Besoin d&apos;un projet similaire ?
              </p>
              <ul className="m-0 mt-2 grid list-none gap-1 p-0">
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={servicePath(s.slug)}
                      className="font-semibold underline-offset-4 hover:underline"
                    >
                      {s.title} à Abidjan
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </article>
    </InnerPage>
  );
}
