// The four launch languages (product.md section 8). URLs are /{locale}/...;
// "/" is the x-default address: it redirects to the visitor's language (see negotiateLocale).

export const locales = ["en", "fr", "ar", "tr"] as const;
export type Locale = (typeof locales)[number];

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  fr: "ltr",
  ar: "rtl",
  tr: "ltr",
};

// Each language named in its own script, as the switcher shows it (DESIGN.md, The Four Scripts Rule).
export const localeNativeName: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  tr: "Türkçe",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const defaultLocale: Locale = "en";

// Cookie that remembers the language a visitor last read the site in.
export const localeCookie = "maarif-locale";

/**
 * Picks the language for "/": the visitor's remembered choice first, then the browser's
 * Accept-Language list by quality (only the primary subtag counts, so fr-TN is fr), then English.
 * Crawlers send no Accept-Language and land on English; every language links to the others.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined, remembered?: string | null): Locale {
  if (remembered && isLocale(remembered)) return remembered;
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .slice(0, 32)
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number(q.slice(2)) : 1;
      return { lang: tag.trim().toLowerCase().split("-")[0] ?? "", quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { lang } of ranked) if (isLocale(lang)) return lang;
  return defaultLocale;
}
