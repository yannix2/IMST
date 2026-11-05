import { cn } from "@/lib/utils";
import { showPreviews } from "@/lib/home-content";

// Building blocks the inner pages share, so every page keeps the same rhythm: sections that
// alternate the page ground and mist, one headline style, and one note for drafts.

type SectionProps = {
  id: string;
  title?: string;
  lede?: string;
  tone?: "ground" | "mist";
  className?: string;
  children: React.ReactNode;
};

export function PageSection({ id, title, lede, tone = "ground", className, children }: SectionProps) {
  return (
    <section
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn("defer-paint scroll-mt-24 py-[var(--section-pad)]", tone === "mist" ? "bg-mist" : "bg-ground", className)}
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        {title ? (
          <div className="mb-10 max-w-[60ch]">
            <h2 id={`${id}-title`} className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-heading">
              {title}
            </h2>
            {lede ? <p className="mt-3 text-lg text-slate">{lede}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

// Marks text still waiting for the administration's approval. Shown in development only, so
// the owner sees what to have approved; visitors never see it.
export function DraftNote({ children }: { children: React.ReactNode }) {
  if (!showPreviews) return null;
  return (
    <p className="mt-6 inline-flex rounded-full bg-notice/10 px-4 py-1.5 text-sm font-medium text-notice ring-1 ring-notice/30">
      [{children}]
    </p>
  );
}

// A raised card on the ground or mist: one radius, one shadow, one ring (DESIGN.md).
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8", className)}>{children}</div>;
}
