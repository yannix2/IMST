"use client";

// Coverflow Carousel by ruixen.ui (21st.dev, https://21st.dev/@ruixen.ui/components/coverflow-carousel).
// Adapted for the Maarif site: translated control labels (`previousLabel`, `nextLabel`,
// `slideLabel`), the site's tile radius and depth tokens, logical (RTL-safe) arrow placement,
// and lazy image decoding. The drawing loop is the original: transforms written straight to
// the DOM, an exponential settle, and a ring that loops without cloning nodes.

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  slideLabel?: (n: number, of: number) => string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(180px, 26vw, 300px)",
  gap = 0.05,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = "Carousel",
  previousLabel = "Previous",
  nextLabel = "Next",
  slideLabel = (n, of) => `${n} / ${of}`,
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{ id: number; x: number; pos: number; v: number; t: number } | null>(null);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback((pos: number) => ((Math.round(pos) % count) + count) % count, [count]);

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));
      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback((pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))), [count, loop]);
  const goTo = React.useCallback(
    (index: number) => settle(clamp(loop ? index + Math.round((targetRef.current - index) / count) * count : index)),
    [clamp, count, loop, settle],
  );
  const nudge = React.useCallback((by: number) => settle(clamp(Math.round(targetRef.current) + by)), [clamp, settle]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = { id: event.pointerId, x: event.clientX, pos: posRef.current, v: 0, t: performance.now() };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;
    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    settle(clamp(Math.round(posRef.current + Math.max(-2, Math.min(2, drag.v * 0.18)))));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const active = slides[selected];

  return (
    <div className={cn("w-full", className)} style={{ ["--cf-card" as string]: cardWidth }} role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          dir="ltr"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none active:cursor-grabbing"
          style={{ perspective: `calc(var(--cf-card) * ${perspective})`, touchAction: "pan-y" }}
        >
          <div className="relative select-none" style={{ height: "var(--cf-card)", transformStyle: "preserve-3d" }}>
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={slideLabel(index + 1, count)}
                className={cn("absolute top-0 left-1/2 aspect-square overflow-hidden rounded-[var(--radius-plate)] bg-mist shadow-raised will-change-transform", cardClassName)}
                style={{ width: "var(--cf-card)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.src} alt={slide.alt} draggable={false} loading="lazy" decoding="async" className="size-full object-cover select-none" />
              </div>
            ))}
          </div>
        </div>
        {showNavigation && (
          <>
            <button
              type="button"
              aria-label={previousLabel}
              onClick={() => nudge(-1)}
              className="absolute top-1/2 left-2 z-[200] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-surface text-heading shadow-rest ring-1 ring-rule transition hover:-translate-y-[calc(50%+1px)]"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => nudge(1)}
              className="absolute top-1/2 right-2 z-[200] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-surface text-heading shadow-rest ring-1 ring-rule transition hover:-translate-y-[calc(50%+1px)]"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {showCaption && active?.title ? (
        <p key={selected} className="mt-1 text-center font-bold text-heading duration-300 animate-in fade-in">
          {active.title}
        </p>
      ) : null}
      {showPagination && (
        <div className="mt-4 flex items-center justify-center gap-1">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={slideLabel(index + 1, count)}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className="grid size-9 place-items-center"
            >
              <span className={cn("block h-2 rounded-full bg-navy transition-[width,opacity] duration-300", index === selected ? "w-6 opacity-100" : "w-2 opacity-30")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
