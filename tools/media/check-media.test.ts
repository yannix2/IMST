// Guards the photos the site ships (wave 2, task 1.5): every entry of the generated manifest
// matches the contract (consent value, alt text in all four languages, ...), every file it names
// exists, and the published media stay within the 25 MB budget.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { photoSchema } from "@maarif/contracts/media";
import { locales } from "@maarif/contracts/locales";
import { isSitePageKey } from "@maarif/contracts/pages";
import { heroPhotos, photos } from "../../apps/web/src/content/media";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "..", "apps", "web", "public", "media");
const size = (dir: string): number =>
  readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? size(join(dir, e.name)) : statSync(join(dir, e.name)).size), 0);

describe("site photos", () => {
  test.each(Object.entries(photos))("%s matches the contract", (id, photo) => {
    const parsed = photoSchema.safeParse(photo);
    expect(parsed.success, parsed.error?.message).toBe(true);
    expect(photo.id).toBe(id);
  });

  test("every served file exists", () => {
    for (const photo of Object.values(photos)) {
      for (const w of photo.widths) {
        for (const ext of ["avif", "webp"]) expect(existsSync(join(publicDir, "photos", `${photo.id}-${w}.${ext}`)), `${photo.id}-${w}.${ext}`).toBe(true);
      }
    }
    for (const name of ["hero-landscape.mp4", "hero-portrait.mp4", "poster-landscape-960.avif", "poster-landscape-1920.avif", "poster-portrait-720.avif"]) {
      expect(existsSync(join(publicDir, "hero", name)), `hero/${name}`).toBe(true);
    }
  });

  test("hero shots are photos of the manifest", () => {
    for (const id of heroPhotos) expect(photos[id]).toBeDefined();
  });

  // Wave 3 page photos (page-photos.json, uploaded to maarifcms by upload-to-cms.mjs).
  test("the page photo plan names known photos and real pages", () => {
    const read = (f: string) => JSON.parse(readFileSync(join(here, f), "utf8"));
    const selection = read("media-selection.json") as { photos: { id: string }[] };
    const plan = read("page-photos.json") as {
      photos: { id: string; src: string; consent: string; focus: number[]; alt: Record<string, string> }[];
      pages: Record<string, { header: string; band: string[] }>;
    };
    const known = new Set(selection.photos.map((p) => p.id));
    for (const p of plan.photos) {
      expect(known.has(p.id), `duplicate id ${p.id}`).toBe(false);
      known.add(p.id);
      expect(["non-identifiable", "adults", "authorized"]).toContain(p.consent);
      for (const l of locales) expect(p.alt[l]?.trim().length, `${p.id} alt ${l}`).toBeGreaterThan(10);
      expect(p.focus.every((v) => v >= 0 && v <= 1), `${p.id} focus`).toBe(true);
    }
    for (const [page, { header, band }] of Object.entries(plan.pages)) {
      expect(isSitePageKey(page), page).toBe(true);
      expect(band.length, page).toBeLessThanOrEqual(3);
      for (const id of [header, ...band]) expect(known.has(id), `${page}: ${id}`).toBe(true);
    }
  });

  // Wave 5: the Home film's trailer plan (admissions-film.json). The outputs themselves are checked
  // against their budgets by admissions-film.mjs, which stops when a file is too large.
  test("the trailer plan stays inside the film, above the subtitles, before the closing card", () => {
    const plan = JSON.parse(readFileSync(join(here, "admissions-film.json"), "utf8")) as {
      source: string;
      keep: number;
      shots: { start: number; duration: number; x: number; what: string }[];
    };
    expect(plan.source.endsWith(".mp4")).toBe(true);
    expect(plan.keep).toBeGreaterThan(0.75); // the burned-in subtitles sit in the bottom ~14 %
    expect(plan.keep).toBeLessThanOrEqual(0.86);
    const total = plan.shots.reduce((n, s) => n + s.duration, 0);
    expect(total).toBeGreaterThanOrEqual(15);
    expect(total).toBeLessThanOrEqual(25);
    for (const s of plan.shots) {
      expect(s.duration, s.what).toBeGreaterThanOrEqual(1);
      expect(s.duration, s.what).toBeLessThanOrEqual(3);
      expect(s.start + s.duration, s.what).toBeLessThanOrEqual(172.5); // from 2:53 the "enrol now" card
      expect(s.x >= 0 && s.x <= 1, s.what).toBe(true);
      expect(s.what.length, "describe each shot").toBeGreaterThan(5);
    }
  });

  test("the film's transcript exists in every language, paragraph for paragraph", () => {
    const t = JSON.parse(readFileSync(join(here, "admissions-film-transcript.json"), "utf8")) as Record<string, string>;
    const paragraphs = (l: string) => t[l]!.split("\n").filter((p) => p.trim()).length;
    for (const l of locales) {
      expect(t[l]?.trim().length, l).toBeGreaterThan(1000);
      expect(t[l]!.length, `${l} fits the 6000-character field`).toBeLessThanOrEqual(6000);
      expect(paragraphs(l), l).toBe(paragraphs("en"));
    }
  });

  test("published media stay within budget", () => {
    expect(size(publicDir)).toBeLessThanOrEqual(25e6);
    expect(statSync(join(publicDir, "hero", "hero-landscape.mp4")).size).toBeLessThanOrEqual(4e6);
    expect(statSync(join(publicDir, "hero", "hero-portrait.mp4")).size).toBeLessThanOrEqual(2.5e6);
  });
});
