import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./index";
import type { Env } from "./env";

const validPreRegistration = {
  locale: "en",
  turnstileToken: "token",
  privacyNoticeAccepted: true,
  studentName: "Amira Ben Salah",
  grade: "kg",
  phone: "+216 22 123 456",
  cityArea: "La Marsa",
};

function makeEnv(overrides: Partial<Env> = {}) {
  const cmsFetch = vi.fn(async () => Response.json({ doc: { id: 42 } }, { status: 201 }));
  const limit = vi.fn(async () => ({ success: true }));
  const env = {
    CMS: { fetch: cmsFetch },
    FORM_LIMITER: { limit },
    TURNSTILE_SECRET: "turnstile-secret",
    CMS_API_KEY: "gateway-key",
    ...overrides,
  } as unknown as Env;
  return { env, cmsFetch, limit };
}

function post(body: unknown, env: Env, kind = "pre-registration") {
  return app.request(
    `/api/forms/${kind}`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    env,
  );
}

let turnstileSuccess = true;

beforeEach(() => {
  turnstileSuccess = true;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ success: turnstileSuccess })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/forms/:kind", () => {
  it("stores a valid pre-registration through maarifcms and returns its reference", async () => {
    const { env, cmsFetch } = makeEnv();
    const response = await post(validPreRegistration, env);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, reference: "42" });

    expect(cmsFetch).toHaveBeenCalledOnce();
    const [url, init] = cmsFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/cms-api\/inquiries$/);
    expect((init.headers as Record<string, string>).authorization).toBe("api-clients API-Key gateway-key");
    const stored = JSON.parse(init.body as string);
    expect(stored).toMatchObject({ kind: "pre-registration", contactName: "Amira Ben Salah", phone: "+21622123456" });
    expect(stored).not.toHaveProperty("turnstileToken");
    expect(stored).not.toHaveProperty("website");
  });

  it("rejects invalid fields with per-field error keys and never calls the CMS", async () => {
    const { env, cmsFetch } = makeEnv();
    const response = await post({ ...validPreRegistration, phone: "12", grade: "year-14" }, env);

    expect(response.status).toBe(422);
    const result = (await response.json()) as { fields: Record<string, string> };
    expect(result.fields).toMatchObject({ phone: "invalid_phone", grade: "invalid_grade" });
    expect(cmsFetch).not.toHaveBeenCalled();
  });

  it("silently drops a filled honeypot", async () => {
    const { env, cmsFetch } = makeEnv();
    const response = await post({ ...validPreRegistration, website: "spam.example" }, env);

    expect(response.status).toBe(201);
    expect(cmsFetch).not.toHaveBeenCalled();
  });

  it("refuses a failed Turnstile check", async () => {
    turnstileSuccess = false;
    const { env, cmsFetch } = makeEnv();
    const response = await post(validPreRegistration, env);

    expect(response.status).toBe(403);
    expect(cmsFetch).not.toHaveBeenCalled();
  });

  it("rate-limits per form and IP before parsing", async () => {
    const limit = vi.fn(async () => ({ success: false }));
    const { env, cmsFetch } = makeEnv({ FORM_LIMITER: { limit } } as never);
    const response = await post("not json", env);

    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: "pre-registration:203.0.113.7" });
    expect(cmsFetch).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies", async () => {
    const { env } = makeEnv();
    const response = await post({ ...validPreRegistration, message: "x".repeat(20_000) }, env);
    expect(response.status).toBe(413);
  });

  it("returns 503 when maarifcms is unavailable", async () => {
    const { env } = makeEnv({ CMS: { fetch: vi.fn(async () => new Response(null, { status: 500 })) } } as never);
    const response = await post(validPreRegistration, env);
    expect(response.status).toBe(503);
  });

  it("returns 404 for unknown form kinds and paths", async () => {
    const { env } = makeEnv();
    expect((await post(validPreRegistration, env, "payments")).status).toBe(404);
    expect((await app.request("/internal/anything", {}, env)).status).toBe(404);
  });
});
