// Loads the wave 3 draft texts (drafts-content.mjs) into maarifcms as UNPUBLISHED drafts: the
// Privacy, Cookie and Terms notices (Pages), four clubs and the 14 field trips. English and French
// are filled; Arabic and Turkish stay empty with status "draft". Translation status stays "Draft"
// in every language, so nothing appears on the site until a reviewer sets it to Ready and publishes.
// Safe to run again: anything that already exists (same slug or English name) is left untouched,
// so staff edits are never overwritten.
//
//   CMS_URL=https://cms.yassinekhiari.download CMS_EMAIL=... CMS_PASSWORD=... node seed-drafts.mjs

import { clubs, legal, trips } from "./drafts-content.mjs";

const CMS = process.env.CMS_URL ?? "http://localhost:3000";
if (!process.env.CMS_EMAIL || !process.env.CMS_PASSWORD) {
  console.error("Set CMS_EMAIL and CMS_PASSWORD (an editor, reviewer or administrator account).");
  process.exit(1);
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

async function api(path, init = {}) {
  const response = await fetch(`${CMS}/cms-api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}), authorization: `JWT ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

// Blocks → Lexical JSON (the editor maarifcms uses).
const text = (t) => ({ type: "text", text: t, format: 0, detail: 0, mode: "normal", style: "", version: 1 });
const base = { format: "", indent: 0, version: 1, direction: "ltr" };
function lexical(blocks) {
  return {
    root: {
      type: "root",
      ...base,
      children: blocks.map(([kind, value]) => {
        if (kind === "h2") return { type: "heading", tag: "h2", ...base, children: [text(value)] };
        if (kind === "ul")
          return { type: "list", listType: "bullet", tag: "ul", start: 1, ...base, children: value.map((item, i) => ({ type: "listitem", value: i + 1, ...base, children: [text(item)] })) };
        return { type: "paragraph", textFormat: 0, ...base, children: [text(value)] };
      }),
    },
  };
}

async function findOne(collection, field, value) {
  const q = new URLSearchParams({ [`where[${field}][equals]`]: value, locale: "en", draft: "true", limit: "1", depth: "0" });
  return (await api(`/${collection}?${q}`)).docs?.[0] ?? null;
}

// Create in English, then add French; other languages stay empty and "draft".
async function createDraft(collection, en, fr) {
  const created = await api(`/${collection}?locale=en&draft=true`, { method: "POST", body: JSON.stringify({ ...en, _status: "draft", translationStatus: "draft" }) });
  const id = created.doc.id;
  await api(`/${collection}/${id}?locale=fr&draft=true`, { method: "PATCH", body: JSON.stringify({ ...fr, _status: "draft", translationStatus: "draft" }) });
  return id;
}

let made = 0;
let kept = 0;

for (const [slug, versions] of Object.entries(legal)) {
  if (await findOne("pages", "slug", slug)) {
    kept++;
    console.log(`page  ${slug.padEnd(28)} exists, left as is`);
    continue;
  }
  const page = (v) => ({ title: v.title, slug, body: lexical(v.body), seo: { title: v.title.slice(0, 60), description: v.seo.slice(0, 155) } });
  const id = await createDraft("pages", page(versions.en), page(versions.fr));
  made++;
  console.log(`page  ${slug.padEnd(28)} draft ${id}`);
}

for (const club of clubs) {
  if (await findOne("clubs", "name", club.en.name)) {
    kept++;
    console.log(`club  ${club.en.name.padEnd(28)} exists, left as is`);
    continue;
  }
  const id = await createDraft("clubs", { ...club.en, order: club.order }, club.fr);
  made++;
  console.log(`club  ${club.en.name.padEnd(28)} draft ${id}`);
}

for (const trip of trips) {
  if (await findOne("trips", "destination", trip.en.destination)) {
    kept++;
    console.log(`trip  ${trip.en.destination.padEnd(28)} exists, left as is`);
    continue;
  }
  const id = await createDraft("trips", { ...trip.en, order: trip.order }, trip.fr);
  made++;
  console.log(`trip  ${trip.en.destination.padEnd(28)} draft ${id}`);
}

console.log(`\n${made} drafts created, ${kept} already there. Nothing is published: complete each draft in maarifcms, set its language to Ready, then a reviewer publishes it.`);
