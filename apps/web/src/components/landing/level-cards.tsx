import { ArrowRightIcon, MapPinIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import type { Level } from "@maarif/contracts/school";
import type { PhotoId } from "@/content/media";
import { homeCopy } from "@/content/home/wave2";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { levelCopy, levelMeta, levelPages, levelWords, type LevelPage } from "@/site-pages/programs/levels-data";
import { FlipCard } from "@/components/site/flip-card";
import { Photo, slotPhoto } from "@/components/site/photo";
import { getPageVisual } from "@/lib/cms";

// The four stages as photo cards that turn over (wave 2): front = a non-identifiable photo of
// that stage with its level line; back = ages, years, campus, the stage in one line, its areas of
// learning and a link to the level page. Everything on the back comes from the level pages
// (site-pages/programs/levels-data.ts), so the two never disagree.

const photoOf: Record<LevelPage, PhotoId> = {
  kindergarten: "kindergarten-farm-corner",
  primary: "primary-microscope",
  "lower-secondary": "secondary-archery",
  "upper-secondary": "university-visit",
};
const lineColour: Record<Level, string> = {
  kindergarten: "bg-level-kindergarten",
  primary: "bg-level-primary",
  secondary: "bg-level-secondary",
};

// Photos: maarifcms "Page photos" for Home, slots levels-<stage>; the built-in set until then.
export async function LevelCards({ locale }: { locale: Locale }) {
  const visual = await getPageVisual(locale, "home");
  const t = messages[locale];
  const c = homeCopy[locale].levelCards;
  const names = pageNames[locale].pages;
  const words = levelWords[locale].glance;
  const yearsOf = (page: LevelPage) => {
    const [a, b] = levelMeta[page].years;
    return a === b ? t.grade(a) : `${t.grade(a)} – ${t.grade(b)}`;
  };

  return (
    <div>
      <p className="mt-2 mb-8 max-w-[60ch] text-lg text-slate">{c.lede}</p>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {levelPages.map((page) => {
          const meta = levelMeta[page];
          const copy = levelCopy[locale][page];
          const name = names[`programs/${page}`].title;
          const [from, to] = meta.ages;
          return (
            <li key={page} className="min-w-0">
              <FlipCard
                title={name}
                openLabel={c.open}
                closeLabel={c.close}
                className="aspect-[4/5] shadow-rest"
                front={
                  <div className="relative size-full bg-night">
                    <Photo photo={slotPhoto(visual, `levels-${page}`, photoOf[page])!} locale={locale} sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw" />
                    <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgb(11_42_71/0.92)_0%,rgb(11_42_71/0.45)_38%,transparent_62%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span aria-hidden="true" className={`mb-3 block h-1.5 w-12 rounded-full ${lineColour[meta.line]}`} />
                      <h3 className="text-2xl leading-tight font-bold">{name}</h3>
                      <p className="mt-1 font-medium text-white/85">{c.ages(from, to)}</p>
                    </div>
                  </div>
                }
                back={
                  <div className="flex size-full flex-col overflow-y-auto bg-surface p-5 pe-14 text-ink ring-1 ring-rule">
                    <span aria-hidden="true" className={`mb-3 block h-1.5 w-12 shrink-0 rounded-full ${lineColour[meta.line]}`} />
                    <h3 className="text-xl leading-tight font-bold text-heading">{name}</h3>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                      <dt className="text-slate">{words.ages}</dt>
                      <dd className="font-medium">{c.ages(from, to)}</dd>
                      <dt className="text-slate">{words.years}</dt>
                      <dd className="font-medium">{yearsOf(page)}</dd>
                      <dt className="text-slate">{words.campus}</dt>
                      <dd className="inline-flex items-center gap-1 font-medium">
                        <MapPinIcon aria-hidden="true" className="size-4 text-turquoise-ink" />
                        {t.route.places[meta.campus]}
                      </dd>
                    </dl>
                    <p className="mt-3 text-sm leading-relaxed">{copy.lede}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {copy.areas.slice(0, 3).map((area) => (
                        <li key={area.title} className="rounded-full bg-turquoise-wash px-2.5 py-1 text-xs font-medium text-heading">
                          {area.title}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/${locale}/programs/${page}`}
                      className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 font-bold text-turquoise-ink underline-offset-4 hover:underline"
                    >
                      {c.discover(name)}
                      <ArrowRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    </a>
                  </div>
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
