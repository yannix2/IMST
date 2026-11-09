// Where ffmpeg lives: FFMPEG env var, then the winget install (Gyan.FFmpeg puts no link on
// some machines), then PATH.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

function find() {
  if (process.env.FFMPEG && existsSync(process.env.FFMPEG)) return process.env.FFMPEG;
  const winget = join(process.env.LOCALAPPDATA ?? "", "Microsoft", "WinGet");
  const link = join(winget, "Links", "ffmpeg.exe");
  if (existsSync(link)) return link;
  const packages = join(winget, "Packages");
  if (existsSync(packages)) {
    for (const pkg of readdirSync(packages).filter((d) => d.startsWith("Gyan.FFmpeg"))) {
      for (const build of readdirSync(join(packages, pkg))) {
        const exe = join(packages, pkg, build, "bin", "ffmpeg.exe");
        if (existsSync(exe)) return exe;
      }
    }
  }
  return "ffmpeg";
}

export const ffmpeg = find();
