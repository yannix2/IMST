import { BadgeCheckIcon, CalendarCheckIcon, MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { localeDirection, locales, type Locale } from "@maarif/contracts/locales";
import { homeCopy } from "@/content/home/wave2";
import { messages } from "@/i18n/messages";
import { accreditations, facts } from "@/lib/facts";
import { whatsappHref } from "@/lib/school";
import { visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { getHomeHero } from "@/lib/cms";
import { CtaSpark } from "./cta-spark";
import { HeroFilm } from "./hero-film";
import { RollingFigures } from "./rolling-figures";

// First viewport (owner decision 2026-11-06): the school's photo motion film fills the screen
// under the header, behind a night-navy veil, with the promise in the visitor's language, the
// other three scripts beneath it like a bilingual street sign (each a link to that language), and
// the two next steps. The poster is the first paint; the film joins after load (hero-film.tsx).
// The section's height is fixed by the viewport, so nothing moves when the film arrives.
// White on the veil stays at 5.6:1 or more where the text sits, on the brightest frame.

// Built-in posters (wave 2). Once maarifcms's "Home film" is published (wave 3), its posters and
// film replace them, resized by maarif-api.
const builtInPoster = {
  landscape: (ext: string) => `/media/hero/poster-landscape-960.${ext} 960w, /media/hero/poster-landscape-1920.${ext} 1920w`,
  portrait: (ext: string) => `/media/hero/poster-portrait-720.${ext} 720w`,
  fallback: "/media/hero/poster-landscape-1920.webp",
};

export async function Hero({ locale }: { locale: Locale }) {
  const cms = await getHomeHero(locale);
  const poster = cms
    ? {
        landscape: (ext: string) => `${cms.posterLandscape.src}?w=960&f=${ext} 960w, ${cms.posterLandscape.src}?w=1600&f=${ext} 1600w`,
        portrait: (ext: string) => `${cms.posterPortrait.src}?w=960&f=${ext} 720w`,
        fallback: `${cms.posterLandscape.src}?w=1600&f=webp`,
      }
    : builtInPoster;
  const t = messages[locale];
  const c = homeCopy[locale];
  const s = t.station;
  const align = localeDirection[locale] === "rtl" ? "right" : "left";
  const others = locales.filter((code) => code !== locale);

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden bg-night text-white sm:min-h-[36rem] lg:min-h-[calc(100svh-5rem)]">
      <div className="absolute inset-0 -z-10">
        <picture className="absolute inset-0">
          <source media="(orientation: portrait)" type="image/avif" srcSet={poster.portrait("avif")} sizes="100vw" />
          <source media="(orientation: portrait)" type="image/webp" srcSet={poster.portrait("webp")} sizes="100vw" />
          <source type="image/avif" srcSet={poster.landscape("avif")} sizes="100vw" />
          <img
            src={poster.fallback}
            srcSet={poster.landscape("webp")}
            sizes="100vw"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover"
          />
        </picture>
        <HeroFilm playLabel={c.heroFilm.play} pauseLabel={c.heroFilm.pause} sources={cms ? { landscape: cms.landscape, portrait: cms.portrait } : undefined} />
        {/* The veil: deepest behind the words (start side, and the bottom on phones). */}
        <div aria-hidden="true" className="hero-veil absolute inset-0" />
      </div>

      <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--gutter)] pt-28 pb-20 lg:pb-24">
        <div className="max-w-[40rem]">
          {/* sign-headline: switching language flips this plate (cross-document view transition). */}
          <h1
            id="hero-title"
            className="sign-headline max-w-[16ch] text-[length:var(--text-display)] leading-[var(--leading-display)] font-bold tracking-tight text-balance text-white"
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
                  className="inline-flex min-h-9 items-center text-white/80 no-underline decoration-turquoise underline-offset-[0.3em] transition-colors hover:text-white hover:underline"
                >
                  {messages[code].hero.headline}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[54ch] text-lg text-white/90">{t.hero.lede}</p>

          <div id="hero-actions" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CtaSpark className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full">
                <a href={visitHash}>
                  <CalendarCheckIcon data-icon="inline-start" />
                  {s.bookVisit}
                </a>
              </Button>
            </CtaSpark>
            <Button asChild size="lg" variant="plate">
              <a href={whatsappHref(s.whatsappMessage(t.schoolName))} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon data-icon="inline-start" />
                {s.whatsapp}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Right under the film, on the page ground: the school's figures (they roll) and recognitions.
export function HeroProof({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const [from, to] = facts.ages;
  const figures = [
    { value: String(facts.networkCountries), label: t.proof.countries },
    { value: String(facts.languages), label: t.proof.languages },
    { value: String(facts.campuses), label: t.proof.campuses },
    { value: t.proof.ages(from, to), label: t.proof.agesLabel },
  ];
  return (
    <section aria-label={t.proof.label} className="py-10 lg:py-12">
      <RollingFigures figures={figures} label={t.proof.label} />
      <div className="mt-8 flex flex-col gap-3 border-t border-rule pt-6 md:flex-row md:items-center md:gap-6">
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
