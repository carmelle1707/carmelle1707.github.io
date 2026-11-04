import Link from "next/link";
import { logout } from "@/actions/auth";
import { AdminNav } from "./admin-nav";

type Props = { email: string; unread: number; children: React.ReactNode };

export function AdminShell({ email, unread, children }: Props) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-5 py-3">
          <Link href="/admin" className="font-display text-lg font-extrabold no-underline">
            Administration<span className="text-gold">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted min-[641px]:inline">{email}</span>
            <a href="/" target="_blank" rel="noopener" className="admin-btn">
              Voir le site <span aria-hidden="true">↗</span>
            </a>
            <form action={logout}>
              <button type="submit" className="admin-btn admin-btn-quiet">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <AdminNav unread={unread} />
      <main className="mx-auto max-w-[1120px] px-5 py-10">{children}</main>
    </>
  );
}
