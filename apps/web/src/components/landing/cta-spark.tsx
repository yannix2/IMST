"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";

// Acknowledges the press on a "next step" button with a short burst along the Maarif line's
// colours. Under reduced motion React Bits draws a brief static flash instead of moving sparks.
// The effect (React Bits ClickSpark) is not part of the first load: the button renders in the
// same wrapper at once, and the effect arrives when the browser is idle. The swap waits while
// the button has focus, so focus is never lost.
const tones = {
  light: ["#00ADBB", "#103B65"], // on white grounds
  plate: ["#00ADBB", "#ffffff"], // on navy plates
} as const;

type SparkProps = Record<string, unknown> & { className?: string; children: React.ReactNode };
let loaded: ComponentType<SparkProps> | null = null;
let loading: Promise<ComponentType<SparkProps>> | null = null;
const load = () =>
  (loading ??= import("@/components/react-bits/click-spark").then((m) => {
    loaded = m.default as unknown as ComponentType<SparkProps>;
    return loaded;
  }));

type Props = { tone?: keyof typeof tones; className?: string; children: React.ReactNode };

export function CtaSpark({ tone = "light", className, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [Spark, setSpark] = useState<ComponentType<SparkProps> | null>(() => loaded);

  useEffect(() => {
    if (Spark) return;
    let cancelled = false;
    let retry = 0;
    const swap = (component: ComponentType<SparkProps>) => {
      if (cancelled) return;
      if (root.current?.contains(document.activeElement)) {
        retry = window.setTimeout(() => swap(component), 800);
        return;
      }
      setSpark(() => component);
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const handle = idle(() => void load().then(swap), { timeout: 4000 });
    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      if (window.cancelIdleCallback && typeof handle === "number") window.cancelIdleCallback(handle);
    };
  }, [Spark]);

  if (Spark) {
    return (
      <Spark
        className={cn("inline-flex", className)}
        sparkColor={[...tones[tone]]}
        sparkCount={10}
        sparkRadius={34}
        sparkSize={11}
        sparkWidth={2.5}
        duration={420}
        shape="line"
      >
        {children}
      </Spark>
    );
  }
  // The same box ClickSpark draws (relative isolate wrapper with an empty layer), so the swap
  // changes nothing on screen.
  return (
    <div ref={root} className={cn("relative isolate inline-flex", className)}>
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-visible" />
    </div>
  );
}
