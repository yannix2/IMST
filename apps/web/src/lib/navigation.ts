// The site's page tree (site_map.md, 7-item menu), in one place. The header menu, the phone
// sheet, the footer, breadcrumbs, the sitemap, hreflang and the inner-page route all read it.
// Areas of wave 2 (plan: docs/plans/2026-11-05-wave-1.md) are listed but not built, so they
// stay out of every menu until their pages exist.

export const pageKeys = [
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
  "contact",
] as const;
export type PageKey = (typeof pageKeys)[number];

export const areaKeys = ["about", "programs", "admissions", "campus-life", "parents", "careers", "contact"] as const;
export type AreaKey = (typeof areaKeys)[number];

type Area = {
  key: AreaKey;
  // The area's own page, then its sub-pages in menu order. Empty while the area is not built.
  pages: readonly PageKey[];
};

export const areas: readonly Area[] = [
  {
    key: "about",
    pages: ["about", "about/mission-vision", "about/welcome", "about/leadership", "about/accreditations", "about/child-protection"],
  },
  {
    key: "programs",
    pages: [
      "programs",
      "programs/kindergarten",
      "programs/primary",
      "programs/lower-secondary",
      "programs/upper-secondary",
      "programs/cambridge",
      "programs/languages",
      "programs/student-support",
      "programs/technology",
    ],
  },
  {
    key: "admissions",
    pages: [
      "admissions",
      "admissions/ages",
      "admissions/visit",
      "admissions/pre-register",
      "admissions/faq",
      "admissions/bus-canteen",
      "admissions/fees",
    ],
  },
  { key: "campus-life", pages: [] },
  { key: "parents", pages: [] },
  { key: "careers", pages: [] },
  { key: "contact", pages: ["contact"] },
];

// Pages whose whole content comes from maarifcms and is not written yet. They stay out of menus
// and the sitemap (and are noindex) until the school publishes their content; the About page
// links them from a client-side card that appears only when content exists. (The welcome page
// has the school's own letter, so it is a normal page; the head's video joins it when published.)
export const cmsOnlyPages: ReadonlySet<PageKey> = new Set<PageKey>(["about/leadership"]);

export const builtAreas = areas.filter((a) => a.pages.length > 0);

export function areaOf(key: PageKey): Area {
  const area = areas.find((a) => a.pages.includes(key));
  if (!area) throw new Error(`page ${key} is in no area`);
  return area;
}

export const pathOf = (key: PageKey) => `/${key}`;

export function isPageKey(value: string): value is PageKey {
  return (pageKeys as readonly string[]).includes(value);
}

// Sub-pages shown in menus: the area's own page is its heading, CMS-only pages wait for content.
export function menuPages(area: Area): PageKey[] {
  return area.pages.slice(1).filter((k) => !cmsOnlyPages.has(k));
}

// The trail from Home to a page: Home, the area page, then the page itself.
export function trailOf(key: PageKey): PageKey[] {
  const area = areaOf(key);
  const head = area.pages[0]!;
  return head === key ? [key] : [head, key];
}
