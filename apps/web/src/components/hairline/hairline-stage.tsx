// Imported only by client components (signpost-figure, schoolhouse-figure): no entry directive.
import { useEffect, useRef, useState } from "react";
import { HL } from "./generated/kernel.js";
import type { HairlineFigure } from "./generated/figure";

// Mounts one Hairline figure the way @lucasmarkes/hairline mounts its own: one svg in a host
// element, a read-out, and nothing left behind on unmount. The palette is the sign plate's:
// navy ground, white edges, turquoise as the one highlight. The read-out (what is under the
// pointer) sits outside the drawing (rule 10) and is turned into words by the caller.

export const plateTheme = {
  "--hairline-plate": "var(--navy)",
  "--hairline-hi": "var(--turquoise)",
  "--hairline-edge": "#e8f0f6",
  "--hairline-mid": "#8fb0cc",
  "--hairline-lo": "#3f6a94",
  "--hairline-stroke": "1.1",
} as React.CSSProperties;

type Props = {
  figure: HairlineFigure;
  label: string;
  caption: (code: string) => React.ReactNode;
  className?: string;
  // "plate": on a navy sign plate. "ground": on the page ground, following the theme (globals.css).
  tone?: "plate" | "ground";
};

export function HairlineStage({ figure, label, caption, className, tone = "plate" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("rest");

  useEffect(() => {
    const stage = host.current;
    if (!stage) return;
    HL.inject(document);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    let text: string | null = null;
    const read = {
      get textContent() {
        return text;
      },
      set textContent(value: string | null) {
        text = value;
        setCode(value ?? "rest");
      },
    };
    const handle = figure.mount({ stage, svg, read }, figure.range[1]);
    return () => {
      handle.destroy();
      svg.remove();
    };
  }, [figure]);

  return (
    <figure className={`m-0 flex flex-col items-center ${className ?? ""}`}>
      <div
        ref={host}
        data-hairline={figure.name}
        data-hairline-theme="dark"
        role="img"
        aria-label={label}
        // The svg mounts after hydration; reserve its 400 × 320 box so nothing below moves.
        className={tone === "ground" ? "hairline-ground aspect-[400/320] w-full" : "aspect-[400/320] w-full"}
        style={tone === "plate" ? plateTheme : undefined}
      />
      {/* 20px bold is large text: turquoise on navy (3.6:1) passes the 3:1 large-text bar;
          on the ground it is Turquoise Ink (5.6:1). */}
      <figcaption aria-hidden="true" className={`min-h-8 text-xl font-bold ${tone === "ground" ? "text-turquoise-ink" : "text-turquoise"}`}>
        {code === "rest" ? null : caption(code)}
      </figcaption>
    </figure>
  );
}
