import { locales, localeDirection, type Locale } from "@maarif/contracts/locales";
import type { SitePhoto } from "@maarif/contracts/content";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import type { PageKey } from "@/lib/navigation";
import { getPageVisual } from "@/lib/cms";
import { PageFigure, type FigureName } from "@/components/hairline/page-figure";
import { HairlineIcon } from "@/components/hairline/icon";
import { MetroBreadcrumb } from "./metro-breadcrumb";
import { Photo } from "./photo";

// An inner page's opening, on the page ground like Home's hero: the metro trail, a welcome in
// the visitor's language with the other three scripts quiet beside it, the title, a lede and
// the page's picture. Phones: the picture follows the text.
//
// The picture (wave 3, C1): the page's header photo from maarifcms (Page photos > this page >
// Header) in a rounded plate, with the page's Hairline figure as a small still badge on its
// corner. Without a published photo, the live Hairline figure as before. The photo is in the
// server HTML with high priority and a reserved 5:4 box, so it is the fast LCP and moves nothing.

type Props = {
  locale: Locale;
  page: PageKey;
  lede?: string;
  figure?: { name: FigureName; label: string; captions?: Record<string, string> };
  children?: React.ReactNode; // actions under the lede
  // Detail pages (a news article, an album, a job opening): their own title, and their own
  // photo instead of the page's (null = no photo, keep the figure).
  title?: string;
  photo?: SitePhoto | null;
};

export async function PageHero({ locale, page, lede, figure, children, title, photo }: Props) {
  const name = pageNames[locale].pages[page];
  const others = locales.filter((code) => code !== locale);
  const header = photo !== undefined ? photo : (await getPageVisual(locale, page)).header;

  return (
    <section aria-labelledby="page-title" className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)] pt-4 pb-[calc(var(--section-pad)*0.3)] sm:pt-6">
      <MetroBreadcrumb locale={locale} page={page} />
      <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-lg font-bold text-turquoise-ink">{messages[locale].cta.greeting}</span>
            {others.map((code) => (
              <span key={code} lang={code} dir={localeDirection[code]} aria-hidden="true" className="text-sm text-slate">
                {messages[code].cta.greeting}
              </span>
            ))}
          </p>
          <h1
            id="page-title"
            className="mt-3 text-[length:var(--text-display)] leading-[var(--leading-display)] font-bold text-balance text-heading"
          >
            {title ?? name.title}
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg text-slate sm:text-xl">{lede ?? name.blurb}</p>
          {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div> : null}
        </div>
        {header ? (
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-raised ring-1 ring-rule/70">
              <Photo photo={header} locale={locale} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 90vw, 100vw" priority />
            </div>
            {figure ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-5 start-5 grid size-20 place-items-center rounded-full bg-surface text-heading shadow-raised ring-1 ring-rule/70 sm:size-24"
              >
                <HairlineIcon name={figure.name} className="size-14 sm:size-16" />
              </span>
            ) : null}
          </div>
        ) : figure ? (
          <PageFigure
            name={figure.name}
            label={figure.label}
            captions={figure.captions}
            className="mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-5 lg:max-w-none"
          />
        ) : null}
      </div>
    </section>
  );
}
