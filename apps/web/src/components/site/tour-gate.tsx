"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { TourBarProps } from "./tour-bar";

// Rendered only on the six tour pages (PageShell). Shows the tour bar when the address carries
// ?tour=1, i.e. the visitor came from "Discover our school" or a tour link; the bar's code is
// fetched only then. The bar is fixed at the bottom, so nothing in the page moves.
const TourBar = dynamic(() => import("./tour-bar").then((m) => m.TourBar), { ssr: false });

export function TourGate(props: TourBarProps) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(location.search).get("tour") === "1");
  }, []);
  return on ? <TourBar {...props} /> : null;
}
