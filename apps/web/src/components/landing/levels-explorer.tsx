"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { Locale } from "@maarif/contracts/locales";
import type { Grade } from "@maarif/contracts/school";
import { updateRoute, useRoute } from "@/lib/route-store";
import { RouteMap } from "./route-map";
import { VisitStation } from "./visit-station";

// The levels band: the route map, the "which level?" finder beside it, and the visit station.
// All three share the child's grade; it is remembered for the next visit ("You are here").

type FinderProps = { locale: Locale; onChoose: (grade: Grade) => void };

// The finder loads when the band comes near; its card keeps the same height meanwhile.
function LazyFinder(props: FinderProps) {
  const host = useRef<HTMLDivElement>(null);
  const [Finder, setFinder] = useState<ComponentType<FinderProps> | null>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        watch.disconnect();
        void import("./level-finder").then((m) => setFinder(() => m.default));
      },
      { rootMargin: "500px 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return (
    <div ref={host} className="min-h-[19rem]">
      {Finder ? <Finder {...props} /> : <div aria-hidden="true" className="h-[19rem] rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/60" />}
    </div>
  );
}

export function LevelsExplorer({ locale }: { locale: Locale }) {
  const route = useRoute();
  const [picked, setPicked] = useState<Grade | null>(null);
  const grade = picked ?? route.grade;

  function choose(next: Grade) {
    setPicked(next);
    updateRoute({ grade: next });
  }

  return (
    <div className="flex flex-col gap-8">
      <RouteMap locale={locale} grade={grade} onChoose={choose} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <LazyFinder locale={locale} onChoose={choose} />
        </div>
        <div className="lg:col-span-8">
          <VisitStation locale={locale} grade={grade} onGradeChange={choose} />
        </div>
      </div>
    </div>
  );
}
