import type { RichBlock } from "./rich-text";

// Public content read by the site through maarif-api (/api/content/*). maarif-api builds these
// shapes from maarifcms documents; the site renders them. Nothing here is a default: when the
// school has not published an item, the API answers 404 and the section stays hidden.

// The school week runs Monday to Friday, in Tunis time.
export const schoolTimeZone = "Africa/Tunis";
export const schoolDays = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
export type SchoolDay = (typeof schoolDays)[number];

// Courses in the order a lunch is served.
export const courses = ["starter", "main", "side", "dessert", "snack"] as const;
export type Course = (typeof courses)[number];

export type MenuDish = { course: Course; dish: string };
export type MenuDay = { day: SchoolDay; date: string; dishes: MenuDish[] };
// `today` is the school day to show first: today on a school day, else the next school day.
export type WeekMenu = { weekOf: string; today: SchoolDay; days: MenuDay[] };

export type HeadMessage = {
  name: string;
  role: string;
  message: string;
  video: { src: string; type: string } | null;
  poster: string | null;
  captions: { src: string; lang: string } | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** The calendar date (y, m, d) of an instant in the school's time zone. */
function tunisDate(now: Date): { y: number; m: number; d: number; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: schoolTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  return { y: Number(get("year")), m: Number(get("month")), d: Number(get("day")), weekday };
}

const iso = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

/**
 * The school week to show at `now`: Monday's date (YYYY-MM-DD) and the day to open on.
 * On Saturday and Sunday the coming week is shown, opening on Monday.
 */
export function schoolWeek(now: Date): { weekOf: string; today: SchoolDay; dates: Record<SchoolDay, string> } {
  const { y, m, d, weekday } = tunisDate(now);
  const local = new Date(Date.UTC(y, m - 1, d));
  const weekend = weekday >= 5;
  const monday = new Date(local);
  monday.setUTCDate(local.getUTCDate() - weekday + (weekend ? 7 : 0));
  const dates = {} as Record<SchoolDay, string>;
  schoolDays.forEach((day, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    dates[day] = iso(date);
  });
  return { weekOf: iso(monday), today: weekend ? "monday" : schoolDays[weekday]!, dates };
}

// Home page sections that staff fill in maarifcms. Each list is empty until something is
// published; the site then hides the section.
// slug (wave 3): the article's address under /campus-life/news/; null for entries made before slugs.
export type NewsItem = { id: string; slug: string | null; kind: "news" | "event"; title: string; date: string; summary: string; image: { src: string; alt: string } | null };
export type FaqItem = { id: string; question: string; answer: string };
export type Testimonial = { id: string; quote: string; name: string; role: string; kind: "parent" | "student" | "alumni" };
export type GalleryImage = { id: string; src: string; alt: string; caption: string };

// The About pages' CMS parts (wave 1). The Cambridge centre number shows only once the school
// enters it (owner decision 2026-11-05); the leadership page waits for at least one person.
export type Person = { id: string; name: string; role: string; bio: string; photo: { src: string; alt: string } | null };
export type CambridgeCentre = { number: string; since: string | null };
export type AboutContent = { cambridgeCentre: CambridgeCentre | null; people: Person[] };

export type HomeContent = {
  headMessage: HeadMessage | null;
  menu: WeekMenu | null;
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  news: NewsItem[];
  faqs: FaqItem[];
};

// ---- Wave 3 (2026-11-09): every photo comes from maarifcms --------------------------------------
// `src` is maarif-api's /api/media/<file>; the site asks for sizes with ?w=480|960|1600&f=avif|webp
// (Cloudflare Images, ADR 008). `focus` is where the subject is, in % from the left and top.
export type SitePhoto = { src: string; alt: string; width: number | null; height: number | null; focus: readonly [number, number] };

export const mediaWidths = [480, 960, 1600] as const;
export type MediaWidth = (typeof mediaWidths)[number];
export const mediaFormats = ["avif", "webp", "jpeg"] as const;
export type MediaFormat = (typeof mediaFormats)[number];

/** Which photos a page shows: the header and named places inside the page. */
export type PageVisual = { header: SitePhoto | null; slots: Record<string, SitePhoto> };
export type PageVisuals = Record<string, PageVisual>;

/**
 * Home first screen (wave 5). `trailer`: the silent loop behind the headline (null: the site keeps
 * its built-in loop). `film`: the full film with sound behind "Watch the film" (`small` for phones;
 * null: no button). `transcript`: what is said in the film, in the requested language ("" if none).
 */
export type HomeHero = {
  trailer: { landscape: string; portrait: string; posterLandscape: SitePhoto; posterPortrait: SitePhoto } | null;
  film: { src: string; small: string; poster: SitePhoto | null } | null;
  transcript: string;
};

export type NewsSummary = { slug: string; kind: "news" | "event"; title: string; date: string; summary: string; image: SitePhoto | null; stages: string[] };
export type NewsArticle = NewsSummary & {
  body: RichBlock[];
  photos: { photo: SitePhoto; caption: string }[];
  event: { startsAt: string | null; endsAt: string | null; place: string; registration: string } | null;
  seo: { title: string; description: string };
};
export type NewsPage = { items: NewsSummary[]; page: number; pages: number };

export type AlbumSummary = { slug: string; title: string; date: string; summary: string; cover: SitePhoto; count: number };
export type Album = AlbumSummary & { photos: { photo: SitePhoto; caption: string }[]; video: { src: string; type: string } | null };

export type Club = { slug: string; name: string; summary: string; body: RichBlock[]; schedule: string; partner: string; stages: string[]; campus: string | null; photo: SitePhoto | null };
export type Trip = { slug: string; destination: string; place: string; summary: string; stages: string[]; lastVisit: string | null; photo: SitePhoto | null };

export type DocumentKind = "calendar" | "handbook" | "form" | "policy" | "other";
export type SchoolDocument = { id: string; kind: DocumentKind; title: string; summary: string; schoolYear: string; href: string; bytes: number | null; validUntil: string | null };

export type JobSummary = { slug: string; title: string; summary: string; campus: string | null; contract: string | null; closesOn: string | null };
export type Job = JobSummary & { body: RichBlock[]; startsOn: string | null };

export type TimetableRow = { stage: string; campus: string | null; days: string; start: string; end: string; note: string };
export type Timetable = { schoolYear: string; rows: TimetableRow[] };

export type CmsPage = { slug: string; title: string; body: RichBlock[]; updatedAt: string; seo: { title: string; description: string } };

/** Slugs the site pre-renders (news, albums, jobs) and the redirects staff set in maarifcms. */
export type SiteIndex = { news: string[]; albums: string[]; jobs: string[]; redirects: { from: string; to: string; permanent: boolean }[] };
