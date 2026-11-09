"use client";

import { RotateCcwIcon, RotateCwIcon } from "lucide-react";
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// A photo card that turns over on click (owner decision 2026-11-06: no hover flip). Both faces
// are server-rendered and stay in the DOM; the hidden one is inert, so keyboard and screen
// readers only meet the visible side. Focus follows the turn. The card's box is fixed by its
// parent (aspect ratio), so turning never moves the page. Reduced motion: a crossfade
// (globals.css, .flip-card).

type Props = {
  front: React.ReactNode;
  back: React.ReactNode;
  /** Visible name of the card, used for the buttons' accessible names. */
  title: string;
  openLabel: string;
  closeLabel: string;
  className?: string;
};

export function FlipCard({ front, back, title, openLabel, closeLabel, className }: Props) {
  const [flipped, setFlipped] = useState(false);
  const open = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const backId = useId();

  const turn = (to: boolean) => {
    setFlipped(to);
    // After the faces swap their inert state.
    requestAnimationFrame(() => (to ? close.current : open.current)?.focus({ preventScroll: true }));
  };

  return (
    <div className={cn("flip-card", className)} data-flipped={flipped || undefined}>
      <div className="flip-card-inner">
        <div className="flip-card-face" inert={flipped} aria-hidden={flipped || undefined}>
          {/* Each face's server-rendered content sits alone in its own box (no sibling list). */}
          <div className="size-full">{front}</div>
          {/* The whole front is the button; the cue in the corner says it turns. */}
          <button
            ref={open}
            type="button"
            onClick={() => turn(true)}
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={`${title}: ${openLabel}`}
            className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none focus-visible:ring-inset"
          >
            <span className="absolute end-3 top-3 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-night shadow-rest backdrop-blur-sm">
              <RotateCwIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
            </span>
          </button>
        </div>
        <div id={backId} className="flip-card-face flip-card-back" inert={!flipped} aria-hidden={!flipped || undefined}>
          {/* First in the back's order, so after the turn Tab goes on into the back's content. */}
          <button
            ref={close}
            type="button"
            onClick={() => turn(false)}
            aria-label={`${title}: ${closeLabel}`}
            title={closeLabel}
            className="absolute end-3 top-3 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-turquoise-wash text-heading ring-1 ring-rule transition-colors hover:bg-turquoise hover:text-on-turquoise focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none"
          >
            <RotateCcwIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
          </button>
          <div className="size-full">{back}</div>
        </div>
      </div>
    </div>
  );
}
