import type { MetadataRoute } from "next";
import { locales } from "@maarif/contracts/locales";
import { languageAlternates, localizedPaths, localizedUrl } from "@/lib/site";

// One entry per locale and path, each listing its language alternates.
// CMS pages join this list once maarif-api exposes published, proofread slugs.
export default function sitemap(): MetadataRoute.Sitemap {
  return localizedPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, path),
      alternates: { languages: languageAlternates(path) },
    })),
  );
}
