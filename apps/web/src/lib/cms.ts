import { getCloudflareContext } from "@opennextjs/cloudflare";
import { unstable_cache } from "next/cache";
import type { Locale } from "@maarif/contracts/locales";
import type {
  Album,
  AlbumSummary,
  Club,
  CmsPage,
  DocumentKind,
  HomeHero,
  Job,
  JobSummary,
  NewsArticle,
  NewsPage,
  PageVisual,
  PageVisuals,
  SchoolDocument,
  SiteIndex,
  Timetable,
  Trip,
} from "@maarif/contracts/content";

// Server-side reads of maarifcms content through maarif-api (wave 3, ADR 007). Pages render this
// content into their HTML and keep it under cache tags; when staff publish, maarif-api calls
// /revalidate with the tags and the affected pages refresh. Without a publish, everything also
// refreshes after five minutes.
//
// Where maarif-api is: API_ORIGIN when set (local development: the API's `wrangler dev`; CI
// builds), otherwise the API service binding (Cloudflare). A failed read returns null and is not
// cached, so a page falls back to its built-in content and tries again on the next refresh.

export const REFRESH_SECONDS = 300;

async function apiFetch(path: string): Promise<Response | null> {
  const origin = process.env.API_ORIGIN;
  try {
    if (origin) return await fetch(new URL(path, origin), { headers: { accept: "application/json" }, cache: "no-store" });
    // A build without API_ORIGIN has no API to read: pages start with their built-in content and
    // fill in on the first refresh (looking for the binding here would start a runtime per worker).
    if (process.env.NEXT_PHASE === "phase-production-build") return null;
    const { env } = await getCloudflareContext({ async: true });
    const api = (env as { API?: Fetcher }).API;
    return api ? await api.fetch(`https://maarif-api.internal${path}`, { headers: { accept: "application/json" } }) : null;
  } catch {
    return null;
  }
}

class Miss extends Error {}

// 404 = nothing published (a real, cacheable answer: null); other failures are retried.
async function read<T>(path: string): Promise<T | null> {
  const response = await apiFetch(path);
  if (!response) throw new Miss(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Miss(path);
  return (await response.json()) as T;
}

function cached<A extends unknown[], T>(key: string, tags: (...args: A) => string[], path: (...args: A) => string) {
  return async (...args: A): Promise<T | null> => {
    try {
      return await unstable_cache(() => read<T>(path(...args)), [key, ...args.map(String)], { tags: ["cms", ...tags(...args)], revalidate: REFRESH_SECONDS })();
    } catch {
      return null;
    }
  };
}

const q = (locale: Locale, extra: Record<string, string> = {}) => `?${new URLSearchParams({ locale, ...extra })}`;

export const getVisuals = cached<[Locale], PageVisuals>("visuals", () => ["visuals"], (l) => `/api/content/visuals${q(l)}`);
export const getHomeHero = cached<[Locale], HomeHero>("home-hero", () => ["home-hero"], (l) => `/api/content/home-hero${q(l)}`);
export const getNewsPage = cached<[Locale, "news" | "event" | "all", number, boolean], NewsPage>(
  "news-page",
  () => ["news"],
  (l, kind, page, upcoming) => `/api/content/news${q(l, { ...(kind === "all" ? {} : { kind }), page: String(page), ...(upcoming ? { upcoming: "1" } : {}) })}`,
);
export const getNewsArticle = cached<[Locale, string], NewsArticle>("news", (_l, slug) => ["news", `news:${slug}`], (l, slug) => `/api/content/news/${slug}${q(l)}`);
export const getAlbums = cached<[Locale], AlbumSummary[]>("albums", () => ["albums"], (l) => `/api/content/albums${q(l)}`);
export const getAlbum = cached<[Locale, string], Album>("album", (_l, slug) => ["albums", `albums:${slug}`], (l, slug) => `/api/content/albums/${slug}${q(l)}`);
export const getClubs = cached<[Locale], Club[]>("clubs", () => ["clubs"], (l) => `/api/content/clubs${q(l)}`);
export const getTrips = cached<[Locale], Trip[]>("trips", () => ["trips"], (l) => `/api/content/trips${q(l)}`);
export const getDocuments = cached<[Locale, DocumentKind | "all"], SchoolDocument[]>(
  "documents",
  () => ["documents"],
  (l, kind) => `/api/content/documents${q(l, kind === "all" ? {} : { kind })}`,
);
export const getTimetable = cached<[Locale], Timetable>("timetable", () => ["timetables"], (l) => `/api/content/timetable${q(l)}`);
export const getJobs = cached<[Locale], JobSummary[]>("jobs", () => ["jobs"], (l) => `/api/content/jobs${q(l)}`);
export const getJob = cached<[Locale, string], Job>("job", (_l, slug) => ["jobs", `jobs:${slug}`], (l, slug) => `/api/content/jobs/${slug}${q(l)}`);
export const getCmsPage = cached<[Locale, string], CmsPage>("page", (_l, slug) => ["pages", `pages:${slug}`], (l, slug) => `/api/content/pages/${slug}${q(l)}`);
export const getSiteIndex = cached<[], SiteIndex>("site-index", () => ["news", "albums", "jobs", "redirects"], () => "/api/content/site-index");

/** The page's photos (header + slots), or an empty set when none is published. */
export async function getPageVisual(locale: Locale, page: string): Promise<PageVisual> {
  const all = await getVisuals(locale);
  return all?.[page] ?? { header: null, slots: {} };
}
