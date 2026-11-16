import { keyDateKinds, type KeyDate, type KeyDateKind, type Locale, type Notice } from "@maarif/contracts";
import { cmsGet } from "./content";
import type { Env } from "./env";

// Wave 6 readers (2026-11-16): the key dates of the school year, the same dates as a calendar
// file, and the notice bar. Same rules as wave 3: published only, in the requested language only,
// translation at least Ready.

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const day = (value: unknown) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);

// The school's day, whatever the server's clock zone: Tunisia is UTC+1 all year.
export const todayInTunis = (now = new Date()) => new Date(now.getTime() + 3_600_000).toISOString().slice(0, 10);

type CmsKeyDate = { id: string | number; kind?: string; title?: string; note?: string; startsOn?: string | null; endsOn?: string | null; stages?: string[]; campus?: string | null };

/** Dates that are not over before this month began, soonest first. */
export async function readKeyDates(env: Env, locale: Locale, now = new Date()): Promise<KeyDate[]> {
  const monthStart = `${todayInTunis(now).slice(0, 7)}-01`;
  // Start a few months back so a long holiday that is still running is not missed.
  const since = new Date(now.getTime() - 120 * 86_400_000).toISOString().slice(0, 10);
  const query = new URLSearchParams({
    locale,
    "fallback-locale": "none",
    depth: "0",
    limit: "200",
    sort: "startsOn",
    "where[translationStatus][not_equals]": "draft",
    "where[startsOn][greater_than_equal]": since,
  });
  const result = await cmsGet<{ docs?: CmsKeyDate[] }>(env, `/cms-api/key-dates?${query}`);
  return (result?.docs ?? []).flatMap((d) => {
    const startsOn = day(d.startsOn);
    const title = text(d.title);
    if (!startsOn || !title) return [];
    const last = day(d.endsOn);
    const endsOn = last && last > startsOn ? last : null;
    if ((endsOn ?? startsOn) < monthStart) return [];
    const kind = keyDateKinds.includes(d.kind as KeyDateKind) ? (d.kind as KeyDateKind) : "other";
    return [{ id: String(d.id), kind, title, note: text(d.note), startsOn, endsOn, stages: strings(d.stages), campus: d.campus ?? null }];
  });
}

// ---- The same dates as an iCalendar file ("Add to my calendar") ------------------------------

const calendarNames: Record<Locale, string> = {
  en: "International Maarif Schools of Tunisia",
  fr: "Écoles Internationales Maarif de Tunisie",
  ar: "مدارس المعارف الدولية بتونس",
  tr: "Tunus Uluslararası Maarif Okulları",
};

const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

// RFC 5545: lines of at most 75 bytes, continued with CRLF + one space; never cut inside a character.
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}

const compact = (isoDay: string) => isoDay.replace(/-/g, "");
const nextDay = (isoDay: string) => new Date(Date.parse(`${isoDay}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** Whole-day events (DTEND is the day after the last day, as the format asks). */
export function keyDatesCalendar(dates: KeyDate[], locale: Locale, host: string, now = new Date()): string {
  const stamp = `${now.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//International Maarif Schools of Tunisia//Key dates//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarNames[locale])}`,
  ];
  for (const d of dates) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:key-date-${d.id}-${locale}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(d.startsOn)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(d.endsOn ?? d.startsOn))}`,
      `SUMMARY:${escapeText(d.title)}`,
      ...(d.note ? [`DESCRIPTION:${escapeText(d.note)}`] : []),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

// ---- The notice bar -------------------------------------------------------------------------

const LINK = /^(\/[a-z0-9\-/]*|https:\/\/[^\s]+)$/;

/** The notice to show today in this language, or null (not shown, expired, or not written in it). */
export async function readNotice(env: Env, locale: Locale, now = new Date()): Promise<Notice | null> {
  const doc = await cmsGet<{ active?: boolean; until?: string | null; text?: string | null; link?: string | null }>(
    env,
    `/cms-api/globals/notice?locale=${locale}&fallback-locale=none&depth=0`,
  );
  const message = text(doc?.text);
  if (!doc?.active || !message) return null;
  const until = day(doc.until);
  if (until && until < todayInTunis(now)) return null;
  const link = text(doc.link);
  const href = !LINK.test(link) ? null : link.startsWith("/") ? `/${locale}${link === "/" ? "" : link}` : link;
  return { text: message, href };
}
