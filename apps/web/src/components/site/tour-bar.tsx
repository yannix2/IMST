"use client";

import { ArrowLeftIcon, ArrowRightIcon, CalendarCheckIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { TourCopy } from "@/content/tour";
import { cn } from "@/lib/utils";

// The guided tour's bar (wave 5): where the visitor is ("Stop 2 of 6 · Learning", a dot per stop),
// the previous and next stops, Book a visit, and a way out. Fixed at the bottom, above the safe
// area; while it is shown the page gets room at the bottom so the footer is not hidden.
export type TourBarProps = {
  index: number;
  stops: { href: string; title: string }[];
  visitHref: string;
  visitLabel: string;
  copy: TourCopy;
};

export function TourBar({ index, stops, visitHref, visitLabel, copy }: TourBarProps) {
  const [open, setOpen] = useState(true);
  const last = index === stops.length - 1;
  const prev = index > 0 ? stops[index - 1] : null;
  const next = last ? null : stops[index + 1];

  useEffect(() => {
    document.body.classList.toggle("with-tour-bar", open);
    return () => document.body.classList.remove("with-tour-bar");
  }, [open]);

  if (!open) return null;

  const leave = () => {
    const url = new URL(location.href);
    url.searchParams.delete("tour");
    history.replaceState(history.state, "", url);
    setOpen(false);
  };

  const round =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-white/30 transition-colors hover:bg-white/15 focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none";

  return (
    <nav
      aria-label={copy.label}
      className="plate tour-in fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-3xl items-center gap-2 rounded-[1.75rem] bg-navy p-2 text-white shadow-raised ring-1 ring-white/10 sm:gap-3 sm:p-3"
    >
      {prev ? (
        <a href={prev.href} aria-label={`${copy.previous}: ${prev.title}`} title={copy.previous} className={round}>
          <ArrowLeftIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </a>
      ) : (
        <span aria-hidden="true" className="size-11 shrink-0" />
      )}

      <div className="min-w-0 flex-1 px-1">
        <p className="truncate text-sm text-on-plate-muted">
          {copy.stop.replace("{n}", String(index + 1)).replace("{total}", String(stops.length))} · <span className="font-bold text-white">{stops[index]!.title}</span>
        </p>
        <ol className="mt-1.5 flex gap-1.5" aria-hidden="true">
          {stops.map((s, i) => (
            <li key={s.href} className={cn("h-1.5 flex-1 rounded-full", i <= index ? "bg-turquoise" : "bg-white/25")} />
          ))}
        </ol>
        {last ? <p className="mt-1 hidden text-sm text-on-plate-muted sm:block">{copy.endHint}</p> : null}
      </div>

      {next ? (
        <a
          href={next.href}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-turquoise px-4 font-bold text-on-turquoise transition-colors hover:bg-[color-mix(in_oklch,var(--turquoise),white_14%)] focus-visible:ring-3 focus-visible:ring-white focus-visible:outline-none"
        >
          <span className="hidden sm:inline">{copy.next}</span>
          <span className="sr-only sm:hidden">
            {copy.next}: {next.title}
          </span>
          <ArrowRightIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </a>
      ) : (
        <a
          href={visitHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-turquoise px-4 font-bold text-on-turquoise transition-colors hover:bg-[color-mix(in_oklch,var(--turquoise),white_14%)] focus-visible:ring-3 focus-visible:ring-white focus-visible:outline-none"
        >
          <CalendarCheckIcon aria-hidden="true" className="size-5" />
          <span className="hidden sm:inline">{visitLabel}</span>
          <span className="sr-only sm:hidden">{visitLabel}</span>
        </a>
      )}

      <button type="button" onClick={leave} aria-label={last ? `${copy.end}: ${copy.leave}` : copy.leave} title={copy.leave} className={cn(round, "cursor-pointer")}>
        <XIcon aria-hidden="true" className="size-5" />
      </button>
    </nav>
  );
}
