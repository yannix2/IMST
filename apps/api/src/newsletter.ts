import type { Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { isLocale, newsletterSignupSchema, type FormResult } from "@maarif/contracts";
import type { Env } from "./env";
import { cmsFetch } from "./cms-fetch";
import { verifyTurnstile } from "./turnstile";

// Newsletter routes (wave 4, B4). The public half of the double opt-in; maarifcms holds the
// subscribers and sends the emails (apps/cms/src/collections/Subscribers.ts).
//   POST /api/forms/newsletter          footer form: rate limit, honeypot, fields, Turnstile, then
//                                       maarifcms creates a pending subscriber and emails the link
//   GET  /api/newsletter/confirm?t=     the link in that email: confirms, then sends the visitor
//                                       to /{locale}/newsletter/confirmed
//   POST /api/newsletter/unsubscribe    one click: the mail client's List-Unsubscribe-Post (token in
//                                       the query) or the unsubscribe page's button (token in the body)
//   GET  /api/newsletter/unsubscribe?t= never unsubscribes by itself (link scanners open links):
//                                       it leads to the page with the button
// Answers never say whether an address was known.

type App = Hono<{ Bindings: Env }>;
const TOKEN = /^\d{1,12}\.[A-Za-z0-9_-]{32}$/;
const NO_STORE = { "cache-control": "no-store" };

async function gateway(env: Env, path: string, body: unknown): Promise<{ ok: boolean; locale?: string; status: number }> {
  try {
    const response = await cmsFetch(env, path, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `api-clients API-Key ${env.CMS_API_KEY}` },
      body: JSON.stringify(body),
    });
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; locale?: string };
    return { ok: response.ok && data.ok === true, locale: data.locale, status: response.status };
  } catch {
    return { ok: false, status: 503 };
  }
}

const localeOr = (value: unknown) => (typeof value === "string" && isLocale(value) ? value : "en");

async function tokenFrom(c: Context<{ Bindings: Env }>): Promise<string> {
  const fromQuery = c.req.query("t");
  if (fromQuery) return fromQuery;
  const type = c.req.header("content-type") ?? "";
  try {
    if (type.includes("application/json")) return String(((await c.req.json()) as { t?: unknown }).t ?? "");
    if (type.includes("form")) return String((await c.req.parseBody()).t ?? "");
  } catch {}
  return "";
}

export function newsletterRoutes(app: App) {
  app.post(
    "/api/forms/newsletter",
    bodyLimit({ maxSize: 4 * 1024, onError: (c) => c.json<FormResult>({ ok: false, error: "invalid", fields: { form: "too_large" } }, 413) }),
    async (c) => {
      const ip = c.req.header("cf-connecting-ip") ?? "unknown";
      const { success } = await c.env.FORM_LIMITER.limit({ key: `newsletter:${ip}` });
      if (!success) return c.json<FormResult>({ ok: false, error: "rate_limited" }, 429);
      let raw: unknown;
      try {
        raw = await c.req.json();
      } catch {
        return c.json<FormResult>({ ok: false, error: "invalid", fields: { form: "invalid_json" } }, 400);
      }
      const honeypot = (raw as { website?: unknown } | null)?.website;
      if (typeof honeypot === "string" && honeypot.length > 0) return c.json<FormResult>({ ok: true, reference: "newsletter" }, 201);
      const parsed = newsletterSignupSchema.safeParse(raw);
      if (!parsed.success) {
        const fields: Record<string, string> = {};
        for (const issue of parsed.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
        return c.json<FormResult>({ ok: false, error: "invalid", fields }, 422);
      }
      if (!(await verifyTurnstile(parsed.data.turnstileToken, c.env.TURNSTILE_SECRET, ip, c.env.SITE_URL))) return c.json<FormResult>({ ok: false, error: "captcha" }, 403);
      const result = await gateway(c.env, "/cms-api/subscribers/subscribe", { email: parsed.data.email, locale: parsed.data.locale });
      if (!result.ok) return c.json<FormResult>({ ok: false, error: "unavailable" }, 503);
      return c.json<FormResult>({ ok: true, reference: "newsletter" }, 201);
    },
  );

  app.get("/api/newsletter/confirm", async (c) => {
    const t = c.req.query("t") ?? "";
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const { success } = await c.env.FORM_LIMITER.limit({ key: `newsletter-link:${ip}` });
    if (!success || !TOKEN.test(t)) return c.redirect("/en/newsletter/confirmed?status=invalid", 303);
    const result = await gateway(c.env, "/cms-api/subscribers/confirm", { t });
    const status = result.ok ? "" : result.status >= 500 ? "?status=error" : "?status=invalid";
    return c.redirect(`/${localeOr(result.locale)}/newsletter/confirmed${status}`, 303);
  });

  app.get("/api/newsletter/unsubscribe", (c) => {
    const t = c.req.query("t") ?? "";
    return c.redirect(`/en/newsletter/unsubscribe${TOKEN.test(t) ? `?t=${t}` : ""}`, 303);
  });

  app.post("/api/newsletter/unsubscribe", async (c) => {
    const t = await tokenFrom(c);
    if (!TOKEN.test(t)) return c.json({ ok: false, error: "invalid" }, 400, NO_STORE);
    const result = await gateway(c.env, "/cms-api/subscribers/unsubscribe", { t });
    if (result.ok) return c.json({ ok: true, locale: localeOr(result.locale) }, 200, NO_STORE);
    return c.json({ ok: false, error: result.status >= 500 ? "unavailable" : "invalid" }, result.status >= 500 ? 503 : 400, NO_STORE);
  });
}
