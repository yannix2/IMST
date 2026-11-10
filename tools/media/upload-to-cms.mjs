// Moves the curated photos and the hero film into maarifcms (wave 3, task B3; owner decision
// 2026-11-09: every photo lives in maarifcms). Idempotent: a file already uploaded (same `source`)
// is reused, not duplicated.
//
//   CMS_URL=http://localhost:3000 CMS_EMAIL=... CMS_PASSWORD=... node upload-to-cms.mjs [--root E:\IMST\IMSTMEDIA] [--publish] [--film]
//
// For each photo in media-selection.json: the original is re-encoded at most 2400 px wide (JPEG,
// no metadata), uploaded with its alt text in four languages, its consent status (non-identifiable
// → "No identifiable child", adults → "Only adults can be recognised") and its focus point. Then
// the Home page's photo slots (levels-*, life-*) and the Home film are filled, then every inner
// page's header and row of photos from page-photos.json (wave 3, approved 2026-11-09). --publish also
// publishes them (the account must be a reviewer or administrator); otherwise they stay drafts.

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { mediaRoot, upright } from "./source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, "..", "..", "apps", "web");
const CMS = process.env.CMS_URL ?? "http://localhost:3000";
const publish = process.argv.includes("--publish");
const root = mediaRoot();
const selection = JSON.parse(readFileSync(join(here, "media-selection.json"), "utf8"));
const locales = ["en", "fr", "ar", "tr"];
const consentOf = { "non-identifiable": "no-identifiable-child", adults: "adults-only", authorized: "parental-authorization" };

if (!process.env.CMS_EMAIL || !process.env.CMS_PASSWORD) {
  console.error("Set CMS_EMAIL and CMS_PASSWORD (a reviewer or administrator account).");
  process.exit(1);
}

async function api(path, init = {}) {
  const response = await fetch(`${CMS}/cms-api${path}`, { ...init, headers: { ...(init.headers ?? {}), authorization: `JWT ${token}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const login = await fetch(`${CMS}/cms-api/users/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: process.env.CMS_EMAIL, password: process.env.CMS_PASSWORD }),
});
if (!login.ok) {
  console.error(`Login failed (${login.status}). Is maarifcms running at ${CMS}?`);
  process.exit(1);
}
const { token } = await login.json();

async function existing(source) {
  const q = new URLSearchParams({ "where[source][equals]": source, limit: "1", depth: "0" });
  return (await api(`/media?${q}`)).docs?.[0] ?? null;
}

async function upload({ source, buffer, filename, type, alt, consent, focus }) {
  const found = await existing(source);
  if (found) return found.id;
  const form = new FormData();
  form.append("file", new Blob([buffer], { type }), filename);
  form.append("_payload", JSON.stringify({ alt: alt.en, consent, focus, source }));
  const created = await api("/media?locale=en", { method: "POST", body: form });
  const id = created.doc.id;
  for (const locale of locales.slice(1)) {
    await api(`/media/${id}?locale=${locale}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ alt: alt[locale] }) });
  }
  return id;
}

// Wave 5: --film uploads only the Home film made by admissions-film.mjs (trailer loop, posters,
// full film in two sizes) and fills the "Home film" global with it. Consent: every recognisable
// child in the film is authorised in writing (owner, 2026-11-10). "Show on the website" changes
// only with --publish; the transcripts are pasted in maarifcms (one per language).
if (process.argv.includes("--film")) {
  const { tmpdir } = await import("node:os");
  const dir = join(tmpdir(), "maarif-admissions-film");
  const alt = {
    trailer: { en: "Moments of school life at International Maarif Schools of Tunisia", fr: "Moments de la vie scolaire aux Écoles Internationales Maarif de Tunisie", ar: "لحظات من الحياة المدرسية في مدارس المعارف الدولية بتونس", tr: "Tunus Uluslararası Maarif Okulları'ndan okul yaşamı anları" },
    film: { en: "Film: our school in 3 minutes", fr: "Film : notre école en 3 minutes", ar: "فيلم: مدرستنا في 3 دقائق", tr: "Film: 3 dakikada okulumuz" },
  };
  const film = {};
  for (const [key, file, type, text] of [
    ["filmLandscape", "trailer-landscape.mp4", "video/mp4", alt.trailer],
    ["filmPortrait", "trailer-portrait.mp4", "video/mp4", alt.trailer],
    ["posterLandscape", "trailer-poster-landscape.webp", "image/webp", alt.trailer],
    ["posterPortrait", "trailer-poster-portrait.webp", "image/webp", alt.trailer],
    ["fullFilm", "film-720.mp4", "video/mp4", alt.film],
    ["fullFilmSmall", "film-480.mp4", "video/mp4", alt.film],
    ["fullFilmPoster", "film-poster.webp", "image/webp", alt.film],
  ]) {
    const path = join(dir, file);
    if (!existsSync(path)) throw new Error(`missing ${path}; run admissions-film.mjs first`);
    film[key] = await upload({ source: `admissions-film/${file}`, buffer: readFileSync(path), filename: file, type, alt: text, consent: "parental-authorization", focus: { x: 50, y: 50 } });
    console.log(`film  ${key.padEnd(18)} → media ${film[key]}`);
  }
  await api("/globals/home-hero", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(publish ? { ...film, published: true } : film) });
  // "Read what is said": one transcript per language (admissions-film-transcript.json).
  const transcript = JSON.parse(readFileSync(join(here, "admissions-film-transcript.json"), "utf8"));
  for (const locale of locales) {
    await api(`/globals/home-hero?locale=${locale}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ transcript: transcript[locale] }) });
  }
  console.log(`\nHome film ${publish ? "published" : "saved (not shown until a reviewer ticks Show on the website)"}, with its transcript in ${locales.join(", ")}.`);
  process.exit(0);
}

// 1. Photos: the wave 2 set (media-selection.json) and the wave 3 page photos (page-photos.json).
const pagePhotos = JSON.parse(readFileSync(join(here, "page-photos.json"), "utf8"));
const ids = {};
for (const photo of [...selection.photos, ...pagePhotos.photos]) {
  const { buffer } = await upright(photo, root);
  const jpeg = await sharp(buffer).resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  ids[photo.id] = await upload({
    source: `IMSTMEDIA/${photo.src}`,
    buffer: jpeg,
    filename: `${photo.id}.jpg`,
    type: "image/jpeg",
    alt: photo.alt,
    consent: consentOf[photo.consent],
    focus: { x: Math.round((photo.focus?.[0] ?? 0.5) * 100), y: Math.round((photo.focus?.[1] ?? 0.5) * 100) },
  });
  console.log(`photo ${photo.id.padEnd(26)} → media ${ids[photo.id]}`);
}

// 2. Home film and posters (built by hero-film.mjs).
const heroDir = join(app, "public", "media", "hero");
const heroAlt = { en: "Moments of school life", fr: "Moments de la vie scolaire", ar: "لحظات من الحياة المدرسية", tr: "Okul yaşamından anlar" };
const hero = {};
for (const [key, file, type] of [
  ["filmLandscape", "hero-landscape.mp4", "video/mp4"],
  ["filmPortrait", "hero-portrait.mp4", "video/mp4"],
  ["posterLandscape", "poster-landscape-1920.webp", "image/webp"],
  ["posterPortrait", "poster-portrait-720.webp", "image/webp"],
]) {
  const path = join(heroDir, file);
  if (!existsSync(path)) throw new Error(`missing ${path}; run hero-film.mjs first`);
  hero[key] = await upload({ source: `hero/${file}`, buffer: readFileSync(path), filename: file, type, alt: heroAlt, consent: "no-identifiable-child", focus: { x: 50, y: 50 } });
  console.log(`hero  ${key.padEnd(26)} → media ${hero[key]}`);
}
await api("/globals/home-hero", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...hero, published: publish }) });

// 3. Home page slots (the same places the site's Home code reads).
const slots = {
  "levels-kindergarten": "kindergarten-farm-corner",
  "levels-primary": "primary-microscope",
  "levels-lower-secondary": "secondary-archery",
  "levels-upper-secondary": "university-visit",
  "life-back-to-school": "back-to-school",
  "life-teachers-day": "teachers-day-staff",
  "life-archery": "archery-targets",
  "life-kind-words": "kind-words-paper",
  "life-teeth-brushing": "teeth-brushing-hands",
  "life-farm-trip": "farm-pond",
  "life-model-oic": "model-oic",
  "life-traditional-day": "traditional-day-ebru",
  "life-maarif-talks": "maarif-talks",
  "life-end-of-year": "end-of-year-stage",
  "life-graduation": "graduation-plaque",
  "life-pink-day": "pink-day-staff",
  // Cambridge section's circular gallery, in the order of its captions (components/landing/cambridge.tsx).
  "cambridge-1": "microscope-from-above",
  "cambridge-2": "microscope-hands",
  "cambridge-3": "kind-words-outline",
  "cambridge-4": "tracing-hands",
  "cambridge-5": "kindergarten-classroom",
  "cambridge-6": "teeth-brushing-hands",
  "cambridge-7": "pink-day-class",
  "cambridge-8": "graduation-plaque",
  // "Our journey": the school today (components/landing/journey.tsx).
  "journey-1": "graduation-plaque",
  "journey-2": "archery-targets",
  "journey-3": "maarif-talks",
  "journey-4": "back-to-school",
  "journey-5": "model-oic",
};
const mediaOf = (id) => {
  if (!ids[id]) throw new Error(`unknown photo id "${id}" (not in media-selection.json or page-photos.json)`);
  return ids[id];
};

// One "Page photos" document per page (created, or replaced with this plan).
async function savePageVisual(page, header, slotMap) {
  const doc = { page, header: header ? mediaOf(header) : null, slots: Object.entries(slotMap).map(([slot, id]) => ({ slot, image: mediaOf(id) })), _status: publish ? "published" : "draft" };
  const found = (await api(`/page-visuals?${new URLSearchParams({ "where[page][equals]": page, limit: "1", depth: "0", draft: "true" })}`)).docs?.[0];
  if (found) await api(`/page-visuals/${found.id}?draft=${!publish}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(doc) });
  else await api(`/page-visuals?draft=${!publish}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(doc) });
}

await savePageVisual("home", null, slots);
console.log(`\nHome photos ${publish ? "published" : "saved as a draft"}: ${Object.keys(slots).length} slots, film ${publish ? "shown" : "not shown yet"}.`);

// 4. Inner pages (wave 3): header photo and the row of photos band-1..3 (components/site/photo-band.tsx).
for (const [page, plan] of Object.entries(pagePhotos.pages)) {
  await savePageVisual(page, plan.header, Object.fromEntries((plan.band ?? []).map((id, i) => [`band-${i + 1}`, id])));
  console.log(`page  ${page.padEnd(26)} → header ${plan.header}, ${plan.band?.length ?? 0} in the row`);
}
console.log(`Inner pages ${publish ? "published" : "saved as drafts"}: ${Object.keys(pagePhotos.pages).length}.`);
