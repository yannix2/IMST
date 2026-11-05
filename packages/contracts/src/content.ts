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
export type NewsItem = { id: string; kind: "news" | "event"; title: string; date: string; summary: string; image: { src: string; alt: string } | null };
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
