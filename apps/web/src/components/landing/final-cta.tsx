import { CalendarCheckIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { campuses, telHref, whatsappHref } from "@/lib/school";
import { visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { PageFigure } from "@/components/hairline/page-figure";
import { CtaSpark } from "./cta-spark";
import { GreetingSign } from "./greeting-sign";

// The last sign on the route, raised off the page: a welcome in four scripts, the next step,
// and the schoolhouse, whose wings answer the pointer with the level they hold.
// Phones: text, actions, then the schoolhouse.
// Wave 2 (turquoise leads): the plate is turquoise with night-navy text (5.36:1); on it the
// main button turns night navy (a turquoise button would vanish) and the others are night outlines.
export function FinalCta({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const s = t.station;
  const phone = campuses.schools.phones[0];
  // The visitor's own greeting first, then the other three in the switcher's order.
  const greetings = [locale, ...locales.filter((code) => code !== locale)].map((code) => messages[code].cta.greeting);
  const levels = { kindergarten: t.levels.kindergarten, primary: t.levels.primary, secondary: t.levels.secondary };

  return (
    <section id="come-and-see" aria-labelledby="cta-title" className="py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
      <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-turquoise p-6 text-night shadow-cta [--focus:var(--night)] sm:p-10 lg:grid-cols-12 lg:gap-10 lg:p-14">
        <div className="lg:col-span-7">
          <GreetingSign
            greetings={greetings}
            className="min-h-[1.1em] text-[length:var(--text-display)] leading-[1.1] font-bold text-night"
          />
          <h2 id="cta-title" className="mt-4 text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance">
            {t.cta.title}
          </h2>
          <p className="mt-3 max-w-[48ch] text-lg text-night">{t.cta.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaSpark tone="plate" className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full bg-night text-white shadow-raised hover:bg-navy">
                <a href={visitHash}>
                  <CalendarCheckIcon data-icon="inline-start" />
                  {s.bookVisit}
                </a>
              </Button>
            </CtaSpark>
            <Button asChild size="lg" variant="plate" className="border-night/45 bg-white/25 text-night hover:bg-night hover:text-white">
              <a href={whatsappHref(s.whatsappMessage(t.schoolName))} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon data-icon="inline-start" />
                {s.whatsapp}
              </a>
            </Button>
            <Button asChild size="lg" variant="plate" className="border-night/45 bg-white/25 text-night hover:bg-night hover:text-white">
              <a href={telHref(phone)}>
                <PhoneIcon data-icon="inline-start" />
                <span className="tabular" dir="ltr">{phone}</span>
              </a>
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
          <PageFigure name="schoolhouse" tone="ground" label={t.cta.figureLabel} captions={levels} />
        </div>
      </div>
      </div>
    </section>
  );
}
