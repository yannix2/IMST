// Media inbox (wave 3, task A2). The owner keeps adding photos and videos to IMSTMEDIA; this
// finds what is new or changed since the last review, makes contact sheets for those files only,
// and writes a short report. Run it at the start of every work session and before choosing photos.
//
//   node inbox.mjs                 report + sheets for new/changed files (inventory unchanged)
//   node inbox.mjs --accept        mark everything currently in IMSTMEDIA as reviewed
//   node inbox.mjs --root <dir> --out <dir>
//
// inventory.json (next to this file, git-ignored: it stays on this computer) holds path, size and modification time of every
// reviewed file, relative to the media root; the files themselves are never committed.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const root = arg("--root", "E:\\IMST\\IMSTMEDIA");
const stamp = new Date().toISOString().slice(0, 10);
const out = arg("--out", join(os.tmpdir(), "maarif-media-inbox", stamp));
const accept = process.argv.includes("--accept");
const inventoryPath = join(here, "inventory.json");

const mediaExt = new Set([".jpg", ".jpeg", ".png", ".heic", ".webp", ".mov", ".mp4", ".m4v"]);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : mediaExt.has(extname(e.name).toLowerCase()) ? [join(dir, e.name)] : []));

const current = {};
for (const file of walk(root)) {
  const s = statSync(file);
  current[relative(root, file).split(sep).join("/")] = { size: s.size, mtime: Math.round(s.mtimeMs) };
}

const inventory = existsSync(inventoryPath) ? JSON.parse(readFileSync(inventoryPath, "utf8")) : null;

if (accept || !inventory) {
  writeFileSync(inventoryPath, JSON.stringify({ reviewed: stamp, files: current }, null, 1));
  console.log(`${inventory ? "Accepted" : "Baseline created"}: ${Object.keys(current).length} files marked as reviewed (${stamp}).`);
  process.exit(0);
}

const seen = inventory.files;
const added = Object.keys(current).filter((f) => !seen[f]);
const changed = Object.keys(current).filter((f) => seen[f] && (seen[f].size !== current[f].size));
const removed = Object.keys(seen).filter((f) => !current[f]);

const byFolder = (list) =>
  list.reduce((acc, f) => {
    const folder = f.split("/").slice(0, -1).join("/");
    (acc[folder] ??= []).push(f);
    return acc;
  }, {});

const lines = [`# Media inbox ${stamp}`, "", `Last review: ${inventory.reviewed}. Now ${Object.keys(current).length} files.`, ""];
lines.push(`- New: ${added.length}`, `- Changed: ${changed.length}`, `- Removed: ${removed.length}`, "");
for (const [title, list] of [
  ["New", added],
  ["Changed", changed],
  ["Removed", removed],
]) {
  if (!list.length) continue;
  lines.push(`## ${title}`);
  for (const [folder, files] of Object.entries(byFolder(list))) {
    const kinds = files.reduce((n, f) => ((n[extname(f).toLowerCase()] = (n[extname(f).toLowerCase()] ?? 0) + 1), n), {});
    lines.push(`- ${folder}: ${files.length} (${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")})`);
  }
  lines.push("");
}

mkdirSync(out, { recursive: true });
const fresh = [...added, ...changed];
if (fresh.length) {
  const listFile = join(out, "new-files.json");
  writeFileSync(listFile, JSON.stringify(fresh, null, 1));
  try {
    execFileSync(process.execPath, [join(here, "contact-sheets.mjs"), root, join(out, "sheets"), "--files", listFile, "--per-folder", "60"], { stdio: "inherit" });
    lines.push(`Contact sheets: ${join(out, "sheets")}`);
  } catch (err) {
    lines.push(`Contact sheets failed: ${err.message}`);
  }
  lines.push("", "After reviewing (and choosing photos), run `node inbox.mjs --accept`.");
} else {
  lines.push("Nothing new since the last review.");
}

const report = lines.join("\n");
writeFileSync(join(out, "inbox.md"), report);
console.log(report);
console.log(`\nReport: ${join(out, "inbox.md")}`);
