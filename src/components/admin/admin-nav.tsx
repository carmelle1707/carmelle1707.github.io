"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/profil", label: "Profil" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/methode", label: "Méthode" },
  { href: "/admin/competences", label: "Compétences" },
  { href: "/admin/parcours", label: "Parcours" },
  { href: "/admin/bandeau", label: "Bandeau" },
  { href: "/admin/contact", label: "Contact" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections de l'administration" className="border-b border-line bg-surface">
      {/* Sur mobile, la barre défile horizontalement plutôt que de passer sur plusieurs lignes */}
      <ul className="mx-auto flex max-w-[1120px] list-none gap-1 overflow-x-auto px-3 py-1.5">
        {ADMIN_NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="admin-nav-link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
