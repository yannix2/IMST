import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { app } from "./index";
import type { Env } from "./env";

const token = `12.${"a".repeat(32)}`;

function envWith(handler: (path: string, body: Record<string, unknown>) => Response, extra: Partial<Env> = {}) {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => handler(new URL(url).pathname, init?.body ? JSON.parse(init.body as string) : {}));
  const limit = vi.fn(async () => ({ success: true }));
  return { env: { CMS: { fetch }, FORM_LIMITER: { limit }, CMS_API_KEY: "gateway-key", TURNSTILE_SECRET: "t", MAINTENANCE_SECRET: "m", ...extra } as unknown as Env, fetch, limit };
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => Response.json({ success: true }))));
afterEach(() => vi.unstubAllGlobals());

const signup = (env: Env, body: Record<string, unknown>) =>
  app.request("/api/forms/newsletter", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" }, body: JSON.stringify(body) }, env);
const valid = { locale: "fr", turnstileToken: "tok", privacyNoticeAccepted: true, email: "parent@example.com" };

describe("POST /api/forms/newsletter", () => {
  it("checks Turnstile then asks maarifcms to create the pending subscriber", async () => {
    const { env, fetch, limit } = envWith(() => Response.json({ ok: true }));
    const response = await signup(env, valid);
    expect(response.status).toBe(201);
    expect(limit).toHaveBeenCalledWith({ key: "newsletter:203.0.113.9" });
    const [url, init] = fetch.mock.calls[0]!;
    expect(new URL(url).pathname).toBe("/cms-api/subscribers/subscribe");
    expect((init!.headers as Record<string, string>).authorization).toBe("api-clients API-Key gateway-key");
    expect(JSON.parse(init!.body as string)).toEqual({ email: "parent@example.com", locale: "fr" });
  });

  it("refuses missing consent, a bad address and a failed check; drops bots quietly", async () => {
    const { env, fetch } = envWith(() => Response.json({ ok: true }));
    expect(((await (await signup(env, { ...valid, privacyNoticeAccepted: false })).json()) as { fields: Record<string, string> }).fields.privacyNoticeAccepted).toBe("consent_required");
    expect((await signup(env, { ...valid, email: "nope" })).status).toBe(422);
    expect((await signup(env, { ...valid, website: "spam" })).status).toBe(201);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ success: false })));
    expect((await signup(env, valid)).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("answers 503 when maarifcms is down", async () => {
    const { env } = envWith(() => new Response("down", { status: 500 }));
    expect((await signup(env, valid)).status).toBe(503);
  });
});

describe("confirm and unsubscribe links", () => {
  it("confirms and sends the visitor to the page in their language", async () => {
    const { env, fetch } = envWith(() => Response.json({ ok: true, locale: "ar" }));
    const response = await app.request(`/api/newsletter/confirm?t=${token}`, {}, env);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/ar/newsletter/confirmed");
    expect(JSON.parse(fetch.mock.calls[0]![1]!.body as string)).toEqual({ t: token });
  });

  it("shows the error state for a bad or refused link", async () => {
    const { env, fetch } = envWith(() => Response.json({ ok: false }, { status: 400 }));
    expect((await app.request("/api/newsletter/confirm?t=junk", {}, env)).headers.get("location")).toBe("/en/newsletter/confirmed?status=invalid");
    expect(fetch).not.toHaveBeenCalled();
    expect((await app.request(`/api/newsletter/confirm?t=${token}`, {}, env)).headers.get("location")).toBe("/en/newsletter/confirmed?status=invalid");
  });

  it("never unsubscribes on a plain visit, only on POST (one click or the page's button)", async () => {
    const { env, fetch } = envWith((path) => Response.json(path.endsWith("/unsubscribe") ? { ok: true, locale: "tr" } : {}));
    const visit = await app.request(`/api/newsletter/unsubscribe?t=${token}`, {}, env);
    expect(visit.status).toBe(303);
    expect(visit.headers.get("location")).toBe(`/en/newsletter/unsubscribe?t=${token}`);
    expect(fetch).not.toHaveBeenCalled();

    const oneClick = await app.request(`/api/newsletter/unsubscribe?t=${token}`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "List-Unsubscribe=One-Click" }, env);
    expect(await oneClick.json()).toEqual({ ok: true, locale: "tr" });
    const button = await app.request("/api/newsletter/unsubscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ t: token }) }, env);
    expect(button.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect((await app.request("/api/newsletter/unsubscribe", { method: "POST" }, env)).status).toBe(400);
  });
});

describe("crons", () => {
  it("runs the newsletter batch every five minutes and the maintenance at night", async () => {
    const { env, fetch } = envWith(() => Response.json({ ok: true }));
    const waits: Promise<unknown>[] = [];
    const ctx = { waitUntil: (p: Promise<unknown>) => waits.push(p) } as unknown as ExecutionContext;
    worker.scheduled({ cron: "*/5 * * * *" } as ScheduledController, env, ctx);
    worker.scheduled({ cron: "0 2 * * *" } as ScheduledController, env, ctx);
    await Promise.all(waits);
    expect(fetch.mock.calls.map(([url]) => new URL(url).pathname)).toEqual(["/cms-api/newsletters/run", "/cms-api/maintenance/nightly"]);
  });
});
