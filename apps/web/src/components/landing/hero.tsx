import { BadgeCheckIcon, CalendarCheckIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { localeDirection, localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { accreditations, facts } from "@/lib/facts";
import { whatsappHref } from "@/lib/school";
import { visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { PageFigure } from "@/components/hairline/page-figure";
import { CtaSpark } from "./cta-spark";
import { RollingFigures } from "./rolling-figures";

// First viewport, on the page ground (white in light, night navy in dark). A short promise in the visitor's language with the other
// three scripts beneath it like a bilingual street sign, the two next steps, the school's
// figures and recognitions, and the Maarif symbol answering the pointer. The three smaller
// headlines are links, so on every screen a parent can switch to their language from the sign.
// Phones: headline, scripts, text, actions, figures; the symbol follows, then recognitions.
export function Hero({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const s = t.station;
  const align = localeDirection[locale] === "rtl" ? "right" : "left";
  const others = locales.filter((code) => code !== locale);
  const [from, to] = facts.ages;
  const figures = [
    { value: String(facts.networkCountries), label: t.proof.countries },
    { value: String(facts.languages), label: t.proof.languages },
    { value: String(facts.campuses), label: t.proof.campuses },
    { value: t.proof.ages(from, to), label: t.proof.agesLabel },
  ];

  return (
    <section aria-labelledby="hero-title" className="pt-6 pb-12 lg:pt-12 lg:pb-16">
      <div className="grid items-center gap-x-10 gap-y-8 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-6">
          {/* sign-headline: switching language flips this plate (cross-document view transition). */}
          <h1
            id="hero-title"
            className="sign-headline max-w-[16ch] text-[length:var(--text-display)] leading-[var(--leading-display)] font-bold tracking-tight text-balance text-heading"
          >
            {t.hero.headline}
          </h1>
          <ul className="mt-5 flex flex-col gap-1.5" aria-label={t.nav.language}>
            {others.map((code, i) => (
              <li
                key={code}
                lang={code}
                dir={localeDirection[code]}
                style={{ textAlign: align, animationDelay: `${180 + i * 90}ms` }}
                className="script-in text-[length:var(--text-display-companion)] leading-snug font-medium"
              >
                <Link
                  href={`/${code}`}
                  hrefLang={code}
                  className="inline-flex min-h-9 items-center text-slate no-underline decoration-turquoise-ink underline-offset-[0.3em] transition-colors hover:text-heading hover:underline"
                >
                  {messages[code].hero.headline}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[54ch] text-lg text-ink">{t.hero.lede}</p>

          <div id="hero-actions" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaSpark className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full">
                <a href={visitHash}>
                  <CalendarCheckIcon data-icon="inline-start" />
                  {s.bookVisit}
                </a>
              </Button>
            </CtaSpark>
            <Button asChild size="lg" variant="outline">
              <a href={whatsappHref(s.whatsappMessage(t.schoolName))} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon data-icon="inline-start" />
                {s.whatsapp}
              </a>
            </Button>
          </div>

          {/* The figures, as small sign plates: number, then what it counts. They roll. */}
          <div className="mt-10">
            <RollingFigures figures={figures} label={t.proof.label} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md sm:max-w-lg lg:col-span-5 lg:max-w-none xl:col-span-6 xl:-me-6">
          {/* The symbol rosette: its arms name the four languages. Loaded after the page is
              interactive (its box is reserved), so it never delays the first paint. */}
          <PageFigure name="rosette" label={t.hero.figureLabel} captions={{ ...localeNativeName }} />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-rule pt-6 md:flex-row md:items-center md:gap-6">
        <h2 className="shrink-0 font-medium text-slate">{t.proof.accreditationTitle}</h2>
        <ul className="flex flex-wrap gap-2">
          {accreditations.map((key) => (
            <li key={key} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 font-bold text-heading shadow-rest ring-1 ring-rule/70">
              <BadgeCheckIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink" />
              {t.proof.accreditations[key]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
