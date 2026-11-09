"use client";

import dynamic from "next/dynamic";
import type { FanCard } from "@/components/twentyfirst/card-fan-carousel";
import { useNear } from "./lazy-sections";

// Loads the card fan (and GSAP with it) when Life at Maarif comes within a screen or so. The
// cards themselves are rendered by the server and passed in. The fan's box is reserved first, so
// nothing below it moves.
const CardFan = dynamic(() => import("@/components/twentyfirst/card-fan-carousel").then((m) => m.CardFanCarousel), { ssr: false });

type Props = { cards: FanCard[]; label: string; previousLabel: string; nextLabel: string; positions: string[] };

export function LifeFan({ positions, ...props }: Props) {
  const [ref, near] = useNear<HTMLDivElement>("900px 0px");
  return (
    <div ref={ref} className="life-fan-box">
      {near ? <CardFan {...props} position={(current) => positions[current - 1] ?? ""} /> : null}
    </div>
  );
}
