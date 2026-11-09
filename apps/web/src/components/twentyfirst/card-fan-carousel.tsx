"use client";

// Card Fan Carousel by aayush-duhan (21st.dev, "card-fan-carousel"), vendored 2026-11-06 and
// adapted to the site: cards are any content (the Life at Maarif flip cards), labelled previous /
// next buttons and a spoken position, cards outside the fan are inert, reduced motion moves cards
// without animation, the fan's height is fixed by CSS (globals.css, .fan-layout) so nothing
// shifts, brand tokens instead of black/white. GSAP is imported only by this file, which loads
// with the Life section's chunk.

import gsap from "gsap";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type FanCard = { key: string; node: React.ReactNode };

type Props = {
  cards: FanCard[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  position: (current: number, total: number) => string;
  className?: string;
};

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
];

function spread(width: number) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1.0;
}

// Side cards drop less on narrow screens, so they stay inside the fan's fixed height.
const drop = (width: number) => 0.5 + 0.5 * spread(width);

function slotConfig(total: number, slot: number) {
  if (total >= MAX_VISIBLE) return FAN_POSITIONS[slot]!;
  const center = total >> 1;
  const distance = total > 1 ? (slot - center) / center : 0;
  const abs = Math.abs(distance);
  return { rot: distance * 21, scale: 1.0 - 0.2244 * abs * abs, x: distance * 30, y: abs * abs * 7.3, zIndex: 10 - Math.abs(slot - center) };
}

export function CardFanCarousel({ cards, label, previousLabel, nextLabel, position, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const entered = useRef(false);
  const direction = useRef<"left" | "right" | null>(null);
  const previous = useRef<Set<number>>(new Set());

  const total = cards.length;
  const paginate = total > MAX_VISIBLE;
  const [center, setCenter] = useState(paginate ? HALF : total >> 1);
  const [visible, setVisible] = useState<Set<number>>(new Set());

  const visibleMap = useCallback(
    (c: number) => {
      const map = new Map<number, number>();
      if (!paginate) {
        cards.forEach((_, i) => map.set(i, i));
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) map.set((((c + slot - HALF) % total) + total) % total, slot);
      return map;
    },
    [total, paginate, cards],
  );

  const cycle = useCallback(
    (to: "left" | "right") => {
      if (animating.current || !paginate) return;
      animating.current = true;
      direction.current = to;
      setCenter((prev) => (to === "right" ? (prev + 1) % total : (prev - 1 + total) % total));
    },
    [total, paginate],
  );

  useEffect(() => {
    const host = container.current;
    if (!host || !total) return;
    const elements = Array.from(host.querySelectorAll<HTMLElement>(":scope > .fan-card"));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = visibleMap(center);
    setVisible(new Set(map.keys()));
    const was = previous.current;
    const dir = direction.current;
    const first = !entered.current;
    const mult = spread(window.innerWidth);
    const ym = drop(window.innerWidth);
    const slots = paginate ? MAX_VISIBLE : total;
    const config = (slot: number) => slotConfig(slots, slot);
    const d = (seconds: number) => (reduce ? 0 : seconds);

    if (first) animating.current = true;
    let done = 0;
    const onDone = () => {
      if (++done >= map.size) {
        animating.current = false;
        if (first) entered.current = true;
      }
    };

    elements.forEach((card, i) => {
      const slot = map.get(i);
      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = { x: `${x * mult}rem`, y: `${y * ym}rem`, rotation: rot, scale, opacity: 1, zIndex };
        if (first) {
          gsap.set(card, { x: 0, y: "12rem", rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: d(1.2), ease: "elastic.out(1.05,.78)", delay: d(0.2 + slot * 0.06), onComplete: onDone });
        } else if (!was.has(i)) {
          const from = dir === "right" ? 40 : -40;
          gsap.set(card, { x: `${from}rem`, y: `${y * ym}rem`, rotation: dir === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: d(0.6), ease: "power2.out", onComplete: onDone });
        } else {
          gsap.to(card, { ...target, duration: d(0.5), ease: "power2.out", onComplete: onDone });
        }
      } else if (was.has(i)) {
        const to = dir === "right" ? -40 : 40;
        gsap.to(card, { x: `${to}rem`, opacity: 0, scale: 0.5, rotation: dir === "right" ? -30 : 30, duration: d(0.4), ease: "power2.in", zIndex: 0 });
      } else if (first) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });
    previous.current = new Set(map.keys());

    // Hover spread (pointer only; keyboard and touch use the buttons).
    const entries = elements.flatMap((el, i) => (map.has(i) ? [{ el, slot: map.get(i)! }] : [])).sort((a, b) => a.slot - b.slot);
    const middle = entries.length >> 1;
    let active: number | null = null;
    let leave: ReturnType<typeof setTimeout> | null = null;
    const layout = (hovered: number | null) => {
      const m = spread(window.innerWidth);
      const dy = drop(window.innerWidth);
      entries.forEach(({ el, slot }) => {
        const base = config(slot);
        let x = base.x * m;
        let y = base.y * dy;
        let rot = base.rot;
        let scale = base.scale;
        let delay = Math.abs(slot - middle) * 0.02;
        if (hovered !== null) {
          const distance = Math.abs(slot - hovered);
          delay = distance * 0.02;
          if (slot === hovered) {
            y -= 2.5;
            scale *= 1.08;
          } else {
            const n = middle > 0 ? (slot - middle) / middle : 0;
            const push = 8 * (1 - Math.abs(n)) * (1 + 0.2 * Math.max(0, 3 - distance));
            x += (slot < hovered ? -push : push) * m;
            rot += (slot < hovered ? -3 : 3) / (distance + 1);
          }
        }
        gsap.to(el, { x: `${x}rem`, y: `${y}rem`, rotation: rot, scale, duration: d(0.5), delay: d(delay), ease: "elastic.out(1,.75)", overwrite: "auto" });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };
    const handlers = entries.map(({ el, slot }) => {
      const onEnter = () => {
        if (animating.current) return;
        if (leave) clearTimeout(leave);
        if (active !== slot) {
          active = slot;
          layout(slot);
        }
      };
      el.addEventListener("pointerenter", onEnter);
      return { el, onEnter };
    });
    const onLeave = () => {
      if (animating.current) return;
      if (leave) clearTimeout(leave);
      leave = setTimeout(() => {
        active = null;
        layout(null);
      }, 50);
    };
    host.addEventListener("pointerleave", onLeave);
    const onResize = () => !animating.current && layout(active);
    window.addEventListener("resize", onResize);
    return () => {
      handlers.forEach(({ el, onEnter }) => el.removeEventListener("pointerenter", onEnter));
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      if (leave) clearTimeout(leave);
    };
  }, [center, total, visibleMap, paginate]);

  if (!total) return null;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn("flex w-full flex-col items-center", className)}>
      {/* The fan is laid out left to right in every language; the buttons follow the page. */}
      <div ref={container} dir="ltr" className="fan-layout relative flex w-full max-w-[80rem] items-center justify-center">
        {cards.map((card, i) => {
          const shown = visible.has(i);
          return (
            <div key={card.key} className="fan-card" inert={!shown} aria-hidden={!shown || undefined} aria-current={i === center || undefined}>
              {card.node}
            </div>
          );
        })}
      </div>

      {paginate ? (
        <div className="mt-6 flex items-center gap-4">
          <button type="button" onClick={() => cycle("left")} aria-label={previousLabel} className="fan-arrow">
            <ChevronLeftIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          </button>
          <div aria-hidden="true" className="flex items-center gap-1.5">
            {cards.map((card, i) => (
              <span key={card.key} className={cn("size-2 rounded-full transition-all duration-300", i === center ? "scale-125 bg-turquoise" : "bg-rule")} />
            ))}
          </div>
          <button type="button" onClick={() => cycle("right")} aria-label={nextLabel} className="fan-arrow">
            <ChevronRightIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          </button>
          <p aria-live="polite" className="sr-only">
            {position(center + 1, total)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
