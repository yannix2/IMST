import { CalendarPlusIcon } from "lucide-react";
import type { KeyDate } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { dateTag, stageName } from "@/components/site/cms-bits";
import { Button } from "@/components/ui/button";
import { parentsCopy } from "./copy";

// Key dates of the school year (wave 6): staff enter them in maarifcms ("Key dates"), the
// Calendar page lists them by month and the Parents hub shows the next ones. Whole days only.

const at = (isoDay: string) => new Date(`${isoDay}T12:00:00Z`);

// The school's day (Tunisia is UTC+1 all year); pages refresh at least every five minutes.
export const todayInTunis = () => new Date(Date.now() + 3_600_000).toISOString().slice(0, 10);

/** "Fri 20 Nov" for one day, "21 Dec – 2 Jan" for several, in the page language (Western digits). */
export function dayRange(locale: Locale, date: KeyDate): string {
  if (!date.endsOn) return new Intl.DateTimeFormat(dateTag[locale], { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(at(date.startsOn));
  return new Intl.DateTimeFormat(dateTag[locale], { day: "numeric", month: "short", timeZone: "UTC" }).formatRange(at(date.startsOn), at(date.endsOn));
}

const monthName = (locale: Locale, isoDay: string) => new Intl.DateTimeFormat(dateTag[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(at(isoDay));

/** What follows the title: the kind of date, the levels and the campus it concerns. */
function about(locale: Locale, date: KeyDate): string {
  const places = messages[locale].route.places as Record<string, string>;
  return [parentsCopy[locale].dates.kinds[date.kind], ...date.stages.map((s) => stageName(locale, s)), date.campus ? (places[date.campus] ?? "") : ""].filter(Boolean).join(" · ");
}

export function KeyDateRow({ locale, date, compact = false }: { locale: Locale; date: KeyDate; compact?: boolean }) {
  const meta = about(locale, date);
  return (
    <li className={compact ? "flex flex-col gap-0.5 py-3" : "grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[11rem_1fr]"}>
      <span className={compact ? "text-sm font-bold text-turquoise-ink tabular" : "font-bold text-heading tabular"}>{dayRange(locale, date)}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className={compact ? "font-medium text-heading" : "text-lg font-bold text-heading"}>{date.title}</span>
        {meta ? <span className="text-sm text-slate">{meta}</span> : null}
        {!compact && date.note ? <span className="max-w-[60ch] text-ink">{date.note}</span> : null}
      </span>
    </li>
  );
}

/** Every date, under the month it starts in. */
export function KeyDateList({ locale, dates }: { locale: Locale; dates: KeyDate[] }) {
  const months = new Map<string, KeyDate[]>();
  for (const date of dates) {
    const key = date.startsOn.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), date]);
  }
  return (
    <div className="flex flex-col gap-10">
      {[...months].map(([key, list]) => (
        <section key={key} aria-labelledby={`month-${key}`}>
          <h3 id={`month-${key}`} className="font-heading text-xl font-bold text-heading">
            {monthName(locale, list[0]!.startsOn)}
          </h3>
          <ul className="mt-2 divide-y divide-rule/70 border-t border-rule/70">
            {list.map((date) => (
              <KeyDateRow key={date.id} locale={locale} date={date} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** The same dates as a calendar file from maarif-api: phones and computers open it in their calendar. */
export function AddToCalendar({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale].dates;
  return (
    <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
      <Button asChild size="lg">
        <a href={`/api/calendar/key-dates.ics?locale=${locale}`} download="maarif-key-dates.ics">
          <CalendarPlusIcon data-icon="inline-start" />
          {c.add}
        </a>
      </Button>
      <p className="text-slate">{c.addNote}</p>
    </div>
  );
}
