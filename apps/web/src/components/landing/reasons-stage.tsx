"use client";

import { useEffect, useRef, useState } from "react";
import { PageFigure, type FigureName } from "@/components/hairline/page-figure";
import { cn } from "@/lib/utils";

// The scroll story's moving part. Large screens: a sticky stage beside the chapters shows the
// figure of the chapter at the middle of the screen, the four figures stacked in one box and
// crossfading (each loads when the stage nears the screen; a settled figure costs nothing).
// Beside it, four stations on a short line say which chapter is read. Phones: no stage; each
// chapter carries its own figure, loaded as it nears. Under reduced motion the swap is instant.

export type ReasonFigure = { name: FigureName; label: string; captions?: Record<string, string> };

export function ReasonsStage({ figures, chapters }: { figures: ReasonFigure[]; chapters: React.ReactNode[] }) {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = [...(list.current?.querySelectorAll<HTMLElement>("[data-chapter]") ?? [])];
    // A chapter is "read" while it crosses a band at the middle of the screen.
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((el) => watch.observe(el));
    return () => watch.disconnect();
  }, []);

  return (
    <div className="mt-10 lg:mt-4 lg:grid lg:grid-cols-12 lg:gap-12">
      <div aria-hidden="true" className="hidden lg:col-span-6 lg:block">
        <div className="sticky top-[max(6rem,calc(50vh-15rem))] flex items-center gap-6">
          <ol className="flex flex-col items-center gap-3" aria-hidden="true">
            {figures.map((f, i) => (
              <li key={f.name} className="flex flex-col items-center gap-3">
                {i > 0 ? <span className={cn("h-8 w-1 rounded-full transition-colors duration-500", i <= active ? "bg-turquoise" : "bg-rule")} /> : null}
                <span
                  className={cn(
                    "size-3.5 rounded-full border-2 transition-[background-color,border-color,scale] duration-500",
                    i === active ? "scale-125 border-turquoise bg-turquoise" : i < active ? "border-turquoise bg-ground" : "border-slate bg-ground",
                  )}
                />
              </li>
            ))}
          </ol>
          <div className="grid flex-1 rounded-[var(--radius-plate)] bg-surface p-6 shadow-raised ring-1 ring-rule/70">
            {figures.map((f, i) => (
              <div
                key={f.name}
                inert={i !== active}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
                  i === active ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
                )}
              >
                <PageFigure name={f.name} label={f.label} captions={f.captions} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ol ref={list} className="flex flex-col lg:col-span-6">
        {chapters.map((chapter, i) => (
          <li
            key={i}
            data-chapter={i}
            className="flex flex-col gap-8 border-t border-rule/70 py-10 first:border-t-0 first:pt-6 lg:min-h-[68vh] lg:justify-center lg:border-t-0"
          >
            {chapter}
            <div className="mx-auto w-full max-w-sm lg:hidden">
              <PageFigure name={figures[i]!.name} label={figures[i]!.label} captions={figures[i]!.captions} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
