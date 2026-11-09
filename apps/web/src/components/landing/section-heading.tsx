import { cn } from "@/lib/utils";

// Heading of the wave-2 Home sections: an optional Hairline icon (owner decision 2026-11-06:
// the figures live on as icons), an eyebrow, the title and a lede. `tone="plate"` for navy plates.
type Props = {
  id: string;
  title: string;
  lede?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  tone?: "ground" | "plate";
  className?: string;
};

export function SectionHeading({ id, title, lede, eyebrow, icon, tone = "ground", className }: Props) {
  const plate = tone === "plate";
  return (
    <div className={cn("flex items-start gap-5", className)}>
      {icon ? <div className="hidden shrink-0 sm:block">{icon}</div> : null}
      <div className="min-w-0">
        {eyebrow ? <p className={cn("mb-2 text-sm font-bold tracking-wide uppercase", plate ? "text-turquoise" : "text-turquoise-ink")}>{eyebrow}</p> : null}
        <h2 id={id} className={cn("text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance", plate ? "text-white" : "text-heading")}>
          {title}
        </h2>
        {lede ? <p className={cn("mt-2 max-w-[60ch] text-lg", plate ? "text-on-plate-muted" : "text-slate")}>{lede}</p> : null}
      </div>
    </div>
  );
}
