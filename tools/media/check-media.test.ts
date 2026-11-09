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

  test("published media stay within budget", () => {
    expect(size(publicDir)).toBeLessThanOrEqual(25e6);
    expect(statSync(join(publicDir, "hero", "hero-landscape.mp4")).size).toBeLessThanOrEqual(4e6);
    expect(statSync(join(publicDir, "hero", "hero-portrait.mp4")).size).toBeLessThanOrEqual(2.5e6);
  });
});
