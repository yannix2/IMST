"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { HairlineFigure } from "./generated/figure";
import type { HairlineStage as StageType } from "./hairline-stage";

// The Hairline figure of an inner page's header. Each figure is its own chunk, fetched when
// the header is near the screen (it usually is: the header is the first thing on the page);
// the same 400 × 320 box is reserved until then, so nothing moves (CLS 0).
// `captions` turns the figure's read-out into words in the page language. The stage and the
// Hairline engine come with the figure, so a page that never shows one never loads them.

const loaders = {
  rosette: () => import("./generated/rosette.js"),
  schoolhouse: () => import("./generated/schoolhouse.js"),
  staircase: () => import("./generated/staircase.js"),
  door: () => import("./generated/door.js"),
  network: () => import("./generated/network.js"),
  robot: () => import("./generated/robot.js"),
} satisfies Record<string, () => Promise<{ figure: HairlineFigure }>>;

export type FigureName = keyof typeof loaders;

type Props = {
  name: FigureName;
  label: string;
  captions?: Record<string, string>;
  tone?: "plate" | "ground";
  className?: string;
};

export function PageFigure({ name, label, captions = {}, tone = "ground", className }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<{ figure: HairlineFigure; Stage: ComponentType<React.ComponentProps<typeof StageType>> } | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let live = true;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        void Promise.all([loaders[name](), import("./hairline-stage")]).then(([m, s]) => live && setLoaded({ figure: m.figure, Stage: s.HairlineStage }));
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(el);
    return () => {
      live = false;
      near.disconnect();
    };
  }, [name]);

  return (
    <div ref={host} className={className}>
      {loaded ? (
        <loaded.Stage figure={loaded.figure} label={label} tone={tone} caption={(code) => captions[code] ?? null} />
      ) : (
        <div className="flex flex-col items-center">
          <div role="img" aria-label={label} className="aspect-[400/320] w-full" />
          <div aria-hidden="true" className="min-h-8" />
        </div>
      )}
    </div>
  );
}
