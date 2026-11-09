// Reading the school's originals: HEIC to JPEG, upright (EXIF orientation), cropped by fractions.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import heicConvert from "heic-convert";

export const mediaRoot = (argv = process.argv) => {
  const i = argv.indexOf("--root");
  return i > 0 ? argv[i + 1] : "E:\\IMST\\IMSTMEDIA";
};

async function load(file) {
  const raw = readFileSync(file);
  return file.toLowerCase().endsWith(".heic") ? Buffer.from(await heicConvert({ buffer: raw, format: "JPEG", quality: 0.92 })) : raw;
}

// "2025:10:21 08:19:37" anywhere in the EXIF block -> "2025-10-21".
function takenOn(exif) {
  const m = exif?.toString("latin1").match(/(20\d\d):(\d\d):(\d\d) \d\d:\d\d:\d\d/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** The photo upright and cropped, as an encoded buffer plus its size and capture date. */
export async function upright(photo, root) {
  const buf = await load(join(root, photo.src));
  const meta = await sharp(buf).metadata();
  const turned = await sharp(buf).rotate().toBuffer({ resolveWithObject: true });
  let { width, height } = turned.info;
  let img = sharp(turned.data);
  if (photo.crop) {
    const c = photo.crop;
    const box = { left: Math.round(c.left * width), top: Math.round(c.top * height), width: Math.round(c.width * width), height: Math.round(c.height * height) };
    img = img.extract(box);
    ({ width, height } = box);
  }
  return { buffer: await img.jpeg({ quality: 95 }).toBuffer(), width, height, date: takenOn(meta.exif) ?? fromName(photo.src) };
}

// iPhone exports ("20261013_115420000_iOS") and WhatsApp files ("WhatsApp Image 2025-11-21 at ...",
// the day it was sent) carry the date in the name when HEIC conversion or WhatsApp dropped the EXIF.
function fromName(src) {
  const name = src.split(/[\\/]/).pop();
  const ios = name.match(/^(20\d\d)(\d\d)(\d\d)_/);
  if (ios) return `${ios[1]}-${ios[2]}-${ios[3]}`;
  const wa = name.match(/WhatsApp Image (20\d\d-\d\d-\d\d)/);
  return wa ? wa[1] : null;
}
