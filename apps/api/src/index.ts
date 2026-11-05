import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { formKinds, formSchemas, type FormKind, type FormResult } from "@maarif/contracts";
import type { z } from "zod";
import { createInquiry } from "./cms";
import { localeParam, proxyMedia, readHeadMessage, readAbout, readHome, readWeekMenu, safeFilename } from "./content";
import type { Env } from "./env";
import { verifyTurnstile } from "./turnstile";

const MAX_FORM_BYTES = 16 * 1024;

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

    return c.json<FormResult>({ ok: true, reference }, 201);
  },
);

// Public content for the Home page. Short browser and edge caching: a new menu or message
// shows within five minutes of publishing.
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

app.get("/api/media/:filename", async (c) => {
  const filename = c.req.param("filename");
  if (!safeFilename(filename)) return c.notFound();
  return proxyMedia(c.env, filename, c.req.header("range"));
});

// Never echo internals; never log request bodies (they hold personal data).
app.onError((_error, c) => c.json({ ok: false, error: "unavailable" }, 500));
app.notFound((c) => c.json({ ok: false, error: "not_found" }, 404));

export default app;
