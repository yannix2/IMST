"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The header plate stays in reach: it slides away while the visitor reads down the page and
// slides back as soon as they scroll up, raised with the floating depth once off the top.
// One passive scroll listener, read once per frame.
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [lifted, setLifted] = useState(false);
  const last = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const y = window.scrollY;
        const delta = y - last.current;
        // Small moves (a finger resting, momentum ends) never toggle it.
        if (Math.abs(delta) > 6) {
          const hide = delta > 0 && y > 120;
          // An area menu opened from the header leaves with it.
          if (hide) document.querySelectorAll<HTMLElement>("header [popover]:popover-open").forEach((p) => p.hidePopover());
          setHidden(hide);
          last.current = y;
        }
        setLifted(y > 8);
      });
    };
    last.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      // Keyboard focus inside always brings it back.
      onFocusCapture={() => setHidden(false)}
      data-hidden={hidden || undefined}
      className={cn(
        "site-header-bar sticky top-0 z-40 border-b border-transparent bg-ground transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "data-[hidden]:-translate-y-full data-[hidden]:duration-200 data-[hidden]:ease-in",
        lifted && "border-rule/70 shadow-rest",
      )}
    >
      {children}
    </div>
  );
}
