import type { SiteContent } from "@/lib/content-types";

function Row({ items }: { items: string[] }) {
  // Deux copies côte à côte pour une boucle sans à-coup (translateX -50 %)
  return (
    <>
      {[...items, ...items].map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </>
  );
}

export function Marquee({ marquee, skills }: Pick<SiteContent, "marquee" | "skills">) {
  const tools = skills.flatMap((g) => g.items);
  if (!marquee.length && !tools.length) return null;
  return (
    <div className="marquee" aria-hidden="true">
      {marquee.length > 0 && (
        <div data-skew>
          <div className="track">
            <Row items={marquee} />
          </div>
        </div>
      )}
      {tools.length > 0 && (
        <div className="track rev">
          <Row items={tools} />
        </div>
      )}
    </div>
  );
}
