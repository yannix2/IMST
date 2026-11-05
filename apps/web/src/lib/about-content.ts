import type { AboutContent } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";

// The About pages' CMS parts (centre number, people), fetched once per locale through
// maarif-api when a slot that needs them comes near. `null` means the API could not be
// reached: the slots then stay hidden (development shows marked previews, as on Home).
const pending = new Map<Locale, Promise<AboutContent | null>>();

export function loadAboutContent(locale: Locale): Promise<AboutContent | null> {
  let request = pending.get(locale);
  if (!request) {
    request = fetch(`/api/content/about?locale=${locale}`, { headers: { accept: "application/json" } })
      .then((r) => (r.ok ? (r.json() as Promise<AboutContent>) : null))
      .catch(() => null);
    pending.set(locale, request);
  }
  return request;
}
