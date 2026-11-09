import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./index";
import { photo, readDocuments, readJobs, readNewsArticle, readPageVisuals } from "./content-wave3";
import { mimeMessage } from "./notify";
import type { Env } from "./env";

function envWith(handler: (url: string, init?: RequestInit) => Response, extra: Partial<Env> = {}) {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => handler(url, init));
  const limit = vi.fn(async () => ({ success: true }));
  return { env: { CMS: { fetch }, FORM_LIMITER: { limit }, CMS_API_KEY: "gateway-key", TURNSTILE_SECRET: "t", ...extra } as unknown as Env, fetch, limit };
}

const media = (filename: string, extra: Record<string, unknown> = {}) => ({ filename, alt: "Hands on a microscope", width: 2400, height: 1600, mimeType: "image/jpeg", focus: { x: 40, y: 55 }, ...extra });
const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => Response.json({ success: true }))));
afterEach(() => vi.unstubAllGlobals());

describe("wave 3 readers", () => {
  it("builds photos from cleared media only, with size and focus", () => {
    expect(photo(media("a.jpg"))).toEqual({ src: "/api/media/a.jpg", alt: "Hands on a microscope", width: 2400, height: 1600, focus: [40, 55] });
    expect(photo(12)).toBeNull(); // consent pending: maarifcms returns a bare id
    expect(photo(media("film.mp4", { mimeType: "video/mp4" }))).toBeNull();
    expect(photo(media("../etc/passwd"))).toBeNull();
  });

  it("asks only for language versions marked Ready or Proofread", async () => {
    const { env, fetch } = envWith(() => Response.json({ docs: [] }));
    await readNewsArticle(env, "fr", "back-to-school");
    const url = new URL(fetch.mock.calls[0]![0]);
    expect(url.searchParams.get("where[translationStatus][not_equals]")).toBe("draft");
    expect(url.searchParams.get("fallback-locale")).toBe("none");
    expect(url.searchParams.get("where[slug][equals]")).toBe("back-to-school");
  });

  it("turns a news article's rich text into safe blocks and keeps event details for events", async () => {
    const { env } = envWith(() =>
      Response.json({
        docs: [
          {
            slug: "sports-day",
            kind: "event",
            title: "Sports Day",
            date: "2027-04-08T00:00:00.000Z",
            summary: "A day of games.",
            image: media("cover.jpg"),
            body: { root: { children: [{ type: "paragraph", children: [{ type: "text", text: "Bring water.", format: 1 }] }, { type: "paragraph", children: [{ type: "link", fields: { url: "javascript:alert(1)" }, children: [{ type: "text", text: "x" }] }] }] } },
            photos: [{ image: media("p1.jpg"), caption: "Relay" }, { image: 7, caption: "pending" }],
            event: { startsAt: "2027-04-08T08:00:00.000Z", place: "Le Kram", registration: "" },
          },
        ],
      }),
    );
    const article = await readNewsArticle(env, "en", "sports-day");
    expect(article?.body).toEqual([{ t: "p", c: [{ text: "Bring water.", b: true }] }, { t: "p", c: [{ text: "x" }] }]);
    expect(article?.photos).toHaveLength(1);
    expect(article?.event).toMatchObject({ startsAt: "2027-04-08T08:00:00.000Z", place: "Le Kram" });
  });

  it("drops closed job openings and expired documents", async () => {
    const jobs = envWith(() =>
      Response.json({ docs: [{ slug: "maths", title: "Maths teacher", summary: "Year 7 to 9", closesOn: yesterday }, { slug: "english", title: "English teacher", summary: "Primary", closesOn: nextMonth }] }),
    );
    expect((await readJobs(jobs.env, "en")).map((j) => j.slug)).toEqual(["english"]);

    const docs = envWith(() =>
      Response.json({
        docs: [
          { id: 1, kind: "calendar", title: "Calendar 2026-27", file: media("cal.pdf", { mimeType: "application/pdf", filesize: 120_000 }), validUntil: nextMonth },
          { id: 2, kind: "calendar", title: "Old calendar", file: media("old.pdf", { mimeType: "application/pdf" }), validUntil: yesterday },
          { id: 3, kind: "handbook", title: "Not a PDF", file: media("h.jpg") },
        ],
      }),
    );
    expect((await readDocuments(docs.env, "en")).map((d) => d.title)).toEqual(["Calendar 2026-27"]);
  });

  it("maps page photos by page and slot", async () => {
    const { env } = envWith(() => Response.json({ docs: [{ page: "about", header: media("h.jpg"), slots: [{ slot: "mission", image: media("m.jpg") }, { slot: "pending", image: 4 }] }] }));
    const visuals = await readPageVisuals(env, "ar");
    expect(visuals.about?.header?.src).toBe("/api/media/h.jpg");
    expect(Object.keys(visuals.about?.slots ?? {})).toEqual(["mission"]);
  });
});

describe("GET /api/content (wave 3 routes)", () => {
  it("validates the language and the slug", async () => {
    const { env, fetch } = envWith(() => Response.json({ docs: [] }));
    expect((await app.request("/api/content/news?locale=de", {}, env)).status).toBe(400);
    expect((await app.request("/api/content/news/Bad_Slug?locale=en", {}, env)).status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
    expect((await app.request("/api/content/news/unknown?locale=en", {}, env)).status).toBe(404);
    expect((await app.request("/api/content/news?locale=en", {}, env)).status).toBe(200);
  });
});

describe("GET /api/content/site-config", () => {
  it("gives only a well-formed Google Analytics ID, never other settings", async () => {
    const good = envWith(() => Response.json({ gaMeasurementId: " g-ab12cd34ef ", notifications: { admissions: ["staff@school.tn"] } }));
    expect(await (await app.request("/api/content/site-config", {}, good.env)).json()).toEqual({ gaMeasurementId: "G-AB12CD34EF" });
    const bad = envWith(() => Response.json({ gaMeasurementId: "<script>" }));
    expect(await (await app.request("/api/content/site-config", {}, bad.env)).json()).toEqual({ gaMeasurementId: null });
  });
});

describe("POST /api/forms/feedback", () => {
  it("stores a parent's suggestion as an inquiry of kind feedback", async () => {
    const { env, fetch } = envWith(() => Response.json({ doc: { id: 9 } }, { status: 201 }));
    const response = await app.request(
      "/api/forms/feedback",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: "fr", turnstileToken: "t", privacyNoticeAccepted: true, name: "Leila", email: "leila@example.com", feedbackKind: "suggestion", message: "Plus de sorties scolaires, merci." }),
      },
      env,
    );
    expect(response.status).toBe(201);
    const stored = JSON.parse(fetch.mock.calls[0]![1]!.body as string);
    expect(stored).toMatchObject({ kind: "feedback", contactName: "Leila", details: { feedbackKind: "suggestion" } });
  });
});

describe("POST /api/forms/application", () => {
  const fields = { locale: "en", turnstileToken: "t", privacyNoticeAccepted: "true", job: "open", name: "Sami Trabelsi", email: "sami@example.com", phone: "+216 22 123 456", position: "Science teacher" };
  const pdf = (bytes = "%PDF-1.7 test", type = "application/pdf") => new File([bytes], "cv.pdf", { type });
  const send = (env: Env, cv: File | null, extra: Record<string, string> = {}) => {
    const form = new FormData();
    for (const [k, v] of Object.entries({ ...fields, ...extra })) form.append(k, v);
    if (cv) form.append("cv", cv);
    return app.request("/api/forms/application", { method: "POST", body: form }, env);
  };

  it("stores the CV privately, then the application, and answers with its reference", async () => {
    const { env, fetch } = envWith((url) => Response.json({ doc: { id: url.includes("private-files") ? 31 : 77 } }, { status: 201 }));
    const response = await send(env, pdf());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, reference: "77" });
    expect(fetch.mock.calls[0]![0]).toMatch(/\/cms-api\/private-files$/);
    const application = JSON.parse(fetch.mock.calls[1]![1]!.body as string);
    expect(application).toMatchObject({ cv: 31, position: "Science teacher", status: "new" });
    expect(application.job).toBeUndefined();
  });

  it("refuses a missing CV, a file that is not a real PDF, and an unknown opening", async () => {
    const { env, fetch } = envWith(() => Response.json({ docs: [] }));
    expect(((await (await send(env, null)).json()) as { fields: Record<string, string> }).fields.cv).toBe("cv_required");
    expect(((await (await send(env, pdf("MZ fake exe"))).json()) as { fields: Record<string, string> }).fields.cv).toBe("pdf_only");
    expect(((await (await send(env, pdf("%PDF-1.7", "image/png"))).json()) as { fields: Record<string, string> }).fields.cv).toBe("pdf_only");
    const unknownJob = await send(env, pdf(), { job: "no-such-job" });
    expect(unknownJob.status).toBe(422);
    expect(fetch.mock.calls.every(([url]) => !String(url).includes("private-files"))).toBe(true);
  });

  it("refuses a CV over 5 MB", async () => {
    const { env } = envWith(() => Response.json({}));
    const big = pdf("%PDF-" + "x".repeat(5 * 1024 * 1024));
    const response = await send(env, big);
    expect([413, 422]).toContain(response.status);
  });
});

describe("POST /internal/revalidate", () => {
  it("needs the shared secret and forwards tags to the web worker", async () => {
    const web = vi.fn(async (_url: string, _init?: RequestInit) => Response.json({ ok: true }));
    const { env } = envWith(() => Response.json({}), { REVALIDATE_SECRET: "s3cret", WEB: { fetch: web } as never });
    const call = (secret: string, tags: unknown) =>
      app.request("/internal/revalidate", { method: "POST", headers: { "content-type": "application/json", "x-revalidate-secret": secret }, body: JSON.stringify({ tags }) }, env);
    expect((await call("wrong", ["news"])).status).toBe(403);
    expect((await call("s3cret", [])).status).toBe(400);
    expect((await call("s3cret", ["news", "news:sports-day", "<script>"])).status).toBe(200);
    expect(JSON.parse(web.mock.calls[0]![1]!.body as string)).toEqual({ tags: ["news", "news:sports-day"] });
  });
});

describe("nightly maintenance", () => {
  it("asks maarifcms to run retention and backup with the shared secret, and skips without one", async () => {
    const { nightly } = await import("./scheduled");
    const { env, fetch } = envWith(() => Response.json({ ok: true }), { MAINTENANCE_SECRET: "m4int" });
    expect(await nightly(env)).toBe(true);
    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toMatch(/\/cms-api\/maintenance\/nightly$/);
    expect((init!.headers as Record<string, string>)["x-maintenance-secret"]).toBe("m4int");
    const none = envWith(() => Response.json({ ok: true }));
    expect(await nightly(none.env)).toBe(false);
    expect(none.fetch).not.toHaveBeenCalled();
  });
});

describe("media and notifications", () => {
  it("serves the original when no size is asked or Images is not bound", async () => {
    const { env, fetch } = envWith(() => new Response("img", { headers: { "content-type": "image/jpeg" } }));
    const response = await app.request("/api/media/photo.jpg?w=960&f=avif", {}, env);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(fetch.mock.calls[0]![0]).toMatch(/\/cms-api\/media\/file\/photo\.jpg$/);
  });

  it("writes a notification without personal details", () => {
    const raw = mimeMessage("noreply@school.tn", "staff@school.tn", "New visit request", "Open it in maarifcms.");
    expect(raw).toMatch(/^From: maarifcms <noreply@school.tn>\r\nTo: <staff@school.tn>/);
    expect(raw).toContain("Content-Transfer-Encoding: base64");
  });
});
