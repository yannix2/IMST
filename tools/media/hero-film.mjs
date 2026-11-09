// The Home hero loop (wave 2, task 1.4; owner decision 2026-11-06: a photo motion film, because
// the school's video footage shows students' faces). Each approved hero photo is cropped around
// its subject at twice the output size (smooth sub-pixel motion), given a slow zoom or pan, and
// joined with soft crossfades. The first shot is repeated at the end and the film is trimmed by
// one fade at both ends, so the last frame flows into the first: the loop has no seam.
//
//   node hero-film.mjs [--root E:\IMST\IMSTMEDIA]
//
// Writes apps/web/public/media/hero/: hero-landscape.mp4 (1920x1080), hero-portrait.mp4 (720x1280),
// poster-landscape-{960,1920}.{avif,webp}, poster-portrait-720.{avif,webp}.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ffmpeg } from "./ffmpeg.mjs";
import { mediaRoot, upright } from "./source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "apps", "web", "public", "media", "hero");
const tmp = join(os.tmpdir(), "maarif-hero");
const root = mediaRoot();
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(out, { recursive: true });

const selection = JSON.parse(readFileSync(join(here, "media-selection.json"), "utf8"));
const shots = selection.hero.map((id) => selection.photos.find((p) => p.id === id));

const FPS = 30;
const SHOT = 3.0; // seconds each photo is on screen, fades included (owner: faster, 2026-11-06)
const FADE = 0.6;
const ZOOM = 0.08; // 8 % over one shot: calm, never dizzy

const formats = [
  { name: "landscape", w: 1920, h: 1080, crf: 28, maxMB: 4 },
  { name: "portrait", w: 720, h: 1280, crf: 27, maxMB: 2.5 },
];

// Largest box of the target aspect inside the photo, centred on its focus, clamped to the edges.
function box(width, height, aspect, [fx, fy]) {
  let w = width;
  let h = Math.round(w / aspect);
  if (h > height) {
    h = height;
    w = Math.round(h * aspect);
  }
  const left = Math.min(Math.max(Math.round(fx * width - w / 2), 0), width - w);
  const top = Math.min(Math.max(Math.round(fy * height - h / 2), 0), height - h);
  return { left, top, width: w, height: h };
}

// Motion per shot, in turn: zoom in, pan, zoom out, pan back.
function motion(i, frames) {
  const t = `(on/${frames - 1})`;
  const centre = { x: "(iw-iw/zoom)/2", y: "(ih-ih/zoom)/2" };
  switch (i % 4) {
    case 0:
      return { z: `1+${ZOOM}*${t}`, ...centre };
    case 1:
      return { z: `${1 + ZOOM}`, x: `(iw-iw/zoom)*${t}`, y: centre.y };
    case 2:
      return { z: `${1 + ZOOM}-${ZOOM}*${t}`, ...centre };
    default:
      return { z: `${1 + ZOOM}`, x: `(iw-iw/zoom)*(1-${t})`, y: centre.y };
  }
}

const run = (args) => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });

for (const f of formats) {
  const frames = Math.round(SHOT * FPS);
  const clips = [];
  for (const [i, photo] of shots.entries()) {
    const src = await upright(photo, root);
    const b = box(src.width, src.height, f.w / f.h, photo.focus ?? [0.5, 0.5]);
    const still = join(tmp, `${f.name}-${i}.png`);
    await sharp(src.buffer).extract(b).resize(f.w * 2, f.h * 2, { kernel: "lanczos3" }).png().toFile(still);
    const m = motion(i, frames);
    const clip = join(tmp, `${f.name}-${i}.mp4`);
    run([
      "-loop", "1", "-framerate", String(FPS), "-t", String(SHOT), "-i", still,
      "-vf", `zoompan=z='${m.z}':x='${m.x}':y='${m.y}':d=1:s=${f.w}x${f.h}:fps=${FPS},format=yuv420p`,
      "-frames:v", String(frames), "-c:v", "libx264", "-crf", "12", "-preset", "veryfast", clip,
    ]);
    clips.push(clip);
  }
  clips.push(clips[0]); // the first shot again, so the end fades into the start

  const inputs = clips.flatMap((c) => ["-i", c]);
  const step = SHOT - FADE;
  let chain = "";
  let last = "[0:v]";
  for (let k = 1; k < clips.length; k++) {
    const label = `[x${k}]`;
    chain += `${last}[${k}:v]xfade=transition=fade:duration=${FADE}:offset=${(k * step).toFixed(3)}${label};`;
    last = label;
  }
  const length = shots.length * step;
  chain += `${last}trim=start=${FADE}:duration=${length.toFixed(3)},setpts=PTS-STARTPTS[v]`;
  const film = join(out, `hero-${f.name}.mp4`);
  run([
    ...inputs, "-filter_complex", chain, "-map", "[v]", "-an",
    "-c:v", "libx264", "-preset", "slow", "-crf", String(f.crf), "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", film,
  ]);
  const mb = statSync(film).size / 1e6;
  console.log(`${f.name}: ${length.toFixed(1)} s, ${mb.toFixed(2)} MB${mb > f.maxMB ? `  OVER ${f.maxMB} MB` : ""}`);

  // Poster = the film's first frame (what the visitor sees before it plays, and under reduced motion).
  const first = join(tmp, `${f.name}-poster.png`);
  run(["-i", film, "-frames:v", "1", first]);
  const sizes = f.name === "landscape" ? [960, 1920] : [720];
  for (const w of sizes) {
    const base = join(out, `poster-${f.name}-${w}`);
    await sharp(first).resize({ width: w }).avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`);
    await sharp(first).resize({ width: w }).webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`);
  }
}
console.log(`written to ${out}`);
