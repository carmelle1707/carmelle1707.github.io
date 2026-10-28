import { cacheLife } from "next/cache";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ name }: { name: string }) {
  const year = await currentYear();
  return (
    <footer className="band border-t border-band-ink/12 py-7 text-sm text-band-muted">
      <div className="wrap flex flex-wrap justify-between gap-3">
        <span>
          © {year} {name}
        </span>
        <a className="text-band-ink no-underline" href="#top">
          Retour en haut ↑
        </a>
      </div>
    </footer>
  );
}
