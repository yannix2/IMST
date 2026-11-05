"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GlobeArc, GlobeMarker } from "@/components/twentyfirst/cobe-globe";

// The globe (cobe, WebGL) is its own chunk, loaded when the campus section comes near. It turns
// towards Tunis, where both campuses are (they are 9 km apart, one marker on a globe), with an
// arc from Istanbul, home of the Türkiye Maarif Foundation. Colours follow the theme.
const Globe = dynamic(() => import("@/components/twentyfirst/cobe-globe").then((m) => m.Globe), { ssr: false });

const TUNIS: [number, number] = [36.84, 10.25];
// [PROPOSAL] The Foundation's head office is in Istanbul; confirm before launch.
const ISTANBUL: [number, number] = [41.01, 28.98];

type Props = { label: string; city: string; foundation: string };

export function CampusGlobe({ label, city, foundation }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const root = document.documentElement;
    const read = () => setDark(root.dataset.theme === "dark");
    read();
    const theme = new MutationObserver(read);
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        watch.disconnect();
        setNear(true);
      },
      { rootMargin: "600px 0px" },
    );
    watch.observe(el);
    return () => {
      theme.disconnect();
      watch.disconnect();
    };
  }, []);

  const markers = useMemo<GlobeMarker[]>(() => [{ id: "tunis", location: TUNIS, label: city }], [city]);
  const arcs = useMemo<GlobeArc[]>(() => [{ id: "maarif", from: ISTANBUL, to: TUNIS, label: foundation }], [foundation]);
  // Brand colours as 0-1 RGB: turquoise #00ADBB, light map on white, night-navy map in dark.
  const palette = useMemo(
    () =>
      dark
        ? { dark: 1, baseColor: [0.16, 0.27, 0.42] as [number, number, number], glowColor: [0.06, 0.16, 0.28] as [number, number, number], mapBrightness: 5 }
        : { dark: 0, baseColor: [1, 1, 1] as [number, number, number], glowColor: [0.84, 0.9, 0.95] as [number, number, number], mapBrightness: 7 },
    [dark],
  );

  return (
    // The square is reserved before the globe loads, so nothing moves.
    <div ref={host} className="mx-auto aspect-square w-full max-w-[34rem]">
      {near ? (
        <Globe
          key={dark ? "dark" : "light"}
          markers={markers}
          arcs={arcs}
          focus={[34, 16]}
          markerColor={[0, 0.68, 0.73]}
          arcColor={[0, 0.68, 0.73]}
          label={label}
          {...palette}
        />
      ) : null}
    </div>
  );
}
