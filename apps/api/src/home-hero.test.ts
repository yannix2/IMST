import { describe, expect, it, vi } from "vitest";
import { readHomeHero } from "./content-wave3";
import type { Env } from "./env";

// Wave 5: the Home film global = the silent loop (trailer) and the full film, each on its own.
function envWith(doc: unknown) {
  const fetch = vi.fn(async () => Response.json(doc));
  return { env: { CMS: { fetch }, CMS_API_KEY: "gateway-key" } as unknown as Env, fetch };
}
const video = (filename: string) => ({ filename, mimeType: "video/mp4" });
const image = (filename: string) => ({ filename, alt: "", width: 1920, height: 1080, mimeType: "image/webp", focus: { x: 50, y: 50 } });
const trailer = { filmLandscape: video("trailer-landscape.mp4"), filmPortrait: video("trailer-portrait.mp4"), posterLandscape: image("pl.webp"), posterPortrait: image("pp.webp") };
const film = { fullFilm: video("film-720.mp4"), fullFilmSmall: video("film-480.mp4"), fullFilmPoster: image("fp.webp") };

describe("readHomeHero (wave 5)", () => {
  it("returns the loop, the film and this language's transcript", async () => {
    const { env, fetch } = envWith({ published: true, ...trailer, ...film, transcript: "  Bienvenue.\nNous sommes…  " });
    const hero = await readHomeHero(env, "fr");
    expect(hero?.trailer?.landscape).toBe("/api/media/trailer-landscape.mp4");
    expect(hero?.film).toMatchObject({ src: "/api/media/film-720.mp4", small: "/api/media/film-480.mp4", poster: { src: "/api/media/fp.webp" } });
    expect(hero?.transcript).toBe("Bienvenue.\nNous sommes…");
    const url = new URL(String((fetch.mock.calls[0] as unknown[])[0]));
    expect(url.searchParams.get("locale")).toBe("fr");
    expect(url.searchParams.get("fallback-locale")).toBe("none");
  });

  it("shows the film without a loop, and the loop without a film", async () => {
    const onlyFilm = await readHomeHero(envWith({ published: true, ...film }).env, "en");
    expect(onlyFilm?.trailer).toBeNull();
    expect(onlyFilm?.film?.src).toBe("/api/media/film-720.mp4");
    expect(onlyFilm?.transcript).toBe("");

    const onlyLoop = await readHomeHero(envWith({ published: true, ...trailer, fullFilm: video("film-720.mp4") }).env, "en");
    expect(onlyLoop?.trailer).not.toBeNull();
    expect(onlyLoop?.film).toBeNull(); // the phone version is missing
  });

  it("returns nothing while unpublished, or when files are pending or not videos", async () => {
    expect(await readHomeHero(envWith({ published: false, ...trailer, ...film }).env, "en")).toBeNull();
    // consent pending: maarifcms returns bare ids
    expect(await readHomeHero(envWith({ published: true, filmLandscape: 3, filmPortrait: 4, posterLandscape: 5, posterPortrait: 6, fullFilm: 7, fullFilmSmall: 8 }).env, "en")).toBeNull();
    const notVideo = await readHomeHero(envWith({ published: true, ...trailer, fullFilm: image("x.webp"), fullFilmSmall: video("film-480.mp4") }).env, "en");
    expect(notVideo?.film).toBeNull();
  });
});
