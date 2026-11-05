"use client";

import { useEffect, useRef, useState } from "react";
import { UtensilsIcon } from "lucide-react";
import { courses, schoolWeek, type MenuDay, type SchoolDay, type WeekMenu } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { loadHomeContent, showPreviews } from "@/lib/home-content";
import { cn } from "@/lib/utils";

// Today's lunch from the canteen, with the other days of the week one tap away. Staff post the
// week's menu in maarifcms; maarif-api serves it. Before it is posted the section says so
// plainly. Locally, without maarif-api, a marked preview fills the days with placeholders.

// Western digits in every language, Arabic included (DESIGN.md).
const dateTag: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };

function previewWeek(locale: Locale): WeekMenu {
  const t = messages[locale].canteen.courses;
  const week = schoolWeek(new Date());
  const dish = (course: "starter" | "main" | "dessert") => ({ course, dish: `[${t[course]}]` });
  return {
    weekOf: week.weekOf,
    today: week.today,
    days: (Object.keys(week.dates) as SchoolDay[]).map((day) => ({ day, date: week.dates[day], dishes: [dish("starter"), dish("main"), dish("dessert")] })),
  };
}

// Today's date in Tunis (YYYY-MM-DD): the "Today" mark never shows on a weekend preview of next week.
const tunisToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(new Date());

type State = { status: "loading" } | { status: "empty" } | { status: "ready"; week: WeekMenu; isPreview: boolean };

export function TodaysMenu({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const c = t.canteen;
  const host = useRef<HTMLElement>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [picked, setPicked] = useState<SchoolDay | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        void loadHomeContent(locale).then((content) => {
          if (content?.menu) setState({ status: "ready", week: content.menu, isPreview: false });
          else if (!content && showPreviews) setState({ status: "ready", week: previewWeek(locale), isPreview: true });
          else setState({ status: "empty" });
        });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);
    return () => near.disconnect();
  }, [locale]);

  const week = state.status === "ready" ? state.week : null;
  const current: MenuDay | undefined = week?.days.find((d) => d.day === (picked ?? week.today)) ?? week?.days[0];
  const fmt = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(dateTag[locale], { ...options, timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));

  return (
    <section ref={host} aria-labelledby="canteen-title" className="py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-8 px-[var(--gutter)] lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="canteen-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">
            {c.title}
          </h2>
          <p className="mt-2 max-w-[44ch] text-lg text-slate">{c.lede}</p>

          {week && week.days.length > 1 ? (
            <div role="group" aria-label={c.days} className="mt-6 inline-flex flex-wrap gap-1 rounded-full bg-mist p-1 ring-1 ring-rule">
              {week.days.map((d) => {
                const on = d.day === current?.day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(d.day)}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full px-4 font-medium transition-[background-color,color,box-shadow] duration-200",
                      on ? "bg-surface text-heading shadow-rest" : "text-slate hover:text-heading",
                    )}
                  >
                    {fmt(d.date, { weekday: "short" })}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-7">
          <article aria-live="polite" className="rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest sm:p-8">
            {state.status === "loading" ? (
              // Skeleton in the card's own shape: a date line, then three dishes.
              <div aria-hidden="true" className="flex flex-col gap-5">
                <span className="h-5 w-48 rounded-full bg-mist" />
                {[0, 1, 2].map((i) => (
                  <span key={i} className="flex flex-col gap-2">
                    <span className="h-3 w-20 rounded-full bg-mist" />
                    <span className="h-5 w-2/3 rounded-full bg-mist" />
                  </span>
                ))}
              </div>
            ) : current ? (
              <>
                <header className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-navy text-white">
                    <UtensilsIcon className="size-6" strokeWidth={2} />
                  </span>
                  <h3 className="text-xl font-bold text-heading">{fmt(current.date, { weekday: "long", day: "numeric", month: "long" })}</h3>
                  {current.date === tunisToday() ? (
                    <span className="rounded-full bg-turquoise px-3 py-0.5 text-sm font-bold text-night">{c.today}</span>
                  ) : null}
                  {state.status === "ready" && state.isPreview ? (
                    <span className="rounded-full bg-notice px-3 py-0.5 text-sm font-bold text-white">Preview: menu from maarifcms</span>
                  ) : null}
                </header>
                <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {courses.flatMap((course) => {
                    const dishes = current.dishes.filter((d) => d.course === course);
                    return dishes.length
                      ? [
                          <div key={course} className="flex flex-col gap-1 border-t border-rule pt-4">
                            <dt className="text-sm font-medium text-slate">{c.courses[course]}</dt>
                            {dishes.map((d) => (
                              <dd key={d.dish} className="m-0 text-lg font-bold text-ink">
                                {d.dish}
                              </dd>
                            ))}
                          </div>,
                        ]
                      : [];
                  })}
                </dl>
              </>
            ) : (
              <div className="flex items-start gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-mist text-heading">
                  <UtensilsIcon className="size-6" strokeWidth={2} />
                </span>
                <p className="max-w-[48ch] text-lg text-ink">{c.empty}</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
