// The Home film (wave 5, owner decisions 2026-11-10): from the school's admissions film, a silent
// trailer that loops behind the Home headline, and the full film people open with "Watch the film".
// Shots and crop come from admissions-film.json. The film's English subtitles are burned in, so the
// trailer keeps only the top of the picture (`keep`); the full film is re-encoded unchanged.
// The outputs go to a temporary folder and are uploaded to maarifcms (upload-to-cms.mjs --film):
// the repository is public and the film shows children, so nothing here is committed.
//
//   node admissions-film.mjs [--root E:\IMST\IMSTMEDIA] [--sheet] [--trailer-only]
//
// --sheet only writes a contact sheet of the trailer shots (one frame each, in order) to approve.
// Writes %TEMP%\maarif-admissions-film\: trailer-landscape.mp4 (1920x1080, ≤ 4 MB),
// trailer-portrait.mp4 (720x1280, ≤ 2.5 MB), trailer-poster-landscape.webp, trailer-poster-portrait.webp,
// film-720.mp4 (≤ 28 MB), film-480.mp4 (≤ 15 MB), film-poster.webp. Exits with an error if a file
// is over its budget.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ffmpeg } from "./ffmpeg.mjs";
import { mediaRoot } from "./source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(readFileSync(join(here, "admissions-film.json"), "utf8"));
const src = join(mediaRoot(), plan.source);
export const filmOut = join(os.tmpdir(), "maarif-admissions-film");
const work = join(filmOut, "work");
const sheetOnly = process.argv.includes("--sheet");
const trailerOnly = process.argv.includes("--trailer-only");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const FPS = 30;
// One thread and a short lookahead per encode: libx264 at full width otherwise reserves more
// memory than a busy Windows machine can commit ("malloc failed", 2026-11-11). Slower, same quality.
const lean = ["-threads", "1", "-x264-params", "rc-lookahead=12:ref=3"];
const run = (args) => {
  const encodes = args.includes("libx264");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args.slice(0, -1), ...(encodes ? lean : ["-threads", "1"]), args.at(-1)], {
    stdio: ["ignore", "inherit", "inherit"],
  });
};
const mb = (file) => statSync(file).size / 1e6;
const over = [];
function budget(file, max) {
  const size = mb(file);
  console.log(`${file.split(/[\\/]/).pop().padEnd(32)} ${size.toFixed(2)} MB${size > max ? `  OVER ${max} MB` : ""}`);
  if (size > max) over.push(file);
}

// Crop of the kept band (above the subtitles) to the target aspect, centred on x for tall crops.
function crop(aspect, x) {
  const h = `ih*${plan.keep}`;
  if (aspect >= 16 / 9) return `crop=w=iw:h=${h}:x=0:y=0`;
  const w = `(${h})*${aspect.toFixed(5)}`;
  return `crop=w=${w}:h=${h}:x=max(0\\,min(iw-${w}\\,iw*${x}-(${w})/2)):y=0`;
}

const formats = [
  { name: "landscape", w: 1920, h: 1080, maxMB: 4 },
  { name: "portrait", w: 720, h: 1280, maxMB: 2.5 },
];

if (sheetOnly) {
  const frames = [];
  for (const [i, shot] of plan.shots.entries()) {
    const frame = join(work, `sheet-${i}.png`);
    run(["-ss", String(shot.start + shot.duration / 2), "-i", src, "-frames:v", "1", "-vf", `${crop(16 / 9, shot.x)},scale=640:360:force_original_aspect_ratio=increase,crop=640:360`, frame]);
    frames.push(frame);
  }
  const cols = 5;
  const rows = Math.ceil(frames.length / cols);
  const sheet = join(filmOut, "trailer-shots.jpg");
  await sharp({ create: { width: cols * 640, height: rows * 360, channels: 3, background: "#103b65" } })
    .composite(frames.map((f, i) => ({ input: f, left: (i % cols) * 640, top: Math.floor(i / cols) * 360 })))
    .jpeg({ quality: 80 })
    .toFile(sheet);
  console.log(`contact sheet: ${sheet}`);
  plan.shots.forEach((s, i) => console.log(`${String(i + 1).padStart(2)}. ${s.start.toFixed(1).padStart(6)} s  ${s.what}`));
  process.exit(0);
}

// ---- Trailer: each shot cut, cropped, scaled; joined with the editor's own hard cuts ---------------
for (const f of formats) {
  const list = [];
  for (const [i, shot] of plan.shots.entries()) {
    const clip = join(work, `${f.name}-${i}.mp4`);
    run([
      "-ss", String(shot.start), "-t", String(shot.duration), "-i", src, "-an",
      "-vf", `${crop(f.w / f.h, shot.x)},scale=${f.w}:${f.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${f.w}:${f.h},fps=${FPS},format=yuv420p`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", clip,
    ]);
    list.push(`file '${clip.replace(/\\/g, "/")}'`);
  }
  const listFile = join(work, `${f.name}.txt`);
  writeFileSync(listFile, list.join("\n"));
  const trailer = join(filmOut, `trailer-${f.name}.mp4`);
  // Real footage (drone shots, foliage) is far heavier than the old photo loop: two passes aimed
  // at 90 % of the budget give the best picture the size allows.
  const seconds = plan.shots.reduce((n, s) => n + s.duration, 0);
  const kbps = Math.floor((f.maxMB * 0.9 * 8000) / seconds);
  const passlog = join(work, `${f.name}-pass`);
  const common = ["-f", "concat", "-safe", "0", "-i", listFile, "-an", "-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.6)}k`, "-bufsize", `${kbps * 2}k`, "-profile:v", "high", "-pix_fmt", "yuv420p", "-passlogfile", passlog];
  run([...common, "-pass", "1", "-f", "mp4", os.devNull]);
  run([...common, "-pass", "2", "-movflags", "+faststart", trailer]);
  budget(trailer, f.maxMB);
  // Poster = the trailer's first frame (first paint, reduced motion, Save-Data).
  const first = join(work, `${f.name}-poster.png`);
  run(["-i", trailer, "-frames:v", "1", first]);
  await sharp(first).webp({ quality: 76, effort: 5 }).toFile(join(filmOut, `trailer-poster-${f.name}.webp`));
}

// ---- Full film: re-encoded for the web, sound kept ----------------------------------------------
if (!trailerOnly) {
  // Two passes aimed at 90 % of each budget (the 720p file must stay under maarifcms's 30 MB).
  for (const v of [
    { name: "film-720", h: 720, audioKbps: 96, maxMB: 28 },
    { name: "film-480", h: 480, audioKbps: 64, maxMB: 15 },
  ]) {
    const film = join(filmOut, `${v.name}.mp4`);
    const kbps = Math.floor((v.maxMB * 0.9 * 8000) / plan.length) - v.audioKbps;
    const passlog = join(work, `${v.name}-pass`);
    const video = ["-vf", `scale=-2:${v.h}:flags=lanczos,format=yuv420p`, "-c:v", "libx264", "-preset", "slow", "-b:v", `${kbps}k`, "-maxrate", `${kbps * 2}k`, "-bufsize", `${kbps * 2}k`, "-profile:v", "high", "-passlogfile", passlog];
    run(["-i", src, "-map", "0:v:0", ...video, "-pass", "1", "-an", "-f", "mp4", os.devNull]);
    run(["-i", src, "-map", "0:v:0", "-map", "0:a:0", ...video, "-pass", "2", "-c:a", "aac", "-b:a", `${v.audioKbps}k`, "-ac", "2", "-movflags", "+faststart", film]);
    budget(film, v.maxMB);
  }
  // Poster: the drone shot over the building (first shot of the trailer), uncropped.
  const still = join(work, "film-poster.png");
  run(["-ss", String(plan.shots[0].start + 0.8), "-i", src, "-frames:v", "1", still]);
  await sharp(still).resize({ width: 1600 }).webp({ quality: 76, effort: 5 }).toFile(join(filmOut, "film-poster.webp"));
}

rmSync(work, { recursive: true, force: true });
console.log(`written to ${filmOut}`);
if (over.length) {
  console.error(`over budget: ${over.join(", ")}`);
  process.exit(1);
}
