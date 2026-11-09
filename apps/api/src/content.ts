import {
  type AboutContent,
  type CambridgeCentre,
  courses,
  isLocale,
  type FaqItem,
  type GalleryImage,
  type HomeContent,
  type NewsItem,
  type Person,
  type Testimonial,
  schoolDays,
  schoolWeek,
  type Course,
  type HeadMessage,
  type Locale,
  type SchoolDay,
  type WeekMenu,
} from "@maarif/contracts";
import type { Env } from "./env";
import { cmsFetch } from "./cms-fetch";

// Public content, read from maarifcms over the service binding with the gateway's API key
// (read rights on published content only). Every reader returns null when there is nothing
// to show, so the route answers 404 and the site keeps the section hidden.

// Menus are often typed in one language only; French is the school's working language.
const MENU_FALLBACK: Locale = "fr";

export async function cmsGet<T>(env: Env, path: string): Promise<T | null> {
  try {
    const response = await cmsFetch(env, path, {
      headers: { accept: "application/json", authorization: `api-clients API-Key ${env.CMS_API_KEY}` },
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

// Files are served by maarif-api's own /api/media route, never from maarifcms directly.
export const mediaPath = (filename: string) => `/api/media/${encodeURIComponent(filename)}`;
export const safeFilename = (value: string) => /^[\w][\w.\-]{0,180}$/.test(value);

type CmsMenu = {
  docs?: { weekOf?: string; days?: { day?: string; dishes?: { course?: string; dish?: string | null }[] }[] }[];
};

export async function readWeekMenu(env: Env, locale: Locale, now = new Date()): Promise<WeekMenu | null> {
  const week = schoolWeek(now);
  // The admin's date picker stores the Monday as local midnight in UTC; accept ±12 hours.
  const monday = Date.parse(`${week.weekOf}T00:00:00Z`);
  const from = new Date(monday - 12 * 3600_000).toISOString();
  const to = new Date(monday + 12 * 3600_000).toISOString();
  const query = new URLSearchParams({
    "where[weekOf][greater_than_equal]": from,
    "where[weekOf][less_than]": to,
    locale,
    "fallback-locale": MENU_FALLBACK,
    limit: "1",
    depth: "0",
  });
  const result = await cmsGet<CmsMenu>(env, `/cms-api/weekly-menus?${query}`);
  const doc = result?.docs?.[0];
  if (!doc) return null;

  const days = schoolDays.flatMap((day) => {
    const entry = doc.days?.find((d) => d.day === day);
    const dishes = (entry?.dishes ?? [])
      .filter((d): d is { course: Course; dish: string } => courses.includes(d.course as Course) && Boolean(d.dish?.trim()))
      .map((d) => ({ course: d.course, dish: d.dish.trim() }))
      .sort((a, b) => courses.indexOf(a.course) - courses.indexOf(b.course));
    return dishes.length ? [{ day, date: week.dates[day], dishes }] : [];
  });
  if (!days.length) return null;
  const today: SchoolDay = days.some((d) => d.day === week.today) ? week.today : days[0]!.day;
  return { weekOf: week.weekOf, today, days };
}

type CmsFile = { filename?: string; mimeType?: string } | number | null | undefined;
type CmsHeadMessage = {
  published?: boolean;
  name?: string;
  role?: string | null;
  message?: string | null;
  video?: CmsFile;
  poster?: CmsFile;
  captions?: CmsFile;
};

const file = (value: CmsFile) =>
  value && typeof value === "object" && value.filename && safeFilename(value.filename) ? value : null;

export async function readHeadMessage(env: Env, locale: Locale): Promise<HeadMessage | null> {
  // No fallback language: the head's words are shown only in a language someone wrote them in.
  const doc = await cmsGet<CmsHeadMessage>(env, `/cms-api/globals/head-message?locale=${locale}&fallback-locale=none&depth=1`);
  if (!doc?.published || !doc.name || !doc.role || !doc.message) return null;
  const video = file(doc.video), poster = file(doc.poster), captions = file(doc.captions);
  return {
    name: doc.name,
    role: doc.role,
    message: doc.message,
    video: video ? { src: mediaPath(video.filename!), type: video.mimeType ?? "video/mp4" } : null,
    poster: poster ? mediaPath(poster.filename!) : null,
    captions: captions ? { src: mediaPath(captions.filename!), lang: locale } : null,
  };
}

// Streams a file from maarifcms, Range requests included (video seeking). maarifcms applies
// the media access rule (consent status), so a file not cleared for publication is a 404.
export async function proxyMedia(env: Env, filename: string, range: string | undefined): Promise<Response> {
  const headers: Record<string, string> = { authorization: `api-clients API-Key ${env.CMS_API_KEY}` };
  if (range) headers.range = range;
  let upstream: Response;
  try {
    upstream = await cmsFetch(env, `/cms-api/media/file/${encodeURIComponent(filename)}`, { headers });
  } catch {
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
  if (upstream.status !== 200 && upstream.status !== 206) {
    return Response.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const out = new Headers();
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  out.set("cache-control", "public, max-age=86400");
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

// Resized images (wave 3, ADR 008): ?w=480|960|1600&f=avif|webp|jpeg on an image goes through
// the Cloudflare Images binding; the result is kept in the edge cache for a year (file names are
// unique per upload, so a replaced photo gets a new address). Anything else (video, PDF, no size
// asked, transformation unavailable) is the original file, as before.
const widths = new Set([480, 960, 1600]);
const formats = { avif: "image/avif", webp: "image/webp", jpeg: "image/jpeg" } as const;

export async function serveMedia(
  env: Env,
  request: Request,
  filename: string,
  options: { width?: string; format?: string; range?: string },
  waitUntil: (p: Promise<unknown>) => void = () => {},
): Promise<Response> {
  const width = Number(options.width);
  const format = options.format && options.format in formats ? (options.format as keyof typeof formats) : "webp";
  if (!widths.has(width) || !env.IMAGES) return proxyMedia(env, filename, options.range);

  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const key = new Request(new URL(`/api/media/${encodeURIComponent(filename)}?w=${width}&f=${format}`, request.url).toString());
  const hit = await cache?.match(key);
  // A cached response's headers are immutable; copy it so the security headers can be added.
  if (hit) return new Response(hit.body, hit);

  const original = await proxyMedia(env, filename, undefined);
  const type = original.headers.get("content-type") ?? "";
  if (!original.ok || !original.body || !type.startsWith("image/") || type === "image/svg+xml") return original;
  try {
    const result = await env.IMAGES.input(original.body)
      .transform({ width, fit: "scale-down" })
      .output({ format: formats[format], quality: format === "avif" ? 55 : 76 });
    // Read the resized image once (a few dozen KB), then serve one copy and cache another: a
    // cloned stream can arrive broken in the cache.
    const bytes = await result.response().arrayBuffer();
    const headers = { "content-type": formats[format], "cache-control": "public, max-age=31536000, immutable", vary: "accept" };
    if (cache) waitUntil(cache.put(key, new Response(bytes, { headers })));
    return new Response(bytes, { headers });
  } catch {
    // Transformation failed (for example the free monthly quota is used up): serve the original.
    return proxyMedia(env, filename, undefined);
  }
}

export function localeParam(value: string | undefined): Locale | null {
  return value && isLocale(value) ? value : null;
}

// ---- Home page lists: news, questions, testimonials, gallery -------------------------------
// Published documents only (the gateway's read rule), in the requested language only: an item
// without text in that language is left out rather than shown in another.

type CmsList<T> = { docs?: T[] };
type CmsUpload = { filename?: string; alt?: string | null } | number | null | undefined;
const upload = (value: CmsUpload) =>
  value && typeof value === "object" && value.filename && safeFilename(value.filename) ? { src: mediaPath(value.filename), alt: value.alt ?? "" } : null;
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function readNews(env: Env, locale: Locale): Promise<NewsItem[]> {
  const q = new URLSearchParams({ locale, "fallback-locale": "none", limit: "3", depth: "1", sort: "-date" });
  const result = await cmsGet<CmsList<{ id: string | number; slug?: string; kind?: string; title?: string; date?: string; summary?: string; image?: CmsUpload }>>(env, `/cms-api/news?${q}`);
  return (result?.docs ?? []).flatMap((d) =>
    text(d.title) && text(d.summary) && d.date
      ? [{ id: String(d.id), slug: d.slug && /^[a-z0-9-]+$/.test(d.slug) ? d.slug : null, kind: d.kind === "event" ? "event" : "news", title: text(d.title), date: d.date.slice(0, 10), summary: text(d.summary), image: upload(d.image) } as NewsItem]
      : [],
  );
}

export async function readFaqs(env: Env, locale: Locale): Promise<FaqItem[]> {
  const q = new URLSearchParams({ locale, "fallback-locale": "none", limit: "12", depth: "0", sort: "order" });
  const result = await cmsGet<CmsList<{ id: string | number; question?: string; answer?: string }>>(env, `/cms-api/faqs?${q}`);
  return (result?.docs ?? []).flatMap((d) => (text(d.question) && text(d.answer) ? [{ id: String(d.id), question: text(d.question), answer: text(d.answer) }] : []));
}

export async function readTestimonials(env: Env, locale: Locale): Promise<Testimonial[]> {
  const q = new URLSearchParams({ locale, "fallback-locale": "none", limit: "12", depth: "0", "where[permission][equals]": "true" });
  const result = await cmsGet<CmsList<{ id: string | number; kind?: string; name?: string; role?: string; quote?: string }>>(env, `/cms-api/testimonials?${q}`);
  return (result?.docs ?? []).flatMap((d) =>
    text(d.quote) && text(d.name)
      ? [{ id: String(d.id), quote: text(d.quote), name: text(d.name), role: text(d.role), kind: d.kind === "student" || d.kind === "alumni" ? d.kind : "parent" } as Testimonial]
      : [],
  );
}

export async function readGallery(env: Env, locale: Locale): Promise<GalleryImage[]> {
  const doc = await cmsGet<{ published?: boolean; photos?: { id?: string; image?: CmsUpload; caption?: string }[] }>(
    env,
    `/cms-api/globals/gallery?locale=${locale}&fallback-locale=none&depth=1`,
  );
  if (!doc?.published) return [];
  // An image the gateway may not read (consent pending) comes back as a bare id: left out.
  return (doc.photos ?? []).flatMap((p, i) => {
    const file = upload(p.image);
    return file ? [{ id: p.id ?? String(i), src: file.src, alt: file.alt, caption: text(p.caption) }] : [];
  });
}

export async function readHome(env: Env, locale: Locale): Promise<HomeContent> {
  const [headMessage, menu, gallery, testimonials, news, faqs] = await Promise.all([
    readHeadMessage(env, locale),
    readWeekMenu(env, locale),
    readGallery(env, locale),
    readTestimonials(env, locale),
    readNews(env, locale),
    readFaqs(env, locale),
  ]);
  return { headMessage, menu, gallery, testimonials, news, faqs };
}

// ---- About pages: the Cambridge centre number and the leadership team (wave 1) ---------------

export async function readCambridgeCentre(env: Env): Promise<CambridgeCentre | null> {
  const doc = await cmsGet<{ published?: boolean; cambridgeCentreNumber?: string | null; cambridgeSince?: string | null }>(
    env,
    "/cms-api/globals/school-facts?depth=0",
  );
  const number = text(doc?.cambridgeCentreNumber);
  if (!doc?.published || !number) return null;
  const since = text(doc.cambridgeSince);
  return { number, since: /^\d{4}$/.test(since) ? since : null };
}

export async function readPeople(env: Env, locale: Locale): Promise<Person[]> {
  const q = new URLSearchParams({ locale, "fallback-locale": "none", limit: "24", depth: "1", sort: "order" });
  const result = await cmsGet<CmsList<{ id: string | number; name?: string; role?: string; bio?: string; photo?: CmsUpload; photoConsent?: boolean }>>(
    env,
    `/cms-api/people?${q}`,
  );
  // A photo shows only with the person's written agreement (the CMS box), and only if the
  // gateway may read the file.
  return (result?.docs ?? []).flatMap((d) =>
    text(d.name) && text(d.role)
      ? [{ id: String(d.id), name: text(d.name), role: text(d.role), bio: text(d.bio), photo: d.photoConsent ? upload(d.photo) : null }]
      : [],
  );
}

export async function readAbout(env: Env, locale: Locale): Promise<AboutContent> {
  const [cambridgeCentre, people] = await Promise.all([readCambridgeCentre(env), readPeople(env, locale)]);
  return { cambridgeCentre, people };
}