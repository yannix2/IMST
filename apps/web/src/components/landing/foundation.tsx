import { ExternalLinkIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { homeCopy } from "@/content/home/wave2";
import { foundation } from "@/lib/facts";
import { maarifCountries } from "@/lib/maarif-world";
import { HairlineIcon } from "@/components/hairline/icon";
import { SectionHeading } from "./section-heading";
import { WorldGlobe } from "./world-globe";

// The Türkiye Maarif Foundation (wave 2, owner decision 2026-11-06), on a navy plate: the
// Foundation's logo (reversed, from its corporate-identity page), what it is, its own published
// figures with their source and date (lib/facts.ts), a link to its website, then Maarif schools
// around the world on the globe. Numbers are never rounded up; Arabic keeps Western digits.

const numberTag: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };
const dayTag = numberTag;

export function Foundation({ locale }: { locale: Locale }) {
  const c = homeCopy[locale];
  const f = c.foundation;
  const w = c.world;
  const n = (v: number) => new Intl.NumberFormat(numberTag[locale]).format(v);
  const read = new Intl.DateTimeFormat(dayTag[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${foundation.read}T12:00:00Z`));
  const figures = [
    { value: n(foundation.countries), label: f.figures.countries },
    { value: n(foundation.institutions), label: f.figures.institutions },
    { value: n(foundation.schools), label: f.figures.schools },
    { value: `${n(foundation.students)}+`, label: f.figures.students },
    { value: n(foundation.universities), label: f.figures.universities },
    { value: n(foundation.dormitories), label: f.figures.dormitories },
  ];
  const maxPlaces = Math.max(...maarifCountries.map((m) => m.places));

  return (
    <section id="network" aria-labelledby="network-title" className="scroll-mt-24 bg-navy py-[var(--section-pad)] text-white">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <img src="/brand/partners/tmv-horizontal-white.webp" alt={f.logoAlt} width={573} height={159} loading="lazy" className="mb-8 h-14 w-auto" />
            <SectionHeading id="network-title" tone="plate" eyebrow={f.eyebrow} title={f.title} lede={f.text} icon={<HairlineIcon name="network" className="w-24 text-white [--hl-icon-plate:var(--navy)]" />} />
            <a
              href={foundation.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-turquoise px-6 font-bold text-on-turquoise shadow-cta transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-cta-hover"
            >
              {f.visit}
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div className="lg:col-span-6">
            <h3 className="sr-only">{f.figuresLabel}</h3>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {figures.map((fig) => (
                <div key={fig.label} className="rounded-[var(--radius-tile)] bg-white/[0.06] p-4 ring-1 ring-white/15">
                  {/* The number keeps its own left-to-right order; the tile keeps the page's side. */}
                  <dd className="text-3xl leading-none font-bold text-turquoise tabular-nums sm:text-4xl">
                    <span dir="ltr">{fig.value}</span>
                  </dd>
                  <dt className="mt-2 text-sm text-on-plate-muted">{fig.label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-on-plate-muted">
              {f.source(read)}{" "}
              <a href={foundation.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white">
                turkiyemaarif.org
              </a>
            </p>
          </div>
        </div>

        <div className="mt-[var(--section-pad)] border-t border-white/15 pt-[calc(var(--section-pad)*0.75)]">
          <SectionHeading id="world-title" tone="plate" title={w.title} lede={w.lede} />
          <div className="mt-8">
            <WorldGlobe
              locale={locale}
              copy={{
                globeLabel: w.globeLabel,
                search: w.search,
                searchPlaceholder: w.searchPlaceholder,
                empty: w.empty,
                here: w.here,
                office: w.office,
                results: Array.from({ length: maarifCountries.length + 1 }, (_, i) => w.results(i)),
                places: Array.from({ length: maxPlaces + 1 }, (_, i) => w.places(i)),
              }}
            />
          </div>
          <p className="mt-8 max-w-[70ch] text-sm text-on-plate-muted">
            {w.mapNote(maarifCountries.length, foundation.countries)}{" "}
            <a href="https://turkiyemaarif.org/dunyada-maarif" target="_blank" rel="noopener noreferrer" className="font-bold text-turquoise underline-offset-2 hover:underline">
              {w.seeAll}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
