import { ArrowUpRightIcon, CalendarCheckIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { tourCopy } from "@/content/tour";
import { areaOf, menuPages, pathOf, type PageKey } from "@/lib/navigation";
import { tourHref, tourIndex, tourStops } from "@/lib/tour";
import { campuses, telHref } from "@/lib/school";
import { whatsappForPage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { CtaSpark } from "@/components/landing/cta-spark";
import { RememberLocale } from "@/components/landing/remember-locale";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyHeader } from "@/components/landing/sticky-header";
import { PageHero } from "./page-hero";
import { PhotoBand } from "./photo-band";
import { TourGate } from "./tour-gate";

// Every inner page: the header, the page hero, the page's own sections, the other pages of
// its area, and the closing next step (a visit, or WhatsApp with the page already named).

// `band`: the page's row of photos (photo-band.tsx) after its sections; false when the page
// places <PhotoBand> itself.
type Props = React.ComponentProps<typeof PageHero> & { body: React.ReactNode; band?: boolean };

export function PageShell({ body, band = true, ...hero }: Props) {
  const { locale, page } = hero;
  const t = messages[locale];
  const path = pathOf(page);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-turquoise px-4 py-2 font-bold text-night focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t.skipToContent}
      </a>
      <StickyHeader>
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
          <SiteHeader locale={locale} path={path} />
        </div>
      </StickyHeader>
      <main id="main" tabIndex={-1} className="outline-none">
        <PageHero {...hero} />
        {body}
        {band ? <PhotoBand locale={locale} page={page} /> : null}
        <SectionPages locale={locale} page={page} />
        <NextStep locale={locale} page={page} />
      </main>
      <SiteFooter locale={locale} path={path} />
      <RememberLocale locale={locale} />
      <Tour locale={locale} page={page} />
    </>
  );
}

// The guided tour (wave 5): only the six tour pages carry the gate; it shows the bar when the
// address has ?tour=1 (lib/tour.ts).
function Tour({ locale, page }: { locale: Locale; page: PageKey }) {
  const index = tourIndex(page);
  if (index < 0) return null;
  const p = pageNames[locale];
  const stops = tourStops.map((key, i) => ({ href: tourHref(locale, i), title: p.pages[key].title }));
  const visitHref = page === "admissions/visit" ? "#visit-page" : `/${locale}/admissions/visit`;
  return <TourGate index={index} stops={stops} visitHref={visitHref} visitLabel={messages[locale].station.bookVisit} copy={tourCopy[locale]} />;
}

// The other pages of this area as cards, so a parent can keep reading without the menu.
function SectionPages({ locale, page }: { locale: Locale; page: PageKey }) {
  const p = pageNames[locale];
  const area = areaOf(page);
  const others = [area.pages[0]!, ...menuPages(area)].filter((k) => k !== page);
  if (others.length === 0) return null;
  return (
    <section aria-labelledby="section-pages" className="defer-paint bg-mist py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <h2 id="section-pages" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">
          {p.ui.inThisSection}
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((key) => (
            <li key={key}>
              <a
                href={`/${locale}${pathOf(key)}`}
                className="group flex h-full flex-col gap-2 rounded-[var(--radius-plate)] bg-surface p-6 no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-rest-hover"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-heading text-xl font-bold text-heading">{p.pages[key].title}</span>
                  <ArrowUpRightIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                </span>
                <span className="text-slate">{p.pages[key].blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NextStep({ locale, page }: { locale: Locale; page: PageKey }) {
  const t = messages[locale];
  const s = t.station;
  const phone = campuses.schools.phones[0];
  return (
    <section aria-labelledby="next-step" className="defer-paint py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <div className="plate flex flex-col gap-6 rounded-[2rem] bg-navy p-6 text-white shadow-raised ring-1 ring-white/10 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div>
            <h2 id="next-step" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance">
              {t.cta.title}
            </h2>
            <p className="mt-3 max-w-[48ch] text-lg text-on-plate-muted">{t.cta.text}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:shrink-0">
            {page !== "admissions/visit" ? (
              <CtaSpark tone="plate" className="w-full sm:w-auto">
                <Button asChild size="lg" className="w-full">
                  <a href={`/${locale}/admissions/visit`}>
                    <CalendarCheckIcon data-icon="inline-start" />
                    {s.bookVisit}
                  </a>
                </Button>
              </CtaSpark>
            ) : null}
            <Button asChild size="lg" variant="plate">
              <a href={whatsappForPage(locale, page)} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon data-icon="inline-start" />
                {s.whatsapp}
              </a>
            </Button>
            <Button asChild size="lg" variant="plate">
              <a href={telHref(phone)}>
                <PhoneIcon data-icon="inline-start" />
                <span className="tabular" dir="ltr">
                  {phone}
                </span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
