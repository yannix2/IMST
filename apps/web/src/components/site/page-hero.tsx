import { locales, localeDirection, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import type { PageKey } from "@/lib/navigation";
import { PageFigure, type FigureName } from "@/components/hairline/page-figure";
import { MetroBreadcrumb } from "./metro-breadcrumb";

// An inner page's opening, on the page ground like Home's hero: the metro trail, a welcome in
// the visitor's language with the other three scripts quiet beside it, the title, a lede and
// the page's own Hairline figure, which answers the pointer. Phones: the figure follows the
// text at a smaller size.

type Props = {
  locale: Locale;
  page: PageKey;
  lede?: string;
  figure?: { name: FigureName; label: string; captions?: Record<string, string> };
  children?: React.ReactNode; // actions under the lede
};

export function PageHero({ locale, page, lede, figure, children }: Props) {
  const name = pageNames[locale].pages[page];
  const others = locales.filter((code) => code !== locale);

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
            {name.title}
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg text-slate sm:text-xl">{lede ?? name.blurb}</p>
          {children ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div> : null}
        </div>
        {figure ? (
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
