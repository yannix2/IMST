import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { applicationSchema, cvRules, formKinds, formSchemas, isLocale, type DocumentKind, type FormKind, type FormResult, type Locale } from "@maarif/contracts";
import type { z } from "zod";
import { createApplication, createInquiry } from "./cms";
import { localeParam, readAbout, readHeadMessage, readHome, readWeekMenu, safeFilename, serveMedia } from "./content";
import {
  openJobId,
  readAlbum,
  readAlbums,
  readClubs,
  readCmsPage,
  readDocuments,
  readHomeHero,
  readJob,
  readJobs,
  readNewsArticle,
  readNewsPage,
  readPageVisuals,
  readSiteIndex,
  readTimetable,
  readTrips,
} from "./content-wave3";
import type { Env } from "./env";
import { notifyStaff } from "./notify";
import { revalidate } from "./revalidate";
import { nightly } from "./scheduled";
import { verifyTurnstile } from "./turnstile";

const MAX_FORM_BYTES = 16 * 1024;
// The CV (at most 5 MB) plus the form fields and multipart framing.
const MAX_APPLICATION_BYTES = cvRules.maxBytes + 64 * 1024;
const DEFAULT_ADMIN_URL = "https://cms.yassinekhiari.download";

export const app = new Hono<{ Bindings: Env }>();

app.use("*", secureHeaders());

app.get("/api/health", (c) => c.json({ ok: true }));

function isFormKind(value: string): value is FormKind {
  return (formKinds as readonly string[]).includes(value);
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= issue.message;
  }
  return fields;
}

// Runs after the answer is sent when the platform allows it (Workers), inline otherwise (tests).
function later(c: Context<{ Bindings: Env }>, task: Promise<unknown>) {
  try {
    c.executionCtx.waitUntil(task);
  } catch {
    void task.catch(() => {});
  }
}

// ---- Job applications (wave 3): multipart, one PDF CV ---------------------------------------
// Registered before /api/forms/:kind so "application" never reaches the JSON forms.

app.post(
  "/api/forms/application",
  bodyLimit({
    maxSize: MAX_APPLICATION_BYTES,
    onError: (c) => c.json<FormResult>({ ok: false, error: "invalid", fields: { cv: "too_large" } }, 413),
  }),
  async (c) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const { success: withinLimit } = await c.env.FORM_LIMITER.limit({ key: `application:${ip}` });
    if (!withinLimit) return c.json<FormResult>({ ok: false, error: "rate_limited" }, 429);

    let body: Record<string, string | File>;
    try {
      body = (await c.req.parseBody()) as Record<string, string | File>;
    } catch {
      return c.json<FormResult>({ ok: false, error: "invalid", fields: { form: "invalid_form" } }, 400);
    }
    if (typeof body.website === "string" && body.website.length > 0) {
      return c.json<FormResult>({ ok: true, reference: crypto.randomUUID() }, 201);
    }

    const fields = Object.fromEntries(Object.entries(body).filter(([, v]) => typeof v === "string"));
    const parsed = applicationSchema.safeParse({ ...fields, privacyNoticeAccepted: fields.privacyNoticeAccepted === "true" });
    const cv = body.cv;
    const errors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!(cv instanceof File) || cv.size === 0) errors.cv = "cv_required";
    else if (cv.size > cvRules.maxBytes) errors.cv = "too_large";
    else if (cv.type !== cvRules.mimeType || !(await isPdf(cv))) errors.cv = "pdf_only";
    if (!parsed.success || Object.keys(errors).length) return c.json<FormResult>({ ok: false, error: "invalid", fields: errors }, 422);

    const human = await verifyTurnstile(parsed.data.turnstileToken, c.env.TURNSTILE_SECRET, ip);
    if (!human) return c.json<FormResult>({ ok: false, error: "captcha" }, 403);

    let jobId: string | null = null;
    if (parsed.data.job !== "open") {
      jobId = await openJobId(c.env, parsed.data.job);
      if (!jobId) return c.json<FormResult>({ ok: false, error: "invalid", fields: { job: "invalid_job" } }, 422);
    }

    const reference = await createApplication(c.env, parsed.data, jobId, cv as File);
    if (!reference) return c.json<FormResult>({ ok: false, error: "unavailable" }, 503);
    later(c, notifyStaff(c.env, "application", reference, c.env.ADMIN_URL ?? DEFAULT_ADMIN_URL));
    return c.json<FormResult>({ ok: true, reference }, 201);
  },
);

// A real PDF starts with "%PDF-"; the browser's type alone is not trusted.
async function isPdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...head) === "%PDF-";
}

app.post(
  "/api/forms/:kind",
  bodyLimit({
    maxSize: MAX_FORM_BYTES,
    onError: (c) => c.json<FormResult>({ ok: false, error: "invalid", fields: { form: "too_large" } }, 413),
  }),
  async (c) => {
    const kind = c.req.param("kind");
    if (!isFormKind(kind)) return c.notFound();

    // Order matters: cheapest checks first, the CMS last.
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const { success: withinLimit } = await c.env.FORM_LIMITER.limit({ key: `${kind}:${ip}` });
    if (!withinLimit) return c.json<FormResult>({ ok: false, error: "rate_limited" }, 429);

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json<FormResult>({ ok: false, error: "invalid", fields: { form: "invalid_json" } }, 400);
    }

    // A filled honeypot gets a normal-looking answer and is dropped, so bots learn nothing.
    const honeypot = (raw as { website?: unknown } | null)?.website;
    if (typeof honeypot === "string" && honeypot.length > 0) {
      return c.json<FormResult>({ ok: true, reference: crypto.randomUUID() }, 201);
    }

    const parsed = formSchemas[kind].safeParse(raw);
    if (!parsed.success) {
      return c.json<FormResult>({ ok: false, error: "invalid", fields: fieldErrors(parsed.error) }, 422);
    }

    const human = await verifyTurnstile(parsed.data.turnstileToken, c.env.TURNSTILE_SECRET, ip);
    if (!human) return c.json<FormResult>({ ok: false, error: "captcha" }, 403);

    const reference = await createInquiry(c.env, kind, parsed.data);
    if (!reference) return c.json<FormResult>({ ok: false, error: "unavailable" }, 503);

    later(c, notifyStaff(c.env, kind, reference, c.env.ADMIN_URL ?? DEFAULT_ADMIN_URL));
    return c.json<FormResult>({ ok: true, reference }, 201);
  },
);

// Public content. Short browser and edge caching: a change shows within five minutes even
// without the publish refresh (ADR 007), which normally makes it immediate.
const CONTENT_CACHE = "public, max-age=300, s-maxage=300";

app.get("/api/content/menu", async (c) => {
  const locale = localeParam(c.req.query("locale"));
  if (!locale) return c.json({ ok: false, error: "invalid" }, 400);
  const menu = await readWeekMenu(c.env, locale);
  c.header("cache-control", CONTENT_CACHE);
  return menu ? c.json(menu) : c.json({ ok: false, error: "not_found" }, 404);
});

app.get("/api/content/head-message", async (c) => {
  const locale = localeParam(c.req.query("locale"));
  if (!locale) return c.json({ ok: false, error: "invalid" }, 400);
  const message = await readHeadMessage(c.env, locale);
  c.header("cache-control", CONTENT_CACHE);
  return message ? c.json(message) : c.json({ ok: false, error: "not_found" }, 404);
});

// Everything the Home page fills from maarifcms, in one request (the sections the school has
// not published come back empty and stay hidden).
app.get("/api/content/home", async (c) => {
  const locale = localeParam(c.req.query("locale"));
  if (!locale) return c.json({ ok: false, error: "invalid" }, 400);
  c.header("cache-control", CONTENT_CACHE);
  return c.json(await readHome(c.env, locale));
});

// The About pages' CMS parts in one request: the Cambridge centre number and the people.
app.get("/api/content/about", async (c) => {
  const locale = localeParam(c.req.query("locale"));
  if (!locale) return c.json({ ok: false, error: "invalid" }, 400);
  c.header("cache-control", CONTENT_CACHE);
  return c.json(await readAbout(c.env, locale));
});

// ---- Wave 3 content -------------------------------------------------------------------------

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const documentKinds: readonly DocumentKind[] = ["calendar", "handbook", "form", "policy", "other"];

// Answers JSON for a locale-scoped reader; 404 when the reader finds nothing to show.
function content<T>(read: (env: Env, locale: Locale, c: Context<{ Bindings: Env }>) => Promise<T | null>) {
  return async (c: Context<{ Bindings: Env }>) => {
    const locale = c.req.query("locale");
    if (!locale || !isLocale(locale)) return c.json({ ok: false, error: "invalid" }, 400);
    const data = await read(c.env, locale, c);
    c.header("cache-control", CONTENT_CACHE);
    return data == null ? c.json({ ok: false, error: "not_found" }, 404) : c.json(data);
  };
}

const slugOf = (c: Context<{ Bindings: Env }>) => {
  const slug = c.req.param("slug") ?? "";
  return SLUG.test(slug) ? slug : null;
};

app.get("/api/content/visuals", content((env, locale) => readPageVisuals(env, locale)));
app.get("/api/content/home-hero", content((env, locale) => readHomeHero(env, locale)));
app.get(
  "/api/content/news",
  content((env, locale, c) => {
    const kind = c.req.query("kind");
    return readNewsPage(env, locale, {
      kind: kind === "news" || kind === "event" ? kind : undefined,
      page: Number(c.req.query("page") ?? "1") || 1,
      upcoming: c.req.query("upcoming") === "1",
    });
  }),
);
app.get("/api/content/news/:slug", content((env, locale, c) => (slugOf(c) ? readNewsArticle(env, locale, slugOf(c)!) : Promise.resolve(null))));
app.get("/api/content/albums", content((env, locale) => readAlbums(env, locale)));
app.get("/api/content/albums/:slug", content((env, locale, c) => (slugOf(c) ? readAlbum(env, locale, slugOf(c)!) : Promise.resolve(null))));
app.get("/api/content/clubs", content((env, locale) => readClubs(env, locale)));
app.get("/api/content/trips", content((env, locale) => readTrips(env, locale)));
app.get(
  "/api/content/documents",
  content((env, locale, c) => {
    const kind = c.req.query("kind") as DocumentKind | undefined;
    return readDocuments(env, locale, kind && documentKinds.includes(kind) ? kind : undefined);
  }),
);
app.get("/api/content/timetable", content((env, locale) => readTimetable(env, locale)));
app.get("/api/content/jobs", content((env, locale) => readJobs(env, locale)));
app.get("/api/content/jobs/:slug", content((env, locale, c) => (slugOf(c) ? readJob(env, locale, slugOf(c)!) : Promise.resolve(null))));
app.get("/api/content/pages/:slug", content((env, locale, c) => (slugOf(c) ? readCmsPage(env, locale, slugOf(c)!) : Promise.resolve(null))));

// What the site pre-renders (news, albums, jobs) and the redirects; read at build time.
app.get("/api/content/site-index", async (c) => {
  c.header("cache-control", CONTENT_CACHE);
  return c.json(await readSiteIndex(c.env));
});

app.get("/api/media/:filename", async (c) => {
  const filename = c.req.param("filename");
  if (!safeFilename(filename)) return c.notFound();
  let waitUntil: (p: Promise<unknown>) => void = () => {};
  try {
    const ctx = c.executionCtx;
    waitUntil = (p) => ctx.waitUntil(p);
  } catch {}
  return serveMedia(c.env, c.req.raw, filename, { width: c.req.query("w"), format: c.req.query("f"), range: c.req.header("range") }, waitUntil);
});

// ---- Refresh on publish (ADR 007): maarifcms hooks call this over the service binding ----------
app.post("/internal/revalidate", async (c) => {
  const secret = c.env.REVALIDATE_SECRET;
  if (!secret || c.req.header("x-revalidate-secret") !== secret) return c.json({ ok: false, error: "forbidden" }, 403);
  let body: { tags?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "invalid" }, 400);
  }
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && /^[a-z0-9:/_-]{1,80}$/.test(t)).slice(0, 50) : [];
  if (!tags.length) return c.json({ ok: false, error: "invalid" }, 400);
  const ok = await revalidate(c.env, tags);
  return c.json({ ok }, ok ? 200 : 502);
});

// Never echo internals; never log request bodies (they hold personal data).
app.onError((_error, c) => c.json({ ok: false, error: "unavailable" }, 500));
app.notFound((c) => c.json({ ok: false, error: "not_found" }, 404));

// Workers entry: HTTP requests, plus the nightly cron (wrangler.jsonc) for retention and backup.
export default {
  fetch: app.fetch,
  scheduled: (_event: ScheduledController, env: Env, ctx: ExecutionContext) => {
    ctx.waitUntil(nightly(env));
  },
};
