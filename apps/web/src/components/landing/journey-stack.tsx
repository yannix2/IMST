"use client";

import dynamic from "next/dynamic";
import type { StackCard } from "@/components/twentyfirst/photo-stack";
import { useNear } from "./lazy-sections";

// Loads the photo stack (and motion with it) when "Our journey" comes near; the box is reserved
// first (the stack's height on each screen size), so nothing below it moves.
const Stack = dynamic(() => import("@/components/twentyfirst/photo-stack").then((m) => m.PhotoStack), { ssr: false });

export function JourneyStack({ cards, label }: { cards: StackCard[]; label: string }) {
  const [ref, near] = useNear<HTMLDivElement>("900px 0px");
  return (
    <div ref={ref} className="min-h-[15.5rem] md:min-h-[22rem]">
      {near ? <Stack cards={cards} label={label} /> : null}
    </div>
  );
}
