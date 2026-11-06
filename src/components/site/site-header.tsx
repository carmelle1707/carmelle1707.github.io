import { ThemeToggle } from "./theme-toggle";

export const NAV = [
  { href: "#services", label: "Services" },
  { href: "#methode", label: "Méthode" },
  { href: "#projets", label: "Projets" },
  { href: "#parcours", label: "Parcours" },
] as const;

/** `home` : sur l'accueil, liens d'ancre ; sur une page intérieure, retour vers les sections. */
export function SiteHeader({ shortName, home = true }: { shortName: string; home?: boolean }) {
  const to = (anchor: string) => (home ? anchor : `/${anchor}`);
  return (
    <header className="site-top" data-header>
      <div className="wrap flex items-center justify-between gap-4 py-3.5">
        <a
          className="brand font-display text-lg font-extrabold tracking-[-0.02em] whitespace-nowrap no-underline min-[400px]:text-xl"
          href={home ? "#top" : "/"}
        >
          {shortName}
          <span>.</span>
        </a>
        <nav aria-label="Navigation principale" className="hidden min-[821px]:block">
          <ul className="m-0 flex list-none gap-7 p-0 text-[15px]">
            {NAV.map((l) => (
              <li key={l.href}>
                <a className="nav-link" href={to(l.href)} data-nav={home || undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            className="btn btn-primary !px-3.5 !py-2.5 !text-sm whitespace-nowrap min-[400px]:!px-[18px] min-[400px]:!text-[15px]"
            href={to("#contact")}
            data-magnetic
          >
            Me contacter
          </a>
        </div>
      </div>
    </header>
  );
}
