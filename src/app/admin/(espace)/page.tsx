import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tableau de bord" };

// Le vrai tableau de bord (compteurs, raccourcis) arrive à l'étape 8
export default function DashboardPage() {
  return (
    <>
      <h1 className="text-[32px] font-extrabold">Tableau de bord</h1>
      <p className="mt-2 text-muted">Session ouverte. Les outils de gestion arrivent ici.</p>
    </>
  );
}
