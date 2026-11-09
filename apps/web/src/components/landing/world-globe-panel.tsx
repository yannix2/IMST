"use client";

import { MapPinIcon, SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useId, useMemo, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import type { GlobeArc, GlobeMarker } from "@/components/twentyfirst/cobe-globe";
import { foundationOffice, matchCountry, namedCountries } from "@/lib/maarif-world";
import { cn } from "@/lib/utils";

// Maarif schools around the world (wave 2): a point per country where the Foundation's map lists
// a school or institution (lib/maarif-world-data.ts), lines from Istanbul, our school in Tunis
// marked, and a searchable list beside it. Choosing a country turns the globe there. This panel
// is its own chunk, loaded near the screen by world-globe.tsx (which reserves its space); the
// globe (cobe, WebGL) follows in a chunk of its own. It sits on the Foundation's navy plate, so
// it always uses the dark palette.

const Globe = dynamic(() => import("@/components/twentyfirst/cobe-globe").then((m) => m.Globe), { ssr: false });

const TUNIS: [number, number] = [36.84, 10.25];
const OFFICE: [number, number] = [foundationOffice.lat, foundationOffice.lon];

export type WorldCopy = {
  globeLabel: string;
  search: string;
  searchPlaceholder: string;
  empty: string;
  here: string;
  office: string;
  results: string[]; // results[n] = "n countries" (index = count)
  places: string[]; // places[n] = "n places on the Foundation's map"
};

export function WorldGlobePanel({ locale, copy }: { locale: Locale; copy: WorldCopy }) {
  const countries = useMemo(() => namedCountries(locale), [locale]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("TN");
  const inputId = useId();
  const listId = useId();

  const shown = countries.filter((c) => matchCountry(query, c));
  const chosen = countries.find((c) => c.code === selected);
  const focus = useMemo<[number, number]>(() => (chosen ? [chosen.lat, chosen.lon] : TUNIS), [chosen]);

  const markers = useMemo<GlobeMarker[]>(
    () => [
      ...countries.filter((c) => c.code !== "TN").map((c) => ({ id: c.code, location: [c.lat, c.lon] as [number, number], size: 0.035 })),
      { id: "TN", location: TUNIS, size: 0.08, label: copy.here },
      { id: "office", location: OFFICE, size: 0.05 },
    ],
    [countries, copy.here],
  );
  const arcs = useMemo<GlobeArc[]>(
    () => [
      ...countries.filter((c) => c.code !== "TN").map((c): GlobeArc => ({ id: `a-${c.code}`, from: OFFICE, to: [c.lat, c.lon] })),
      { id: "a-TN", from: OFFICE, to: TUNIS },
    ],
    [countries],
  );
  const highlight = chosen && chosen.code !== "TN" ? { id: chosen.code, label: chosen.name } : null;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-12">
      <div className="mx-auto aspect-square w-full max-w-[34rem] lg:col-span-7">
        <Globe
          markers={markers}
          arcs={arcs}
          focus={focus}
          highlight={highlight}
          dark={1}
          baseColor={[0.16, 0.27, 0.42]}
          glowColor={[0.06, 0.16, 0.28]}
          markerColor={[0, 0.68, 0.73]}
          arcColor={[0.25, 0.8, 0.84]}
          mapBrightness={5}
          arcHeight={0.22}
          label={copy.globeLabel}
        />
      </div>

      <div className="min-w-0 lg:col-span-5">
        <label htmlFor={inputId} className="font-bold text-white">
          {copy.search}
        </label>
        <div className="relative mt-2">
          <SearchIcon aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-on-plate-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-controls={listId}
            autoComplete="off"
            className="h-12 w-full rounded-full border border-white/25 bg-white/[0.07] ps-12 pe-4 text-white placeholder:text-on-plate-muted focus-visible:border-turquoise focus-visible:ring-3 focus-visible:ring-turquoise/40 focus-visible:outline-none"
          />
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-on-plate-muted">
          {shown.length ? copy.results[shown.length] : copy.empty}
        </p>
        <ul id={listId} className="mt-2 max-h-[19rem] space-y-1 overflow-y-auto overscroll-contain pe-1 [scrollbar-color:rgb(255_255_255/0.3)_transparent]">
          {shown.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => setSelected(c.code)}
                aria-pressed={c.code === selected}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-full px-4 text-start transition-colors",
                  c.code === selected ? "bg-turquoise font-bold text-on-turquoise" : "text-white hover:bg-white/10",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  {c.code === "TN" ? <MapPinIcon aria-hidden="true" className="size-4" /> : null}
                  {c.name}
                </span>
                {c.code === "TN" ? <span className="text-xs font-bold">{copy.here}</span> : null}
              </button>
            </li>
          ))}
        </ul>
        {chosen ? <p className="mt-4 text-sm text-on-plate-muted">{chosen.name}: {copy.places[chosen.places]}</p> : null}
        <p className="mt-1 text-sm text-on-plate-muted">{copy.office}</p>
      </div>
    </div>
  );
}
