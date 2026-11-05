import type { Metadata } from "next";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { cmsOnlyPages, pathOf, type PageKey } from "./navigation";
import { languageAlternates, localizedUrl } from "./site";

// Title, description, canonical address and language alternates for one inner page. Pages
// waiting for their CMS content are kept out of search results until it is published.
export function pageMetadata(locale: Locale, key: PageKey, description?: string): Metadata {
  const name = pageNames[locale].pages[key];
  const path = pathOf(key);
  const title = `${name.title} | ${messages[locale].schoolName}`;
  const text = description ?? name.blurb;
  return {
    title,
    description: text,
    alternates: { canonical: localizedUrl(locale, path), languages: languageAlternates(path) },
    openGraph: { title, description: text, locale, type: "website", url: localizedUrl(locale, path) },
    robots: cmsOnlyPages.has(key) ? { index: false, follow: true } : undefined,
  };
}
