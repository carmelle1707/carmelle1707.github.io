import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { countUnread } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-session";

/** Pages protégées : la session est vérifiée côté serveur avant tout affichage. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Chargement…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const unread = await countUnread();
  return (
    <AdminShell email={user.email ?? ""} unread={unread}>
      {children}
    </AdminShell>
  );
}
