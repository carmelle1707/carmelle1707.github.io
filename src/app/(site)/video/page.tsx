import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, InnerPage } from "@/components/site/inner-page";
import { PresentationPlayer } from "@/components/site/video-section";
import { getPagesContent, projectPath, servicePath } from "@/lib/pages";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, videoPageData } from "@/lib/structured-data";
import { PRESENTATION_VIDEO as V } from "@/lib/video";

const title = `Vidéo de présentation · ${V.title}`;

export const metadata: Metadata = {
  title,
  description: V.description,
  alternates: { canonical: V.pagePath },
  openGraph: {
    type: "video.other",
    locale: "fr_FR",
    url: V.pagePath,
    title,
    description: V.description,
    images: [{ url: V.square.poster, width: 1080, height: 1080 }],
    videos: [
      {
        url: `${siteUrl()}${V.square.src}`,
        type: "video/mp4",
        width: V.square.width,
        height: V.square.height,
      },
    ],
  },
  twitter: { card: "summary_large_image", title, description: V.description },
};

/**
 * Page de lecture : la vidéo est le premier contenu sous le titre, visible sans défiler.
 * C'est la condition posée par Google pour l'afficher dans ses résultats vidéo.
 */
export default async function VideoPage() {
  const { content: c, services, projects } = await getPagesContent();
  return (
    <InnerPage content={c}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(videoPageData(c, siteUrl())) }}
      />
      <article className="wrap grid gap-8 pt-8 pb-24">
        <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Vidéo" }]} />
        <h1 className="text-[clamp(30px,4.4vw,52px)] font-extrabold">
          {c.profile.name} <em>en 60 secondes</em>
        </h1>
        <PresentationPlayer name={c.profile.name} large />
        <div className="grid max-w-[760px] gap-4">
          <p className="text-[clamp(17px,1.8vw,19px)] text-muted">{V.description}</p>
          <p className="text-[15px] text-muted">
            Durée : 1 min · Textes à l&apos;écran en anglais · Publiée le 4 novembre 2026
          </p>
        </div>
        <nav
          aria-label="Pour aller plus loin"
          className="grid gap-6 border-t border-line pt-8 min-[641px]:grid-cols-2"
        >
          <div>
            <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
              Les projets de la vidéo
            </p>
            <ul className="m-0 mt-2 grid list-none gap-1 p-0">
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
          </div>
          <div>
            <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
              Mes offres
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
        </nav>
      </article>
    </InnerPage>
  );
}
