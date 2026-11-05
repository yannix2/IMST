"use client";

import type { Locale } from "@maarif/contracts/locales";
import type { Grade } from "@maarif/contracts/school";
import { RouteMap } from "@/components/landing/route-map";
import { updateRoute, useRoute } from "@/lib/route-store";

// The Home route map on the Programs page: choosing a station remembers the year ("You are
// here") and opens that level's page.
const pageOf = (g: Grade) => {
  if (g === "kg") return "kindergarten";
  const y = Number(g.slice(5));
  return y <= 6 ? "primary" : y <= 9 ? "lower-secondary" : "upper-secondary";
};

export function ProgramsRoute({ locale }: { locale: Locale }) {
  const { grade } = useRoute();
  return (
    <RouteMap
      locale={locale}
      grade={grade}
      onChoose={(g) => {
        updateRoute({ grade: g });
        window.location.assign(`/${locale}/programs/${pageOf(g)}`);
      }}
    />
  );
}
