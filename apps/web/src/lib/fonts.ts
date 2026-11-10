import { Bricolage_Grotesque, Figtree } from "next/font/google";
import localFont from "next/font/local";

// Owner decision 2026-11-05: English, French and Turkish read in Bricolage Grotesque
// (headlines) and Figtree (body); Arabic keeps Readex Pro. globals.css routes them by :lang(),
// so a word in another script inside a page (the hero's companion scripts, the footer's four
// school names) always gets its own face. next/font downloads the files at build time and
// serves them from our own origin: no request to Google from visitors' browsers.
// latin-ext carries Turkish (ğ ş ı İ) and French accents beyond Latin-1.

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  display: "swap",
  variable: "--font-bricolage",
});

export const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-figtree",
});

// Readex Pro is self-hosted (2026-11-10): on GitHub's build machines Google started answering with
// font addresses that Turbopack cannot resolve ("next/font/google queries have exactly one entry"),
// which stopped the deploy. src/fonts/readex-pro holds the exact v27 files next/font/google served
// (same bytes), declared as before: one face per subset with Google's unicode-range, weights
// 400/500/700 from the same variable file, Google's metric fallback ("Readex Pro Fallback" in
// globals.css). The four families are stacked in --font-readex there.
// display "optional" (wave 3, F2): the metric fallback does not match Arabic letters, so a late
// swap moved Arabic headings (CLS 0.0036 on /ar pages). Only the Arabic file is preloaded and
// usually arrives within the browser's short wait; if not, that one visit keeps the fallback.
// (next/font needs literal values: no helper for the three weights.)
export const readexArabic = localFont({
  src: [
    { path: "../fonts/readex-pro/arabic.woff2", weight: "400", style: "normal" },
    { path: "../fonts/readex-pro/arabic.woff2", weight: "500", style: "normal" },
    { path: "../fonts/readex-pro/arabic.woff2", weight: "700", style: "normal" },
  ],
  display: "optional",
  adjustFontFallback: false,
  variable: "--font-readex-arabic",
  declarations: [{ prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EC2-10EC7, U+10EC9-10EEE, U+10EF0-10EFF, U+1EE00-1EEFF" }],
});
const readexLatin = localFont({
  src: [
    { path: "../fonts/readex-pro/latin.woff2", weight: "400", style: "normal" },
    { path: "../fonts/readex-pro/latin.woff2", weight: "500", style: "normal" },
    { path: "../fonts/readex-pro/latin.woff2", weight: "700", style: "normal" },
  ],
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-readex-latin",
  declarations: [{ prop: "unicode-range", value: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }],
});
const readexLatinExt = localFont({
  src: [
    { path: "../fonts/readex-pro/latin-ext.woff2", weight: "400", style: "normal" },
    { path: "../fonts/readex-pro/latin-ext.woff2", weight: "500", style: "normal" },
    { path: "../fonts/readex-pro/latin-ext.woff2", weight: "700", style: "normal" },
  ],
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-readex-latin-ext",
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
});
const readexVietnamese = localFont({
  src: [
    { path: "../fonts/readex-pro/vietnamese.woff2", weight: "400", style: "normal" },
    { path: "../fonts/readex-pro/vietnamese.woff2", weight: "500", style: "normal" },
    { path: "../fonts/readex-pro/vietnamese.woff2", weight: "700", style: "normal" },
  ],
  display: "optional",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-readex-vietnamese",
  declarations: [{ prop: "unicode-range", value: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB" }],
});

export const fontVariables = [bricolage, figtree, readexArabic, readexLatin, readexLatinExt, readexVietnamese].map((f) => f.variable).join(" ");
