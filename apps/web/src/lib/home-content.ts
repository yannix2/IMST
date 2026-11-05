import type { HomeContent } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";

// Everything the Home page fills from maarifcms arrives in one request to maarif-api, made the
// first time any of those sections comes near the screen and shared by all of them.
// `null` means maarif-api could not be reached: production then hides the sections, while
// development shows each section's marked preview.
const pending = new Map<Locale, Promise<HomeContent | null>>();

export function loadHomeContent(locale: Locale): Promise<HomeContent | null> {
  let request = pending.get(locale);
  if (!request) {
    request = fetch(`/api/content/home?locale=${locale}`, { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? (r.json() as Promise<HomeContent>) : null))
      .catch(() => null);
    pending.set(locale, request);
  }
  return request;
}

export const showPreviews = process.env.NODE_ENV === "development";
