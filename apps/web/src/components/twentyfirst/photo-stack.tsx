"use client";

// Gallery ("PhotoGallery") by designali-in (21st.dev, "gallery"), vendored 2026-11-09 for "Our
// journey" on Home and adapted to the site: the cards are any server-rendered content (our
// photos), the fan spreads from the centre for any number of cards and only once the stack is on
// screen, each card keeps a small tilt and lifts on hover (no drag: nothing to do with the
// keyboard, so nothing to trap it), reduced motion shows the fan at rest, and phones get a
// swipeable row instead of overlapping cards. motion/react is already a site dependency.

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export type StackCard = { key: string; node: React.ReactNode };

const tilt = (i: number) => [-3, 2, -1.5, 2.5, -2, 1.5, -2.5][i % 7]!;

export function PhotoStack({ cards, label, className }: { cards: StackCard[]; label: string; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const seen = useInView(host, { once: true, margin: "-15% 0px" });
  const still = useReducedMotion();
  const n = cards.length;
  const spread = 150; // px between card centres on wide screens
  const at = (i: number) => (i - (n - 1) / 2) * spread;
  const drop = (i: number) => [16, 30, 8, 22, 40, 12, 26][i % 7]!;

  return (
    <div ref={host} role="list" aria-label={label} className={cn("relative", className)}>
      {/* Phones: a row to swipe through. */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:hidden">
        {cards.map((card, i) => (
          <div key={card.key} role="listitem" className="relative size-56 shrink-0 snap-center overflow-hidden rounded-[var(--radius-plate)] shadow-rest" style={{ rotate: `${tilt(i)}deg` }}>
            {card.node}
          </div>
        ))}
      </div>
      {/* Wider screens: the fan, spreading from a stack when it comes into view. */}
      <div className="relative mx-auto hidden h-[22rem] max-w-5xl md:block" dir="ltr">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            role="listitem"
            className="absolute top-0 left-1/2 -ms-[110px] size-[220px] overflow-hidden rounded-[var(--radius-plate)] shadow-raised"
            style={{ zIndex: n - Math.abs(i - (n - 1) / 2) * 2 }}
            initial={still ? false : { x: 0, y: 0, rotate: 0 }}
            animate={seen || still ? { x: at(i), y: drop(i), rotate: tilt(i) } : { x: 0, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 70, damping: 12, mass: 1, delay: still ? 0 : i * 0.12 }}
            whileHover={still ? undefined : { scale: 1.08, rotate: 0, zIndex: 50 }}
          >
            {card.node}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
