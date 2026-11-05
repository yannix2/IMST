"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The closing sign flips its welcome through the school's four scripts, one plate at a time
// (the brief's motion grammar: plates swap with a short flip). It renders the visitor's own
// greeting as plain text first; React Bits' RotatingText (and the `motion` library behind it)
// loads only when the sign comes near the screen, flips only while visible, and never under
// reduced motion. The greetings are decorative: the band's heading carries the meaning.

const RotatingText = dynamic(() => import("@/components/react-bits/rotating-text"), { ssr: false });

const flip = { type: "tween", duration: 0.5, ease: [0.16, 1, 0.3, 1] } as const;

export function GreetingSign({ greetings, className }: { greetings: string[]; className?: string }) {
  const host = useRef<HTMLParagraphElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [still, setStill] = useState(true);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(reduce.matches);
    const onReduce = () => setStill(reduce.matches);
    reduce.addEventListener("change", onReduce);

    const approach = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    const onScreen = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    approach.observe(el);
    onScreen.observe(el);
    return () => {
      reduce.removeEventListener("change", onReduce);
      approach.disconnect();
      onScreen.disconnect();
    };
  }, []);

  const first = greetings[0] ?? "";

  return (
    <p ref={host} aria-hidden="true" className={className}>
      {near && !still ? (
        <RotatingText
          texts={greetings}
          effect="flip"
          splitBy="lines"
          transition={flip}
          rotationInterval={2600}
          auto={visible}
          // The flip is clipped to its window; side room keeps the last letter whole mid-flip.
          mainClassName="-mx-2 overflow-hidden px-2"
        />
      ) : (
        <span className="block">{first}</span>
      )}
    </p>
  );
}
