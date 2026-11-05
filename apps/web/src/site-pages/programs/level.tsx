import { ArrowUpRightIcon, BookOpenCheckIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { cambridgeStages, programsFigure } from "../figures";
import { levelCopy, levelMeta, levelPages, levelWords, type LevelPage } from "./levels-data";

// One template for the four level pages: the level's line in its colour, the facts at a glance
// (years, ages, campus, Cambridge stage), what children learn, the exams on the way, and the
// next station on the route.

const lineColour = { kindergarten: "bg-level-kindergarten", primary: "bg-level-primary", secondary: "bg-level-secondary" } as const;

export function LevelPageView({ locale, level }: { locale: Locale; level: LevelPage }) {
  const t = messages[locale];
  const w = levelWords[locale];
  const meta = levelMeta[level];
  const c = levelCopy[locale][level];
  const [y0, y1] = meta.years;
  const years = y0 === y1 ? t.grade(y0) : `${t.grade(y0)} – ${t.grade(y1)}`;
  const next = levelPages[levelPages.indexOf(level) + 1];
  const nextKey = next ? (`programs/${next}` as const) : ("programs/cambridge" as const);
  const p = pageNames[locale];

  const glance = [
    { label: w.glance.years, value: years },
    { label: w.glance.ages, value: t.levels.ages(meta.ages[0], meta.ages[1]) },
    { label: w.glance.campus, value: t.route.places[meta.campus] },
    { label: w.glance.stage, value: meta.stages.map((s) => cambridgeStages[s as keyof typeof cambridgeStages]).join(", ") },
  ];

  return (
    <PageShell
      locale={locale}
      page={`programs/${level}`}
      lede={c.lede}
      figure={programsFigure(locale)}
      body={
        <>
          <PageSection id="glance" tone="mist">
            <span aria-hidden="true" className={cn("block h-[var(--line-thickness)] w-28 rounded-full", lineColour[meta.line])} />
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {glance.map((g) => (
                <div key={g.label} className="rounded-[var(--radius-tile)] bg-surface p-5 shadow-rest ring-1 ring-rule/70">
                  <dt className="text-sm text-slate">{g.label}</dt>
                  <dd className="mt-1 font-heading text-xl font-bold text-heading">{g.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 max-w-[60ch] text-lg text-ink">{c.approach}</p>
          </PageSection>

          <PageSection id="learn" title={c.areasTitle}>
            <ul className="grid gap-5 lg:grid-cols-3">
              {c.areas.map((area) => (
                <li key={area.title} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70">
                  <h3 className="text-xl font-bold text-heading">{area.title}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {area.items.map((item) => (
                      <li key={item} className="rounded-full bg-mist px-3.5 py-1.5 text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </PageSection>

          {c.exams ? (
            <PageSection id="exams" tone="mist" title={c.examsTitle}>
              <ol className="grid gap-5 md:grid-cols-3">
                {c.exams.map((exam) => (
                  <li key={exam.name} className="plate flex flex-col gap-3 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised">
                    <BookOpenCheckIcon aria-hidden="true" className="size-7 text-turquoise" strokeWidth={1.75} />
                    <h3 lang="en" className="text-xl font-bold">
                      {exam.name}
                    </h3>
                    <p className="text-on-plate-muted">{exam.text}</p>
                  </li>
                ))}
              </ol>
            </PageSection>
          ) : null}

          <PageSection id="next">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { href: `/${locale}/${nextKey}`, kicker: w.next, title: p.pages[nextKey].title },
                { href: `/${locale}/admissions/ages`, kicker: p.pages["admissions/ages"].title, title: w.findGrade },
                { href: `/${locale}/programs/cambridge`, kicker: p.pages["programs/cambridge"].title, title: w.pathway },
              ]
                // After the last level, "next on the route" is already the Cambridge page.
                .filter((link, i, all) => all.findIndex((l) => l.href === link.href) === i)
                .map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group flex items-start justify-between gap-4 rounded-[var(--radius-plate)] bg-mist p-6 no-underline transition-colors hover:bg-surface hover:shadow-rest"
                >
                  <span>
                    <span className="block text-sm text-slate">{link.kicker}</span>
                    <span className="mt-1 block font-heading text-xl font-bold text-heading">{link.title}</span>
                  </span>
                  <ArrowUpRightIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink rtl:-scale-x-100" />
                </a>
              ))}
            </div>
          </PageSection>
        </>
      }
    />
  );
}

export const levelDescription = (level: LevelPage) => (locale: Locale) => levelCopy[locale][level].lede;
