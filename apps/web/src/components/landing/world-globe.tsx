"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@maarif/contracts/locales";
import type { WorldCopy } from "./world-globe-panel";
import { useNear } from "./lazy-sections";

// Loads the world panel (country list, its data and the globe) when the Foundation section comes
// near, so none of it is in Home's first JavaScript. The space is reserved meanwhile: the globe's
// square plus the list on phones, the globe's height from lg. The panel loads well before it is
// on screen, so any difference never moves what the visitor sees.
const Panel = dynamic(() => import("./world-globe-panel").then((m) => m.WorldGlobePanel), { ssr: false });

export function WorldGlobe({ locale, copy }: { locale: Locale; copy: WorldCopy }) {
  const [ref, near] = useNear<HTMLDivElement>("900px 0px");
  return (
    <div ref={ref} className="min-h-[calc(min(100vw-2rem,34rem)+31rem)] lg:min-h-[34rem]">
      {near ? <Panel locale={locale} copy={copy} /> : null}
    </div>
  );
}
