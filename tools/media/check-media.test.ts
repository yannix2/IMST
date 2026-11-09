// Guards the photos the site ships (wave 2, task 1.5): every entry of the generated manifest
// matches the contract (consent value, alt text in all four languages, ...), every file it names
// exists, and the published media stay within the 25 MB budget.
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { photoSchema } from "@maarif/contracts/media";
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

  test("published media stay within budget", () => {
    expect(size(publicDir)).toBeLessThanOrEqual(25e6);
    expect(statSync(join(publicDir, "hero", "hero-landscape.mp4")).size).toBeLessThanOrEqual(4e6);
    expect(statSync(join(publicDir, "hero", "hero-portrait.mp4")).size).toBeLessThanOrEqual(2.5e6);
  });
});
