import { Bricolage_Grotesque, Figtree, Readex_Pro } from "next/font/google";

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

// Arabic letters only: digits are Western (0 to 9) and come from Figtree.
// display "optional" (wave 3, F2): the metric fallback does not match Arabic letters, so a late
// swap moved Arabic headings (CLS 0.0036 on /ar pages). The file is preloaded and usually arrives
// within the browser's short wait; if not, that one visit keeps the fallback and nothing moves.
export const readexPro = Readex_Pro({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "optional",
  variable: "--font-readex",
});

export const fontVariables = `${bricolage.variable} ${figtree.variable} ${readexPro.variable}`;
