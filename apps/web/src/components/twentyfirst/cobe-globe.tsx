"use client";

// COBE Globe by shuding (21st.dev, https://21st.dev/@shuding/components/cobe-globe), on the
// `cobe` WebGL library (MIT). Adapted for the Maarif site:
//   - it faces a chosen point (`focus`) and sways gently around it instead of spinning away,
//     and a drag springs back to that point;
//   - it stops drawing while off screen and holds still under reduced motion;
//   - labels use the site's type (Readex Pro, sentence case) and navy/white pills;
//   - colours come from props so the caller can follow the light and dark themes;
//   - (wave 2) a new `focus` turns the globe there smoothly instead of rebuilding it; markers may
//     carry no label and have their own size; `highlight` shows one extra label (the world
//     globe's chosen country) without rebuilding the globe.
// Labels sit on CSS Anchor Positioning; browsers without it simply show the globe.

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export type GlobeMarker = { id: string; location: [number, number]; label?: string; size?: number };
export type GlobeArc = { id: string; from: [number, number]; to: [number, number]; label?: string };
type RGB = [number, number, number];

type Props = {
  markers: GlobeMarker[];
  arcs?: GlobeArc[];
  focus: [number, number];
  highlight?: { id: string; label: string } | null;
  className?: string;
  dark?: number;
  baseColor: RGB;
  markerColor: RGB;
  arcColor: RGB;
  glowColor: RGB;
  mapBrightness?: number;
  arcHeight?: number;
  label: string;
};

const rad = (deg: number) => (deg * Math.PI) / 180;
// Longitude turns phi, latitude tilts theta.
const facing = ([lat, lon]: [number, number]) => ({ phi: Math.PI - (rad(lon) - Math.PI / 2), theta: rad(lat) * 0.75 });
// The shortest way round from one angle to another.
const turn = (from: number, to: number) => from + ((((to - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

export function Globe({ markers, arcs = [], focus, highlight = null, className = "", dark = 0, baseColor, markerColor, arcColor, glowColor, mapBrightness = 6, arcHeight = 0.3, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const offset = useRef({ phi: 0, theta: 0 });
  const target = useRef(facing(focus));
  const wakeRef = useRef<() => void>(() => {});

  // A new focus: turn there (the drawing loop eases towards the target).
  useEffect(() => {
    const next = facing(focus);
    target.current = { phi: turn(target.current.phi, next.phi), theta: next.theta };
    wakeRef.current();
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const view = { ...target.current };
    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    let visible = false;
    const start = performance.now();

    const frame = () => {
      raf = 0;
      if (!globe || !visible) return;
      const t = (performance.now() - start) / 1000;
      // Spring the drag offset back to the focus point when released.
      if (!drag.current) {
        offset.current.phi *= 0.94;
        offset.current.theta *= 0.94;
      }
      // Ease towards the focus (at once under reduced motion).
      const k = still ? 1 : 0.06;
      view.phi += (target.current.phi - view.phi) * k;
      view.theta += (target.current.theta - view.theta) * k;
      const turning = Math.abs(target.current.phi - view.phi) > 0.001 || Math.abs(target.current.theta - view.theta) > 0.001;
      const sway = still ? 0 : Math.sin(t * 0.35) * 0.22;
      globe.update({ phi: view.phi + sway + offset.current.phi, theta: view.theta + offset.current.theta });
      if (!still || turning || drag.current || Math.abs(offset.current.phi) > 0.001) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    const init = () => {
      const width = canvas.offsetWidth;
      if (!width || globe) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: view.phi,
        theta: view.theta,
        dark,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation: 0.02,
        markers: markers.map((m) => ({ location: m.location, size: m.size ?? 0.06, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor,
        arcWidth: 0.6,
        arcHeight,
        opacity: 0.85,
      });
      canvas.style.opacity = "1";
      wake();
    };

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        init();
        wake();
      }
    });
    onScreen.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      offset.current.phi += (e.clientX - drag.current.x) / 240;
      offset.current.theta = Math.max(-0.35, Math.min(0.35, offset.current.theta + (e.clientY - drag.current.y) / 900));
      drag.current = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onUp = () => {
      drag.current = null;
      canvas.style.cursor = "grab";
      wake();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      onScreen.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
      wakeRef.current = () => {};
      globe?.destroy();
    };
  }, [markers, arcs, dark, baseColor, markerColor, arcColor, glowColor, mapBrightness, arcHeight]);

  const pills = [
    ...markers.filter((m) => m.label && m.id !== highlight?.id).map((m) => ({ id: m.id, label: m.label!, anchor: `--cobe-${m.id}`, tone: "marker" as const })),
    ...(highlight ? [{ id: highlight.id, label: highlight.label, anchor: `--cobe-${highlight.id}`, tone: "marker" as const }] : []),
    ...arcs.filter((a) => a.label).map((a) => ({ id: a.id, label: a.label!, anchor: `--cobe-arc-${a.id}`, tone: "arc" as const })),
  ];

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.style.cursor = "grabbing";
        }}
        className="size-full rounded-full opacity-0 transition-opacity duration-1000"
        style={{ cursor: "grab", touchAction: "pan-y", contain: "layout paint size" }}
      />
      {pills.map((item) => (
        <div
          key={item.anchor}
          aria-hidden="true"
          className={
            item.tone === "marker"
              ? "pointer-events-none absolute rounded-full bg-navy px-3 py-1 text-sm font-bold whitespace-nowrap text-white shadow-station"
              : "pointer-events-none absolute rounded-full bg-surface px-3 py-1 text-xs font-bold whitespace-nowrap text-heading shadow-station ring-1 ring-rule"
          }
          style={
            {
              positionAnchor: item.anchor,
              bottom: "anchor(top)",
              left: "anchor(center)",
              translate: "-50% 0",
              marginBottom: 10,
              opacity: `var(--cobe-visible-${item.tone === "marker" ? "" : "arc-"}${item.id}, 0)`,
              transition: "opacity 0.6s",
            } as React.CSSProperties
          }
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
