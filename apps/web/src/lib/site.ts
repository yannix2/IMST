import { locales, type Locale } from "@maarif/contracts/locales";
import { cmsOnlyPages, pageKeys, pathOf } from "./navigation";

// Absolute origin for canonical URLs, hreflang and sitemaps. Set SITE_URL per environment.
export const siteUrl = new URL(process.env.SITE_URL ?? "http://localhost:3000");

// Public paths that exist in every locale: Home and every built page of the navigation tree,
// except pages that wait for their CMS content (lib/navigation.ts).
export const localizedPaths: readonly string[] = ["", ...pageKeys.filter((k) => !cmsOnlyPages.has(k)).map(pathOf)];

export function localizedUrl(locale: Locale, path = ""): string {
  return new URL(`/${locale}${path}`, siteUrl).toString();
}

// hreflang alternates for one page, including x-default (the four-script entry page at "/").
export function languageAlternates(path = ""): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of locales) alternates[locale] = localizedUrl(locale, path);
  alternates["x-default"] = new URL(path || "/", siteUrl).toString();
  return alternates;
}
