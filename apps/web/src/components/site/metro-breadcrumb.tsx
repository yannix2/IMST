import type { Locale } from "@maarif/contracts/locales";
import { pageNames } from "@/i18n/pages";
import { pathOf, trailOf, type PageKey } from "@/lib/navigation";
import { siteUrl } from "@/lib/site";

// "You are here" drawn as a short metro line: Home, the area, the page, each a station on one
// track, the current page a larger turquoise station. The trail is a named view-transition
// element (.metro), so between two pages it stretches or shrinks instead of being redrawn.
// Right to left in Arabic, as the page flows. BreadcrumbList data for search engines below.

export function MetroBreadcrumb({ locale, page }: { locale: Locale; page: PageKey }) {
  const p = pageNames[locale];
  const trail = trailOf(page);
  const stops = [
    { href: `/${locale}`, label: p.ui.home },
    ...trail.map((key) => ({ href: `/${locale}${pathOf(key)}`, label: p.pages[key].title })),
  ];

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: stops.map((stop, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: stop.label,
      item: new URL(stop.href, siteUrl).toString(),
    })),
  };

  return (
    <nav aria-label={p.ui.breadcrumb}>
      <ol className="metro relative flex flex-wrap items-center gap-x-1 gap-y-2 text-sm">
        {stops.map((stop, i) => {
          const last = i === stops.length - 1;
          return (
            <li key={stop.href} className="flex items-center gap-1">
              {i > 0 ? <span aria-hidden="true" className="metro-track h-1 w-6 rounded-full bg-rule sm:w-10" /> : null}
              {last ? (
                <span aria-current="page" className="inline-flex min-h-9 items-center gap-2 rounded-full bg-mist px-3 font-medium text-heading">
                  <span aria-hidden="true" className="size-3 rounded-full bg-turquoise ring-4 ring-turquoise/25" />
                  {stop.label}
                </span>
              ) : (
                <a href={stop.href} className="inline-flex min-h-9 items-center gap-2 rounded-full px-2 text-slate no-underline hover:text-heading hover:underline">
                  <span aria-hidden="true" className="size-2.5 rounded-full border-2 border-slate bg-ground" />
                  {stop.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    </nav>
  );
}
