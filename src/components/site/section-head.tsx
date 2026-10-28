import { stripEmphasis } from "@/lib/rich-title";
import { SplitText } from "./split-text";

type Props = { id: string; eyebrow: string; title: string; text?: string; compact?: boolean };

export function SectionHead({ id, eyebrow, title, text, compact }: Props) {
  return (
    <div className={`sec-head grid max-w-[660px] gap-3 ${compact ? "mb-8" : "mb-12"}`}>
      <span className="eyebrow" data-reveal>
        {eyebrow}
      </span>
      <h2 id={id} aria-label={stripEmphasis(title)} data-split>
        <SplitText text={title} />
      </h2>
      {text && (
        <p className="text-muted" data-reveal>
          {text}
        </p>
      )}
    </div>
  );
}
