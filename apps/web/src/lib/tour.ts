import type { Locale } from "@maarif/contracts/locales";
import { pathOf, type PageKey } from "./navigation";

// The guided tour behind "Discover our school" (wave 5, owner 2026-11-10): six existing pages in
// the order of the school film's chapters. Tour links carry ?tour=1; only the browser reads it
// (components/site/tour-gate.tsx), so the pages stay statically generated.
export const tourStops = [
  "about", // our school
  "programs", // learning
  "programs/languages",
  "programs/student-support", // care and support
  "campus-life",
  "admissions/visit", // visit us
] as const satisfies readonly PageKey[];

export const TOUR_PARAM = "tour";

export const tourIndex = (page: PageKey): number => (tourStops as readonly PageKey[]).indexOf(page);

export const tourHref = (locale: Locale, index: number): string => `/${locale}${pathOf(tourStops[index]!)}?${TOUR_PARAM}=1`;
