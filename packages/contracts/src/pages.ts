// Every page of the site (site_map.md), shared by apps/web (navigation, routes) and apps/cms
// (page visuals: which photo goes on which page). "home" is the Home page. Wave 3 adds Campus life,
// Parents, Careers and Legal (docs/plans/2026-11-09-wave-3.md); a page key may exist here before
// its page is built, so staff can prepare its photos and texts in maarifcms.
export const sitePageKeys = [
  "home",
  "about",
  "about/mission-vision",
  "about/welcome",
  "about/leadership",
  "about/accreditations",
  "about/child-protection",
  "programs",
  "programs/kindergarten",
  "programs/primary",
  "programs/lower-secondary",
  "programs/upper-secondary",
  "programs/cambridge",
  "programs/languages",
  "programs/student-support",
  "programs/technology",
  "admissions",
  "admissions/ages",
  "admissions/visit",
  "admissions/pre-register",
  "admissions/faq",
  "admissions/bus-canteen",
  "admissions/fees",
  "campus-life",
  "campus-life/news",
  "campus-life/events",
  "campus-life/gallery",
  "campus-life/clubs",
  "campus-life/trips",
  "parents",
  "parents/calendar",
  "parents/schedules",
  "parents/menu",
  "parents/handbook",
  "parents/feedback",
  "careers",
  "careers/openings",
  "contact",
  "privacy",
  "cookies",
  "terms",
] as const;
export type SitePageKey = (typeof sitePageKeys)[number];

export function isSitePageKey(value: string): value is SitePageKey {
  return (sitePageKeys as readonly string[]).includes(value);
}

// Legal pages whose text lives in the maarifcms `pages` collection (slug = page key).
export const legalPageKeys = ["privacy", "cookies", "terms"] as const satisfies readonly SitePageKey[];
