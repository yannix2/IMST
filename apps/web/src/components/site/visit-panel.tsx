"use client";

import type { Locale } from "@maarif/contracts/locales";
import { updateRoute, useRoute } from "@/lib/route-store";
import { VisitStation } from "@/components/landing/visit-station";

// The Home page's visit station as a page of its own, sharing the remembered grade.
export function VisitPanel({ locale }: { locale: Locale }) {
  const { grade } = useRoute();
  return <VisitStation locale={locale} grade={grade} onGradeChange={(g) => updateRoute({ grade: g })} />;
}
