// The site's page tree (site_map.md, 7-item menu), in one place. The header menu, the phone
// sheet, the footer, breadcrumbs, the sitemap, hreflang and the inner-page route all read it.
// Wave 3 (docs/plans/2026-11-09-wave-3.md) adds Campus life, Parents and Careers to the menu, and
// the Legal pages (footer only). Every key is also in @maarif/contracts `sitePageKeys`, so staff
// can give each page its photos in maarifcms.
import type { SitePageKey } from "@maarif/contracts/pages";

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
] as const satisfies readonly SitePageKey[];
export type PageKey = (typeof pageKeys)[number];

export const areaKeys = ["about", "programs", "admissions", "campus-life", "parents", "careers", "contact", "legal"] as const;
export type AreaKey = (typeof areaKeys)[number];

type Area = {
  key: AreaKey;
  // The area's own page, then its sub-pages in menu order. Empty while the area is not built.
  pages: readonly PageKey[];
  // Legal: no page of its own and not in the header menu; its pages are linked from the footer.
  inMenu?: false;
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
  {
    key: "campus-life",
    pages: ["campus-life", "campus-life/news", "campus-life/events", "campus-life/gallery", "campus-life/clubs", "campus-life/trips"],
  },
  {
    key: "parents",
    pages: ["parents", "parents/calendar", "parents/schedules", "parents/menu", "parents/handbook", "parents/feedback"],
  },
  { key: "careers", pages: ["careers", "careers/openings"] },
  { key: "contact", pages: ["contact"] },
  { key: "legal", pages: ["privacy", "cookies", "terms"], inMenu: false },
];

export const legalPages = ["privacy", "cookies", "terms"] as const satisfies readonly PageKey[];

// Pages whose whole content comes from maarifcms and is not written yet. They stay out of menus
// and the sitemap (and are noindex) until the school publishes their content; the About page
// links them from a client-side card that appears only when content exists. (The welcome page
// has the school's own letter, so it is a normal page; the head's video joins it when published.)
export const cmsOnlyPages: ReadonlySet<PageKey> = new Set<PageKey>(["about/leadership"]);

// The header menu, phone sheet and footer columns: built areas that belong in the menu.
export const builtAreas = areas.filter((a) => a.pages.length > 0 && a.inMenu !== false);

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
// Legal has no heading page, so all its pages count.
export function menuPages(area: Area): PageKey[] {
  return (area.inMenu === false ? area.pages : area.pages.slice(1)).filter((k) => !cmsOnlyPages.has(k));
}

// The trail from Home to a page: Home, the area page, then the page itself.
export function trailOf(key: PageKey): PageKey[] {
  const area = areaOf(key);
  const head = area.pages[0]!;
  return head === key || area.inMenu === false ? [key] : [head, key];
}
