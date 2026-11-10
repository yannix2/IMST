import {
  type Album,
  type AlbumSummary,
  type Club,
  type CmsPage,
  type DocumentKind,
  type HomeHero,
  type Job,
  type JobSummary,
  type Locale,
  type NewsArticle,
  type NewsPage,
  type NewsSummary,
  type PageVisuals,
  type SchoolDocument,
  type SiteIndex,
  type SitePhoto,
  type Timetable,
  type Trip,
  toRichBlocks,
} from "@maarif/contracts";
import { cmsGet, mediaPath, safeFilename } from "./content";
import type { Env } from "./env";

// Wave 3 readers (2026-11-09). Same rules as the Home readers: published documents only (the
// gateway's read rule), in the requested language only, and since wave 3 only language versions
// marked Ready or Proofread in maarifcms (translationStatus). A photo whose consent is pending
// comes back from maarifcms as a bare id and is left out.

type CmsMedia = { filename?: string; alt?: string | null; width?: number | null; height?: number | null; mimeType?: string | null; filesize?: number | null; focus?: { x?: number | null; y?: number | null } | null };
type Rel = CmsMedia | number | string | null | undefined;
type List<T> = { docs?: T[]; page?: number; totalPages?: number };

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const day = (value: unknown) => (typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
const pct = (v: number | null | undefined) => (typeof v === "number" && v >= 0 && v <= 100 ? v : 50);

export function photo(value: Rel): SitePhoto | null {
  if (!value || typeof value !== "object" || !value.filename || !safeFilename(value.filename)) return null;
  if (value.mimeType && !value.mimeType.startsWith("image/")) return null;
  return {
    src: mediaPath(value.filename),
    alt: text(value.alt),
    width: typeof value.width === "number" ? value.width : null,
    height: typeof value.height === "number" ? value.height : null,
    focus: [pct(value.focus?.x), pct(value.focus?.y)],
  };
}

const fileOf = (value: Rel) => (value && typeof value === "object" && value.filename && safeFilename(value.filename) ? value : null);

function photos(list: unknown): { photo: SitePhoto; caption: string }[] {
  return (Array.isArray(list) ? list : []).flatMap((row: { image?: Rel; caption?: unknown }) => {
    const p = photo(row?.image);
    return p ? [{ photo: p, caption: text(row.caption) }] : [];
  });
}

// Published, in this language, translation at least Ready.
function query(locale: Locale, extra: Record<string, string> = {}) {
  return new URLSearchParams({ locale, "fallback-locale": "none", depth: "1", "where[translationStatus][not_equals]": "draft", ...extra });
}

// ---- Page photos and the Home film ---------------------------------------------------------

export async function readPageVisuals(env: Env, locale: Locale): Promise<PageVisuals> {
  const q = new URLSearchParams({ locale, "fallback-locale": "none", depth: "1", limit: "100" });
  const result = await cmsGet<List<{ page?: string; header?: Rel; slots?: { slot?: string; image?: Rel }[] }>>(env, `/cms-api/page-visuals?${q}`);
  const out: PageVisuals = {};
  for (const doc of result?.docs ?? []) {
    if (!doc.page) continue;
    const slots: Record<string, SitePhoto> = {};
    for (const s of doc.slots ?? []) {
      const p = photo(s.image);
      if (s.slot && p) slots[s.slot] = p;
    }
    out[doc.page] = { header: photo(doc.header), slots };
  }
  return out;
}

// Wave 5: the loop (trailer) and the full film are independent; each needs all of its own files.
// A video counts only if maarifcms says it is a video (a file whose consent is pending comes back
// as a bare id and is left out by fileOf).
const videoOf = (value: Rel) => {
  const file = fileOf(value);
  return file && (!file.mimeType || file.mimeType.startsWith("video/")) ? mediaPath(file.filename!) : null;
};

export async function readHomeHero(env: Env, locale: Locale): Promise<HomeHero | null> {
  const doc = await cmsGet<{
    published?: boolean;
    filmLandscape?: Rel;
    filmPortrait?: Rel;
    posterLandscape?: Rel;
    posterPortrait?: Rel;
    fullFilm?: Rel;
    fullFilmSmall?: Rel;
    fullFilmPoster?: Rel;
    transcript?: unknown;
  }>(env, `/cms-api/globals/home-hero?locale=${locale}&fallback-locale=none&depth=1`);
  if (!doc?.published) return null;
  const landscape = videoOf(doc.filmLandscape), portrait = videoOf(doc.filmPortrait);
  const posterLandscape = photo(doc.posterLandscape), posterPortrait = photo(doc.posterPortrait);
  const trailer = landscape && portrait && posterLandscape && posterPortrait ? { landscape, portrait, posterLandscape, posterPortrait } : null;
  const src = videoOf(doc.fullFilm), small = videoOf(doc.fullFilmSmall);
  const film = src && small ? { src, small, poster: photo(doc.fullFilmPoster) } : null;
  if (!trailer && !film) return null;
  return { trailer, film, transcript: text(doc.transcript) };
}

// ---- News and events -------------------------------------------------------------------------

type CmsNews = {
  slug?: string;
  kind?: string;
  title?: string;
  date?: string;
  summary?: string;
  image?: Rel;
  stages?: string[];
  body?: unknown;
  photos?: unknown;
  event?: { startsAt?: string | null; endsAt?: string | null; place?: string | null; registration?: string | null } | null;
  seo?: { title?: string | null; description?: string | null } | null;
};

function newsSummary(d: CmsNews): NewsSummary | null {
  if (!d.slug || !text(d.title) || !text(d.summary) || !day(d.date)) return null;
  return { slug: d.slug, kind: d.kind === "event" ? "event" : "news", title: text(d.title), date: day(d.date)!, summary: text(d.summary), image: photo(d.image), stages: strings(d.stages) };
}

export async function readNewsPage(env: Env, locale: Locale, opts: { kind?: "news" | "event"; page?: number; upcoming?: boolean } = {}): Promise<NewsPage> {
  const extra: Record<string, string> = { limit: "12", page: String(Math.max(1, Math.min(opts.page ?? 1, 50))), sort: opts.upcoming ? "date" : "-date" };
  if (opts.kind) extra["where[kind][equals]"] = opts.kind;
  if (opts.upcoming) extra["where[date][greater_than_equal]"] = new Date(Date.now() - 86_400_000).toISOString();
  const result = await cmsGet<List<CmsNews>>(env, `/cms-api/news?${query(locale, extra)}`);
  return {
    items: (result?.docs ?? []).flatMap((d) => newsSummary(d) ?? []),
    page: result?.page ?? 1,
    pages: result?.totalPages ?? 1,
  };
}

export async function readNewsArticle(env: Env, locale: Locale, slug: string): Promise<NewsArticle | null> {
  const result = await cmsGet<List<CmsNews>>(env, `/cms-api/news?${query(locale, { "where[slug][equals]": slug, limit: "1" })}`);
  const d = result?.docs?.[0];
  const summary = d && newsSummary(d);
  if (!d || !summary) return null;
  const e = d.event;
  return {
    ...summary,
    body: toRichBlocks(d.body),
    photos: photos(d.photos),
    event: summary.kind === "event" && e ? { startsAt: e.startsAt ?? null, endsAt: e.endsAt ?? null, place: text(e.place), registration: text(e.registration) } : null,
    seo: { title: text(d.seo?.title), description: text(d.seo?.description) },
  };
}

// ---- Albums, clubs, trips --------------------------------------------------------------------

type CmsAlbum = { slug?: string; title?: string; date?: string; summary?: string; cover?: Rel; photos?: unknown; video?: Rel };

function albumSummary(d: CmsAlbum): AlbumSummary | null {
  const cover = photo(d.cover);
  if (!d.slug || !text(d.title) || !day(d.date) || !cover) return null;
  return { slug: d.slug, title: text(d.title), date: day(d.date)!, summary: text(d.summary), cover, count: photos(d.photos).length };
}

export async function readAlbums(env: Env, locale: Locale): Promise<AlbumSummary[]> {
  const result = await cmsGet<List<CmsAlbum>>(env, `/cms-api/albums?${query(locale, { limit: "60", sort: "-date" })}`);
  return (result?.docs ?? []).flatMap((d) => albumSummary(d) ?? []);
}

export async function readAlbum(env: Env, locale: Locale, slug: string): Promise<Album | null> {
  const result = await cmsGet<List<CmsAlbum>>(env, `/cms-api/albums?${query(locale, { "where[slug][equals]": slug, limit: "1" })}`);
  const d = result?.docs?.[0];
  const summary = d && albumSummary(d);
  if (!d || !summary) return null;
  const v = fileOf(d.video);
  return { ...summary, photos: photos(d.photos), video: v && v.mimeType?.startsWith("video/") ? { src: mediaPath(v.filename!), type: v.mimeType } : null };
}

export async function readClubs(env: Env, locale: Locale): Promise<Club[]> {
  const result = await cmsGet<List<{ slug?: string; name?: string; summary?: string; description?: unknown; schedule?: string; partner?: string; stages?: string[]; campus?: string | null; photo?: Rel }>>(
    env,
    `/cms-api/clubs?${query(locale, { limit: "50", sort: "order" })}`,
  );
  return (result?.docs ?? []).flatMap((d) =>
    d.slug && text(d.name) && text(d.summary)
      ? [{ slug: d.slug, name: text(d.name), summary: text(d.summary), body: toRichBlocks(d.description), schedule: text(d.schedule), partner: text(d.partner), stages: strings(d.stages), campus: d.campus ?? null, photo: photo(d.photo) }]
      : [],
  );
}

export async function readTrips(env: Env, locale: Locale): Promise<Trip[]> {
  const result = await cmsGet<List<{ slug?: string; destination?: string; place?: string; summary?: string; stages?: string[]; lastVisit?: string | null; photo?: Rel }>>(
    env,
    `/cms-api/trips?${query(locale, { limit: "50", sort: "order" })}`,
  );
  return (result?.docs ?? []).flatMap((d) =>
    d.slug && text(d.destination) && text(d.summary)
      ? [{ slug: d.slug, destination: text(d.destination), place: text(d.place), summary: text(d.summary), stages: strings(d.stages), lastVisit: day(d.lastVisit), photo: photo(d.photo) }]
      : [],
  );
}

// ---- Parents: documents and day times ------------------------------------------------------

const documentKinds: DocumentKind[] = ["calendar", "handbook", "form", "policy", "other"];

export async function readDocuments(env: Env, locale: Locale, kind?: DocumentKind): Promise<SchoolDocument[]> {
  const extra: Record<string, string> = { limit: "50", sort: "-validFrom" };
  if (kind) extra["where[kind][equals]"] = kind;
  const result = await cmsGet<List<{ id: string | number; kind?: string; title?: string; summary?: string; schoolYear?: string; file?: Rel; validUntil?: string | null }>>(
    env,
    `/cms-api/documents?${query(locale, extra)}`,
  );
  const today = new Date().toISOString().slice(0, 10);
  return (result?.docs ?? []).flatMap((d) => {
    const f = fileOf(d.file);
    const until = day(d.validUntil);
    if (!f || f.mimeType !== "application/pdf" || !text(d.title) || (until && until < today)) return [];
    return [{
      id: String(d.id),
      kind: documentKinds.includes(d.kind as DocumentKind) ? (d.kind as DocumentKind) : "other",
      title: text(d.title),
      summary: text(d.summary),
      schoolYear: text(d.schoolYear),
      href: mediaPath(f.filename!),
      bytes: typeof f.filesize === "number" ? f.filesize : null,
      validUntil: until,
    }];
  });
}

export async function readTimetable(env: Env, locale: Locale): Promise<Timetable | null> {
  const doc = await cmsGet<{ published?: boolean; schoolYear?: string; rows?: { stage?: string; campus?: string | null; days?: string; start?: string; end?: string; note?: string }[] }>(
    env,
    `/cms-api/globals/timetables?locale=${locale}&fallback-locale=none&depth=0`,
  );
  if (!doc?.published) return null;
  const rows = (doc.rows ?? []).flatMap((r) =>
    r.stage && text(r.days) && /^\d\d:\d\d$/.test(r.start ?? "") && /^\d\d:\d\d$/.test(r.end ?? "")
      ? [{ stage: r.stage, campus: r.campus ?? null, days: text(r.days), start: r.start!, end: r.end!, note: text(r.note) }]
      : [],
  );
  return rows.length ? { schoolYear: text(doc.schoolYear), rows } : null;
}

// ---- Careers -----------------------------------------------------------------------------------

type CmsJob = { slug?: string; title?: string; summary?: string; description?: unknown; campus?: string | null; contract?: string | null; startsOn?: string | null; closesOn?: string | null };

function jobSummary(d: CmsJob): JobSummary | null {
  const closes = day(d.closesOn);
  if (!d.slug || !text(d.title) || !text(d.summary)) return null;
  if (closes && closes < new Date().toISOString().slice(0, 10)) return null; // closed openings disappear
  return { slug: d.slug, title: text(d.title), summary: text(d.summary), campus: d.campus ?? null, contract: d.contract ?? null, closesOn: closes };
}

export async function readJobs(env: Env, locale: Locale): Promise<JobSummary[]> {
  const result = await cmsGet<List<CmsJob>>(env, `/cms-api/jobs?${query(locale, { limit: "30", sort: "-createdAt" })}`);
  return (result?.docs ?? []).flatMap((d) => jobSummary(d) ?? []);
}

export async function readJob(env: Env, locale: Locale, slug: string): Promise<Job | null> {
  const result = await cmsGet<List<CmsJob>>(env, `/cms-api/jobs?${query(locale, { "where[slug][equals]": slug, limit: "1" })}`);
  const d = result?.docs?.[0];
  const summary = d && jobSummary(d);
  return d && summary ? { ...summary, body: toRichBlocks(d.description), startsOn: day(d.startsOn) } : null;
}

/** The id of an open job, for linking an application; null when closed or unknown. */
export async function openJobId(env: Env, slug: string): Promise<string | null> {
  const q = new URLSearchParams({ "where[slug][equals]": slug, limit: "1", depth: "0" });
  const result = await cmsGet<List<{ id: string | number; closesOn?: string | null }>>(env, `/cms-api/jobs?${q}`);
  const d = result?.docs?.[0];
  if (!d) return null;
  const closes = day(d.closesOn);
  return closes && closes < new Date().toISOString().slice(0, 10) ? null : String(d.id);
}

// ---- Free pages (legal) ------------------------------------------------------------------------

export async function readCmsPage(env: Env, locale: Locale, slug: string): Promise<CmsPage | null> {
  const result = await cmsGet<List<{ slug?: string; title?: string; body?: unknown; updatedAt?: string; seo?: { title?: string | null; description?: string | null } }>>(
    env,
    `/cms-api/pages?${query(locale, { "where[slug][equals]": slug, limit: "1" })}`,
  );
  const d = result?.docs?.[0];
  if (!d || !text(d.title)) return null;
  const body = toRichBlocks(d.body);
  if (!body.length) return null;
  return { slug, title: text(d.title), body, updatedAt: day(d.updatedAt) ?? "", seo: { title: text(d.seo?.title), description: text(d.seo?.description) } };
}

// ---- What the site pre-renders, and the redirects ---------------------------------------------

export async function readSiteIndex(env: Env): Promise<SiteIndex> {
  const slugs = async (collection: string) => {
    const q = new URLSearchParams({ limit: "500", depth: "0", "select[slug]": "true" });
    const result = await cmsGet<List<{ slug?: string }>>(env, `/cms-api/${collection}?${q}`);
    return (result?.docs ?? []).flatMap((d) => (d.slug && /^[a-z0-9-]+$/.test(d.slug) ? [d.slug] : []));
  };
  const [news, albums, jobs, redirects] = await Promise.all([
    slugs("news"),
    slugs("albums"),
    slugs("jobs"),
    cmsGet<List<{ from?: string; to?: string; permanent?: boolean }>>(env, "/cms-api/redirects?limit=500&depth=0"),
  ]);
  return {
    news,
    albums,
    jobs,
    redirects: (redirects?.docs ?? []).flatMap((r) => (r.from && r.to ? [{ from: r.from, to: r.to, permanent: r.permanent !== false }] : [])),
  };
}

// Public settings the site needs in the browser (wave 3, D5): only the Google Analytics 4
// measurement ID staff enter in Site settings. Never contacts or recipients.
export async function readSiteConfig(env: Env): Promise<{ gaMeasurementId: string | null }> {
  const doc = await cmsGet<{ gaMeasurementId?: string | null }>(env, `/cms-api/globals/site-settings?depth=0`);
  const id = text(doc?.gaMeasurementId).toUpperCase();
  return { gaMeasurementId: /^G-[A-Z0-9]{4,12}$/.test(id) ? id : null };
}
