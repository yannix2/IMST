import { describe, expect, it, vi } from "vitest";
import { app } from "./index";
import { readAbout, readWeekMenu } from "./content";
import type { Env } from "./env";

function envWith(handler: (url: string, init?: RequestInit) => Response) {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => handler(url, init));
  return { env: { CMS: { fetch }, CMS_API_KEY: "gateway-key" } as unknown as Env, fetch };
}

const menuDoc = {
  docs: [
    {
      weekOf: "2026-11-01T23:00:00.000Z",
      days: [
        { day: "thursday", dishes: [{ course: "dessert", dish: "Orange" }, { course: "main", dish: " Couscous " }, { course: "side", dish: "" }] },
        { day: "monday", dishes: [{ course: "main", dish: "Lentils" }] },
      ],
    },
  ],
};

describe("readWeekMenu", () => {
  it("asks for this week's Monday in Tunis time and orders days and courses", async () => {
    const { env, fetch } = envWith(() => Response.json(menuDoc));
    const menu = await readWeekMenu(env, "ar", new Date("2026-11-05T08:00:00Z"));

    const url = new URL(fetch.mock.calls[0]![0]);
    expect(url.pathname).toBe("/cms-api/weekly-menus");
    expect(url.searchParams.get("where[weekOf][greater_than_equal]")).toBe("2026-11-01T12:00:00.000Z");
    expect(url.searchParams.get("locale")).toBe("ar");
    expect(url.searchParams.get("fallback-locale")).toBe("fr");

    expect(menu).toEqual({
      weekOf: "2026-11-02",
      today: "thursday",
      days: [
        { day: "monday", date: "2026-11-02", dishes: [{ course: "main", dish: "Lentils" }] },
        { day: "thursday", date: "2026-11-05", dishes: [{ course: "main", dish: "Couscous" }, { course: "dessert", dish: "Orange" }] },
      ],
    });
  });

  it("opens on the first day with a menu when today has none", async () => {
    const { env } = envWith(() => Response.json(menuDoc));
    const menu = await readWeekMenu(env, "en", new Date("2026-11-03T08:00:00Z"));
    expect(menu?.today).toBe("monday");
  });

  it("returns null when the week has no menu", async () => {
    const { env } = envWith(() => Response.json({ docs: [] }));
    expect(await readWeekMenu(env, "en")).toBeNull();
  });
});

describe("GET /api/content/*", () => {
  it("answers 404 for an unpublished head's message and 400 for an unknown language", async () => {
    const { env } = envWith(() => Response.json({ published: false, name: "X", role: "Y", message: "Z" }));
    expect((await app.request("/api/content/head-message?locale=en", {}, env)).status).toBe(404);
    expect((await app.request("/api/content/head-message?locale=de", {}, env)).status).toBe(400);
  });

  it("maps a published head's message to /api/media paths", async () => {
    const { env } = envWith(() =>
      Response.json({
        published: true,
        name: "A. Head",
        role: "Head of school",
        message: "Welcome.",
        video: { filename: "head.mp4", mimeType: "video/mp4" },
        poster: { filename: "head.jpg" },
        captions: null,
      }),
    );
    const response = await app.request("/api/content/head-message?locale=en", {}, env);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("max-age=300");
    expect(await response.json()).toEqual({
      name: "A. Head",
      role: "Head of school",
      message: "Welcome.",
      video: { src: "/api/media/head.mp4", type: "video/mp4" },
      poster: "/api/media/head.jpg",
      captions: null,
    });
  });
});

describe("GET /api/content/home", () => {
  it("returns every list, leaving out items without text in the language or without permission", async () => {
    const { env, fetch } = envWith((url) => {
      const path = new URL(url).pathname;
      if (path === "/cms-api/news") return Response.json({ docs: [{ id: 1, kind: "event", title: "Science fair", date: "2026-11-20T00:00:00.000Z", summary: "Open to families.", image: 7 }, { id: 2, title: "", summary: "x", date: "2026-11-01" }] });
      if (path === "/cms-api/faqs") return Response.json({ docs: [{ id: 3, question: "Hours?", answer: "8 to 4." }, { id: 4, question: "Bus?", answer: "" }] });
      if (path === "/cms-api/testimonials") return Response.json({ docs: [{ id: 5, kind: "parent", name: "A. B.", role: "Parent", quote: "Kind teachers." }] });
      if (path === "/cms-api/globals/gallery") return Response.json({ published: true, photos: [{ id: "p1", image: { filename: "yard.jpg", alt: "The yard" }, caption: "Break" }, { id: "p2", image: 9 }] });
      return new Response(null, { status: 404 });
    });
    const response = await app.request("/api/content/home?locale=fr", {}, env);
    expect(response.status).toBe(200);
    const body = (await response.json()) as Record<string, unknown[]>;
    expect(body.news).toEqual([{ id: "1", kind: "event", title: "Science fair", date: "2026-11-20", summary: "Open to families.", image: null }]);
    expect(body.faqs).toEqual([{ id: "3", question: "Hours?", answer: "8 to 4." }]);
    expect(body.testimonials).toHaveLength(1);
    expect(body.gallery).toEqual([{ id: "p1", src: "/api/media/yard.jpg", alt: "The yard", caption: "Break" }]);
    expect(body.headMessage).toBeNull();
    const testimonialsUrl = fetch.mock.calls.map((c) => c[0]).find((u) => u.includes("/testimonials"))!;
    expect(new URL(testimonialsUrl).searchParams.get("where[permission][equals]")).toBe("true");
  });
});

describe("GET /api/media/:filename", () => {
  it("forwards the Range header and passes a partial answer through", async () => {
    const { env, fetch } = envWith(
      () => new Response("abc", { status: 206, headers: { "content-type": "video/mp4", "content-range": "bytes 0-2/10" } }),
    );
    const response = await app.request("/api/media/head.mp4", { headers: { range: "bytes=0-2" } }, env);
    expect(response.status).toBe(206);
    expect(response.headers.get("content-range")).toBe("bytes 0-2/10");
    const init = fetch.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>).range).toBe("bytes=0-2");
  });

  it("refuses odd file names and hides files maarifcms will not serve", async () => {
    const { env } = envWith(() => new Response(null, { status: 403 }));
    expect((await app.request("/api/media/..%2Fsecret", {}, env)).status).toBe(404);
    expect((await app.request("/api/media/pending.jpg", {}, env)).status).toBe(404);
  });
});

describe("readAbout", () => {
  it("shows the centre number only when published, and photos only with consent", async () => {
    const { env } = envWith((url) => {
      if (url.includes("/globals/school-facts")) return Response.json({ published: true, cambridgeCentreNumber: " TN123 ", cambridgeSince: "20x6" });
      return Response.json({
        docs: [
          { id: 1, name: "A. Head", role: "Principal", bio: "", photo: { filename: "head.jpg", alt: "A. Head" }, photoConsent: true },
          { id: 2, name: "B. Deputy", role: "Vice principal", photo: { filename: "deputy.jpg" }, photoConsent: false },
          { id: 3, name: "", role: "No name" },
        ],
      });
    });
    const about = await readAbout(env, "en");
    expect(about.cambridgeCentre).toEqual({ number: "TN123", since: null });
    expect(about.people.map((p) => [p.name, p.photo?.src ?? null])).toEqual([
      ["A. Head", "/api/media/head.jpg"],
      ["B. Deputy", null],
    ]);
  });

  it("hides an unpublished centre number", async () => {
    const { env } = envWith((url) =>
      url.includes("school-facts") ? Response.json({ published: false, cambridgeCentreNumber: "TN123" }) : Response.json({ docs: [] }),
    );
    expect((await readAbout(env, "fr")).cambridgeCentre).toBeNull();
  });

  it("answers /api/content/about for a valid locale only", async () => {
    const { env } = envWith(() => Response.json({ docs: [] }));
    expect((await app.request("/api/content/about?locale=xx", {}, env)).status).toBe(400);
    const ok = await app.request("/api/content/about?locale=tr", {}, env);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ cambridgeCentre: null, people: [] });
  });
});