import { ArrowUpRightIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { ProgramsRoute } from "@/components/site/programs-route";
import { programsFigure } from "../figures";
import { levelMeta, levelPages } from "./levels-data";

// Programs: the route map from Home (choose a station to open its level), then a card per
// level page in route order, each on its line's colour.

const copy: Record<Locale, { lede: string; routeTitle: string; levelsTitle: string }> = {
  en: { lede: "One route from Kindergarten to Year 13, on the Cambridge International curriculum, in four languages. Choose a station to see that level.", routeTitle: "Find your child’s station", levelsTitle: "The four stages" },
  fr: { lede: "Un seul parcours de la maternelle à l’année 13, sur le programme Cambridge International, en quatre langues. Choisissez une station pour voir ce niveau.", routeTitle: "Trouvez la station de votre enfant", levelsTitle: "Les quatre étapes" },
  ar: { lede: "مسار واحد من الروضة إلى سنة 13، وفق منهاج Cambridge International، بأربع لغات. اختاروا محطة لتروا تلك المرحلة.", routeTitle: "جدوا محطة طفلكم", levelsTitle: "المراحل الأربع" },
  tr: { lede: "Anaokulundan Yıl 13’e, Cambridge International müfredatıyla, dört dilde tek bir yol. O düzeyi görmek için bir durak seçin.", routeTitle: "Çocuğunuzun durağını bulun", levelsTitle: "Dört aşama" },
};

const lineBg = { kindergarten: "bg-level-kindergarten", primary: "bg-level-primary", secondary: "bg-level-secondary" } as const;

export function ProgramsPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const t = messages[locale];
  const p = pageNames[locale];
  return (
    <PageShell
      locale={locale}
      page="programs"
      lede={c.lede}
      figure={programsFigure(locale)}
      body={
        <>
          <PageSection id="route" title={c.routeTitle} lede={t.route.hint}>
            <ProgramsRoute locale={locale} />
          </PageSection>
          <PageSection id="levels" tone="mist" title={c.levelsTitle}>
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {levelPages.map((level) => {
                const key = `programs/${level}` as const;
                const meta = levelMeta[level];
                return (
                  <li key={level}>
                    <a
                      href={`/${locale}/${key}`}
                      className="group flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-plate)] bg-surface p-6 no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-rest-hover"
                    >
                      <span aria-hidden="true" className={cn("h-[var(--line-thickness)] w-16 rounded-full", lineBg[meta.line])} />
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-heading text-2xl font-bold text-heading">{p.pages[key].title}</span>
                        <ArrowUpRightIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink rtl:-scale-x-100" />
                      </span>
                      <span className="text-slate">{p.pages[key].blurb}</span>
                      <span className="mt-auto text-sm font-medium text-ink">{t.route.places[meta.campus]}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
