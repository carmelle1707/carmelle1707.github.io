import { PRESENTATION_VIDEO as V } from "@/lib/video";
import { SectionHead } from "./section-head";

/**
 * Vidéo de présentation : carrée sur ordinateur, verticale sur téléphone.
 * `preload="none"` : rien n'est téléchargé avant le clic (la page reste rapide sur mobile) ;
 * seule l'image d'aperçu s'affiche, avec les contrôles natifs du navigateur.
 */
export function VideoSection({ name }: { name: string }) {
  return (
    <section id="video" className="py-24" aria-labelledby="video-title">
      <div className="wrap grid items-center gap-10 min-[861px]:grid-cols-[1fr_1fr] min-[861px]:gap-16">
        <div>
          <SectionHead
            id="video-title"
            eyebrow="En vidéo"
            title="Mon travail *en 60 secondes*"
            text="Mon parcours, mes projets et les outils avec lesquels je construis vos sites et vos applications."
            compact
          />
          <p className="max-w-[46ch] text-[15px] text-muted" data-reveal>
            Au programme : qui je suis, les projets Flot, YOWL, CinéScope et Post-it, puis ma boîte
            à outils, du web au mobile. Les textes à l&apos;écran sont en anglais.
          </p>
        </div>

        <figure className="m-0" data-reveal>
          <video
            className="hidden aspect-square w-full rounded-[22px] border border-line bg-band object-cover min-[641px]:block"
            controls
            playsInline
            preload="none"
            poster={V.square.poster}
            width={V.square.width}
            height={V.square.height}
            aria-label={`Vidéo de présentation de ${name}`}
          >
            <source src={V.square.src} type="video/mp4" />
          </video>
          <video
            className="mx-auto block aspect-[9/16] w-full max-w-[340px] rounded-[22px] border border-line bg-band object-cover min-[641px]:hidden"
            controls
            playsInline
            preload="none"
            poster={V.vertical.poster}
            width={V.vertical.width}
            height={V.vertical.height}
            aria-label={`Vidéo de présentation de ${name}`}
          >
            <source src={V.vertical.src} type="video/mp4" />
          </video>
          <figcaption className="sr-only">{V.description}</figcaption>
        </figure>
      </div>
    </section>
  );
}
