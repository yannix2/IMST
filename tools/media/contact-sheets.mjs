// Contact sheets for choosing the site's photos and hero-video shots (wave 2, task 1.1).
// Reads the school's own media (never committed), writes numbered thumbnail grids outside the
// repo so the owner can approve a selection. Each sheet has an index file mapping numbers to files.
//
//   node contact-sheets.mjs <media-root> <out-dir> [--per-folder 48] [--only "Teachers Day"]
//                          [--files list.json]   (only these files, paths relative to media-root;
//                                                 written by inbox.mjs for new media)
//
// Photos: JPG/PNG via sharp, HEIC via heic-convert. Videos (.MOV/.MP4): three frames per clip
// (10%, 50%, 90%) via ffmpeg, one row per clip.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import os from "node:os";
import sharp from "sharp";
import heicConvert from "heic-convert";

const [root, out, ...rest] = process.argv.slice(2);
if (!root || !out) {
  console.error("usage: node contact-sheets.mjs <media-root> <out-dir> [--per-folder N] [--only name]");
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : fallback;
};
const perFolder = Number(flag("--per-folder", 48));
const only = flag("--only", null);
const listFile = flag("--files", null);
const onlyFiles = listFile ? new Set(JSON.parse(readFileSync(listFile, "utf8")).map((f) => join(root, f))) : null;

// Owner decision 2026-11-06: close-up portraits of children are never used, so not even shown.
const excluded = [/portraits/i];

const photoExt = new Set([".jpg", ".jpeg", ".png", ".heic"]);
const videoExt = new Set([".mov", ".mp4"]);
const TILE = 260;
const COLS = 8;

import { ffmpeg } from "./ffmpeg.mjs";

function* folders(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => join(dir, e.name)).filter((f) => !onlyFiles || onlyFiles.has(f));
  if (files.length) yield { dir, files };
  for (const e of entries) if (e.isDirectory()) yield* folders(join(dir, e.name));
}

// Evenly spaced sample, so a folder of 200 shots is still represented end to end.
const sample = (list, n) => (list.length <= n ? list : Array.from({ length: n }, (_, i) => list[Math.floor((i * list.length) / n)]));

async function photoBuffer(file) {
  if (extname(file).toLowerCase() === ".heic") {
    const jpg = await heicConvert({ buffer: readFileSync(file), format: "JPEG", quality: 0.8 });
    return Buffer.from(jpg);
  }
  return readFileSync(file);
}

const label = (text) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="28"><rect width="100%" height="100%" fill="#0b2a47" opacity=".82"/><text x="8" y="20" font-family="Arial" font-size="16" font-weight="700" fill="#fff">${text}</text></svg>`,
  );

async function tile(input, text) {
  const img = await sharp(input).rotate().resize(TILE, TILE, { fit: "cover" }).toBuffer();
  return sharp(img).composite([{ input: label(text), top: TILE - 28, left: 0 }]).jpeg({ quality: 78 }).toBuffer();
}

async function sheet(tiles, cols, file) {
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * TILE, height: rows * TILE, channels: 3, background: "#ffffff" } })
    .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * TILE, top: Math.floor(i / cols) * TILE })))
    .jpeg({ quality: 80 })
    .toFile(file);
}

// ffmpeg -i with no output exits non-zero and prints the duration on stderr.
function duration(video) {
  try {
    execFileSync(ffmpeg, ["-hide_banner", "-i", video], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    const m = String(err.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  return 0;
}

function grab(video, seconds, target) {
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", seconds.toFixed(2), "-i", video, "-frames:v", "1", "-vf", "scale=640:-2", target], {
    stdio: "ignore",
  });
  return readFileSync(target);
}

mkdirSync(out, { recursive: true });
const tmp = join(os.tmpdir(), "maarif-sheets");
mkdirSync(tmp, { recursive: true });
const index = [];

for (const { dir, files } of folders(root)) {
  const rel = relative(root, dir);
  if (excluded.some((re) => re.test(rel))) continue;
  if (only && !rel.toLowerCase().includes(only.toLowerCase())) continue;
  const slug = rel.replace(/[\\/]+/g, "__").replace(/[^\w.-]+/g, "-");

  const photos = sample(files.filter((f) => photoExt.has(extname(f).toLowerCase())).sort(), perFolder);
  if (photos.length) {
    const tiles = [];
    const map = {};
    for (const [i, f] of photos.entries()) {
      const n = `P${i + 1}`;
      try {
        tiles.push(await tile(await photoBuffer(f), `${n}  ${basename(f).slice(0, 22)}`));
        map[n] = relative(root, f);
      } catch (err) {
        console.warn(`skip ${f}: ${err.message}`);
      }
    }
    const file = join(out, `${slug}__photos.jpg`);
    await sheet(tiles, COLS, file);
    index.push({ folder: rel, sheet: basename(file), total: files.length, shown: tiles.length, items: map });
    console.log(`photos  ${rel}: ${tiles.length}/${files.length}`);
  }

  const videos = files.filter((f) => videoExt.has(extname(f).toLowerCase())).sort();
  if (videos.length) {
    const tiles = [];
    const map = {};
    for (const [i, v] of videos.entries()) {
      const n = `V${i + 1}`;
      const d = duration(v);
      if (!d) {
        console.warn(`skip ${v}: no duration (is ffmpeg installed?)`);
        continue;
      }
      for (const [k, at] of [0.1, 0.5, 0.9].entries()) {
        const buf = grab(v, d * at, join(tmp, `f${k}.jpg`));
        tiles.push(await tile(buf, `${n}.${k + 1}  ${d.toFixed(0)}s  ${basename(v).slice(9, 17)}`));
      }
      map[n] = { file: relative(root, v), seconds: Number(d.toFixed(1)), megabytes: Number((statSync(v).size / 1e6).toFixed(1)) };
    }
    if (tiles.length) {
      const file = join(out, `${slug}__videos.jpg`);
      await sheet(tiles, 6, file);
      index.push({ folder: rel, sheet: basename(file), total: videos.length, shown: Object.keys(map).length, items: map });
      console.log(`videos  ${rel}: ${Object.keys(map).length}`);
    }
  }
}

writeFileSync(join(out, "index.json"), JSON.stringify(index, null, 2));
console.log(`\n${index.length} sheets in ${out}`);
