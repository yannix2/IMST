import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "./index";
import { keyDatesCalendar, readKeyDates, readNotice, todayInTunis } from "./content-wave6";
import type { Env } from "./env";

function envWith(handler: (url: string, init?: RequestInit) => Response, extra: Partial<Env> = {}) {
  const fetch = vi.fn(async (url: string, init?: RequestInit) => handler(url, init));
  return { env: { CMS: { fetch }, CMS_API_KEY: "gateway-key", SITE_URL: "https://school.example", ...extra } as unknown as Env, fetch };
}

const now = new Date("2026-11-16T10:00:00Z");

beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => Response.json({ success: true }))));
afterEach(() => vi.unstubAllGlobals());

describe("key dates", () => {
  const docs = [
    { id: 1, kind: "holiday", title: "Autumn break", startsOn: "2026-10-26T12:00:00.000Z", endsOn: "2026-10-30T12:00:00.000Z" }, // over before this month
    { id: 2, kind: "term", title: "Long term", startsOn: "2026-09-15T12:00:00.000Z", endsOn: "2026-12-18T12:00:00.000Z", stages: ["primary"], campus: "schools" }, // still running
    { id: 3, kind: "meeting", title: "Parent-teacher meetings", note: "From 14:00; bring the report card", startsOn: "2026-11-20T12:00:00.000Z", endsOn: "2026-11-20T12:00:00.000Z" },
    { id: 4, kind: "party", title: "Unknown kind", startsOn: "2026-12-01T12:00:00.000Z" },
    { id: 5, kind: "exam", title: "", startsOn: "2026-12-05T12:00:00.000Z" }, // not written in this language
    { id: 6, kind: "exam", title: "No date" },
  ];

  it("keeps dates that are not over before this month, published and translated", async () => {
    const { env, fetch } = envWith(() => Response.json({ docs }));
    const dates = await readKeyDates(env, "fr", now);
    expect(dates.map((d) => d.id)).toEqual(["2", "3", "4"]);
    expect(dates[0]).toMatchObject({ startsOn: "2026-09-15", endsOn: "2026-12-18", stages: ["primary"], campus: "schools" });
    expect(dates[1]).toMatchObject({ endsOn: null, note: "From 14:00; bring the report card" }); // one day
    expect(dates[2]!.kind).toBe("other");
    const url = new URL(fetch.mock.calls[0]![0], "https://cms.internal");
    expect(url.pathname).toBe("/cms-api/key-dates");
    expect(url.searchParams.get("locale")).toBe("fr");
    expect(url.searchParams.get("fallback-locale")).toBe("none");
    expect(url.searchParams.get("where[translationStatus][not_equals]")).toBe("draft");
  });

  it("writes whole-day calendar events with escaped text and folded lines", async () => {
    const { env } = envWith(() => Response.json({ docs }));
    const ics = keyDatesCalendar(await readKeyDates(env, "en", now), "en", "school.example", now);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("UID:key-date-3-en@school.example");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261120\r\nDTEND;VALUE=DATE:20261121"); // the day after the last day
    expect(ics).toContain("DTSTART;VALUE=DATE:20260915\r\nDTEND;VALUE=DATE:20261219");
    expect(ics).toContain("DESCRIPTION:From 14:00\\; bring the report card");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    const long = keyDatesCalendar([{ id: "9", kind: "other", title: "عطلة ".repeat(30), note: "", startsOn: "2026-12-01", endsOn: null, stages: [], campus: null }], "ar", "h", now);
    for (const line of long.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(long.replace(/\r\n /g, "")).toContain(`SUMMARY:${"عطلة ".repeat(30)}`);
  });

  it("serves the list and the calendar file, and answers 404 with no dates", async () => {
    const full = envWith(() => Response.json({ docs: [{ id: 7, kind: "holiday", title: "Winter holiday", startsOn: "2099-12-20T12:00:00.000Z" }] }));
    const list = await app.request("/api/content/key-dates?locale=en", {}, full.env);
    expect(list.status).toBe(200);
    expect(((await list.json()) as { title: string }[])[0]!.title).toBe("Winter holiday");
    const file = await app.request("/api/calendar/key-dates.ics?locale=tr", {}, full.env);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(await file.text()).toContain("SUMMARY:Winter holiday");

    const empty = envWith(() => Response.json({ docs: [] }));
    expect((await app.request("/api/calendar/key-dates.ics?locale=en", {}, empty.env)).status).toBe(404);
    expect((await app.request("/api/calendar/key-dates.ics?locale=de", {}, empty.env)).status).toBe(400);
  });
});

describe("notice bar", () => {
  const notice = (doc: Record<string, unknown>) => envWith(() => Response.json(doc)).env;

  it("shows only an active notice, written in this language, not past its last day", async () => {
    expect(await readNotice(notice({ active: true, text: " School closed tomorrow ", link: "/parents/calendar" }), "en", now)).toEqual({ text: "School closed tomorrow", href: "/en/parents/calendar" });
    expect(await readNotice(notice({ active: false, text: "Hidden" }), "en", now)).toBeNull();
    expect(await readNotice(notice({ active: true, text: "" }), "ar", now)).toBeNull();
    expect(await readNotice(notice({ active: true, text: "Old", until: "2026-11-15T12:00:00.000Z" }), "en", now)).toBeNull();
    expect(await readNotice(notice({ active: true, text: "Today", until: "2026-11-16T12:00:00.000Z" }), "en", now)).toEqual({ text: "Today", href: null });
  });

  it("keeps only safe links", async () => {
    expect((await readNotice(notice({ active: true, text: "x", link: "https://example.org/a" }), "fr", now))?.href).toBe("https://example.org/a");
    expect((await readNotice(notice({ active: true, text: "x", link: "javascript:alert(1)" }), "fr", now))?.href).toBeNull();
    expect((await readNotice(notice({ active: true, text: "x", link: "//evil.example" }), "fr", now))?.href).toBeNull();
  });

  it("counts the day in Tunis time", () => {
    expect(todayInTunis(new Date("2026-11-16T23:30:00Z"))).toBe("2026-11-17");
  });
});
