import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilitySwitch } from "@/components/admin/availability-switch";
import { getDashboard } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Tableau de bord" };

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export default async function DashboardPage() {
  const d = await getDashboard();

  // Ordre de lecture : ce qui demande une action (messages), puis l'état public, puis le contenu
  const rows = [
    { label: "Profil et accroche", value: "Nom, titre, photo, CV", href: "/admin/profil" },
    { label: "Coordonnées", value: "WhatsApp, email, réseaux", href: "/admin/contact" },
    {
      label: "Projets",
      value: `${plural(d.published, "publié", "publiés")}, ${plural(d.drafts, "brouillon", "brouillons")}`,
    },
    {
      label: "Services",
      value: plural(d.services, "service", "services"),
      href: "/admin/services",
    },
    { label: "Méthode", value: plural(d.steps, "étape", "étapes"), href: "/admin/methode" },
    {
      label: "Compétences",
      value: plural(d.skills, "catégorie", "catégories"),
      href: "/admin/competences",
    },
    { label: "Parcours", value: plural(d.education, "entrée", "entrées"), href: "/admin/parcours" },
    { label: "Bandeau défilant", value: plural(d.words, "mot", "mots"), href: "/admin/bandeau" },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-[32px] font-extrabold">Tableau de bord</h1>
        {!d.hasProfile && (
          <p className="mt-2 text-muted">
            La base est vide : le site affiche le contenu de départ. Lancez{" "}
            <code>npm run seed</code> ou enregistrez le profil pour commencer.
          </p>
        )}
      </div>

      <section
        aria-labelledby="inbox-title"
        className="rounded-[14px] border border-line bg-surface p-5"
      >
        <h2
          id="inbox-title"
          className="font-mono text-[13px] tracking-[0.08em] text-second uppercase"
        >
          Messages
        </h2>
        <p className="mt-2 text-[28px] font-extrabold">
          {d.unread > 0
            ? plural(d.unread, "message non lu", "messages non lus")
            : "Aucun message non lu"}
        </p>
        <p className="text-sm text-muted">
          {plural(d.messages, "message reçu", "messages reçus")} au total (hors archives).
        </p>
      </section>

      <section
        aria-label="Disponibilité"
        className="rounded-[14px] border border-line bg-surface p-5"
      >
        <AvailabilitySwitch available={d.available} />
      </section>

      <section aria-labelledby="content-title">
        <h2 id="content-title" className="text-xl font-bold">
          Contenu du site
        </h2>
        <ul className="mt-3 list-none divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface p-0">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5"
            >
              <div>
                <p className="font-semibold">{r.label}</p>
                <p className="text-sm text-muted">{r.value}</p>
              </div>
              {r.href && (
                <Link href={r.href} className="admin-btn">
                  Modifier
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
