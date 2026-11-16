import { ArrowUpRightIcon, BookOpenIcon, CalendarDaysIcon, ClockIcon, DownloadIcon, MessageSquareHeartIcon, UtensilsIcon } from "lucide-react";
import type { DocumentKind, SchoolDocument } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { getDocuments, getKeyDates, getTimetable } from "@/lib/cms";
import { MyLevelMark } from "@/components/site/my-level-mark";
import { AddToCalendar, KeyDateList, KeyDateRow, todayInTunis } from "./key-dates";
import { campuses, telHref } from "@/lib/school";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { EmptyState, formatDate, stageName } from "@/components/site/cms-bits";
import { FeedbackForm } from "@/components/site/feedback-form";
import { LazyTodaysMenu } from "@/components/landing/lazy-sections";
import { Button } from "@/components/ui/button";
import { contactFigure } from "../figures";
import { parentsCopy } from "./copy";

// Parents (wave 3, D3). Calendar and handbook are PDFs staff upload in maarifcms (Documents),
// school hours are the Timetables global, the menu is the weekly menu already on Home.

const quick = [
  { key: "parents/calendar", icon: CalendarDaysIcon },
  { key: "parents/schedules", icon: ClockIcon },
  { key: "parents/menu", icon: UtensilsIcon },
  { key: "parents/handbook", icon: BookOpenIcon },
  { key: "parents/feedback", icon: MessageSquareHeartIcon },
] as const;

export function ParentsPage({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const p = pageNames[locale];
  return (
    <PageShell
      locale={locale}
      page="parents"
      lede={c.lede}
      figure={contactFigure(locale)}
      body={
        <>
          <Glance locale={locale} />
          <PageSection id="quick" tone="mist" title={c.quickTitle}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quick.map(({ key, icon: Icon }) => (
                <li key={key}>
                  <a
                    href={`/${locale}/${key}`}
                    className="group flex h-full items-start gap-4 rounded-[var(--radius-plate)] bg-surface p-6 no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-rest-hover"
                  >
                    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-turquoise-wash text-heading">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 font-heading text-lg font-bold text-heading">
                        {p.pages[key].title}
                        <ArrowUpRightIcon aria-hidden="true" className="size-4 text-turquoise-ink rtl:-scale-x-100" />
                      </span>
                      <span className="text-slate">{p.pages[key].blurb}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </PageSection>
          <LazyTodaysMenu locale={locale} />
        </>
      }
    />
  );
}

// A school year such as "2026-2027" must read left to right inside Arabic text too (it printed
// as "2027-2026"): wrap it in left-to-right isolate marks.
const ltr = (text: string) => `\u2066${text}\u2069`;

const moreLink ="inline-flex min-h-11 items-center gap-2 font-medium text-turquoise-ink";

// The hub's first block (wave 6): the school hours and the calendar file, read on the server from
// maarifcms. It shows only what the school has published; with nothing published it is absent,
// and the calendar and hours pages keep their own "ask the office" notes.
async function Glance({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const t = messages[locale];
  const p = pageNames[locale];
  const [timetable, documents, keyDates] = await Promise.all([getTimetable(locale), getDocuments(locale, "all"), getKeyDates(locale)]);
  const rows = timetable?.rows ?? [];
  const calendar = (documents ?? []).find((d) => d.kind === "calendar");
  // The next three dates that are not over yet.
  const today = todayInTunis();
  const next = (keyDates ?? []).filter((d) => (d.endsOn ?? d.startsOn) >= today).slice(0, 3);
  if (rows.length === 0 && !calendar && next.length === 0) return null;
  return (
    <PageSection id="glance" title={c.glance.title}>
      <div className="grid gap-10 lg:grid-cols-12">
        {rows.length ? (
          <div className="lg:col-span-7">
            <h3 className="font-heading text-xl font-bold text-heading">
              {c.glance.hours}
              {timetable?.schoolYear ? <span className="ms-2 text-base font-normal text-slate tabular">{ltr(timetable.schoolYear)}</span> : null}
            </h3>
            <ul className="mt-3 divide-y divide-rule/70">
              {rows.map((row, i) => (
                // `data-mine` is set in the browser by MyLevelMark for the family's own level.
                <li key={i} data-stage={row.stage} className="group relative -mx-3 flex items-baseline justify-between gap-6 px-3 py-4 data-[mine]:bg-turquoise-wash">
                  <span className="absolute start-3 -top-2.5 hidden rounded-full bg-turquoise px-2.5 py-0.5 text-xs font-bold text-on-turquoise group-data-[mine]:block">{c.dates.myLevel}</span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-bold text-heading">{stageName(locale, row.stage)}</span>
                    <span className="text-sm text-slate">
                      {[row.days, row.campus ? (t.route.places[row.campus as keyof typeof t.route.places] ?? row.campus) : ""].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-lg font-bold text-heading tabular" dir="ltr">
                    {row.start}–{row.end}
                  </span>
                </li>
              ))}
            </ul>
            <MyLevelMark />
            <a href={`/${locale}/parents/schedules`} className={moreLink}>
              {c.glance.more}
              <span className="sr-only">: {p.pages["parents/schedules"].title}</span>
              <ArrowUpRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </a>
          </div>
        ) : null}
        {calendar || next.length ? (
          <div className="flex flex-col items-start gap-3 self-start rounded-[var(--radius-plate)] bg-mist p-7 lg:col-span-5">
            <CalendarDaysIcon aria-hidden="true" className="size-8 text-turquoise-ink" strokeWidth={1.75} />
            <h3 className="font-heading text-xl font-bold text-heading">{next.length ? c.dates.next : c.glance.calendar}</h3>
            {next.length ? (
              <ul className="w-full divide-y divide-rule/70">
                {next.map((date) => (
                  <KeyDateRow key={date.id} locale={locale} date={date} compact />
                ))}
              </ul>
            ) : null}
            {calendar ? (
              <>
                <p className="text-ink">{calendar.title}</p>
                <p className="text-sm text-slate">
                  {[calendar.schoolYear ? `${c.schoolYear} ${ltr(calendar.schoolYear)}` : "", calendar.bytes ? c.pdf(formatBytes(locale, calendar.bytes)) : ""].filter(Boolean).join(" · ")}
                </p>
                <Button asChild variant={next.length ? "outline" : "default"} className="mt-2">
                  <a href={calendar.href} download>
                    <DownloadIcon data-icon="inline-start" />
                    {c.download}
                  </a>
                </Button>
              </>
            ) : null}
            <a href={`/${locale}/parents/calendar`} className={moreLink}>
              {c.glance.more}
              <span className="sr-only">: {p.pages["parents/calendar"].title}</span>
              <ArrowUpRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </a>
          </div>
        ) : null}
      </div>
    </PageSection>
  );
}

function formatBytes(locale: Locale, bytes: number | null): string {
  if (!bytes) return "";
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-TN-u-nu-latn" : locale, { maximumFractionDigits: 1 });
  return bytes > 1_000_000 ? `${nf.format(bytes / 1_000_000)} MB` : `${nf.format(Math.max(1, Math.round(bytes / 1000)))} KB`;
}

function DocumentList({ locale, docs }: { locale: Locale; docs: SchoolDocument[] }) {
  const c = parentsCopy[locale];
  return (
    <ul className="flex flex-col gap-4">
      {docs.map((doc) => (
        <li key={doc.id} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl font-bold text-heading">{doc.title}</h2>
            {doc.summary ? <p className="text-slate">{doc.summary}</p> : null}
            <p className="text-sm text-slate">
              {[doc.schoolYear ? `${c.schoolYear} ${ltr(doc.schoolYear)}` : "", doc.validUntil ? `${c.validUntil} ${formatDate(locale, doc.validUntil)}` : "", doc.bytes ? c.pdf(formatBytes(locale, doc.bytes)) : ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <a href={doc.href} download>
              <DownloadIcon data-icon="inline-start" />
              {c.download}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}

function AskOffice({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const phone = campuses.schools.phones[0];
  return (
    <Button asChild variant="outline" className="mt-6">
      <a href={telHref(phone)}>
        {c.askUs}: <span className="tabular" dir="ltr">{phone}</span>
      </a>
    </Button>
  );
}

async function DocumentsPage({ locale, page, kinds, empty }: { locale: Locale; page: "parents/calendar" | "parents/handbook"; kinds: DocumentKind[]; empty: string }) {
  const c = parentsCopy[locale];
  const all = (await getDocuments(locale, "all")) ?? [];
  const docs = all.filter((d) => kinds.includes(d.kind));
  return (
    <PageShell
      locale={locale}
      page={page}
      lede={page === "parents/calendar" ? c.ledes.calendar : c.ledes.handbook}
      figure={contactFigure(locale)}
      body={
        <PageSection id="documents" tone="mist">
          {docs.length ? (
            <DocumentList locale={locale} docs={docs} />
          ) : (
            <>
              <EmptyState text={empty} />
              <AskOffice locale={locale} />
            </>
          )}
        </PageSection>
      }
    />
  );
}

// Calendar (wave 6): the key dates staff enter in maarifcms, by month, with "Add to my calendar";
// then the official calendar file. With neither, the "ask the office" note as before.
export async function CalendarPage({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const [keyDates, all] = await Promise.all([getKeyDates(locale), getDocuments(locale, "all")]);
  const dates = keyDates ?? [];
  const docs = (all ?? []).filter((d) => d.kind === "calendar");
  return (
    <PageShell
      locale={locale}
      page="parents/calendar"
      lede={c.ledes.calendar}
      figure={contactFigure(locale)}
      body={
        <>
          {dates.length ? (
            <PageSection id="dates" title={c.dates.title}>
              <AddToCalendar locale={locale} />
              <KeyDateList locale={locale} dates={dates} />
            </PageSection>
          ) : null}
          {docs.length || dates.length === 0 ? (
            <PageSection id="documents" tone="mist" title={dates.length ? c.dates.pdfTitle : undefined}>
              {docs.length ? (
                <DocumentList locale={locale} docs={docs} />
              ) : (
                <>
                  <EmptyState text={c.empty.calendar} />
                  <AskOffice locale={locale} />
                </>
              )}
            </PageSection>
          ) : null}
        </>
      }
    />
  );
}

export function HandbookPage({ locale }: { locale: Locale }) {
  return <DocumentsPage locale={locale} page="parents/handbook" kinds={["handbook", "policy", "form", "other"]} empty={parentsCopy[locale].empty.handbook} />;
}

export async function SchedulesPage({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const t = messages[locale];
  const timetable = await getTimetable(locale);
  const rows = timetable?.rows ?? [];
  return (
    <PageShell
      locale={locale}
      page="parents/schedules"
      lede={c.ledes.schedules}
      figure={contactFigure(locale)}
      body={
        <PageSection id="hours" tone="mist">
          {rows.length ? (
            <div className="overflow-x-auto rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/70">
              <table className="w-full min-w-[36rem] text-start">
                {timetable?.schoolYear ? (
                  <caption className="px-6 pt-5 text-start text-sm text-slate">
                    {c.schoolYear} {ltr(timetable.schoolYear)}
                  </caption>
                ) : null}
                <thead>
                  <tr className="border-b border-rule text-sm text-slate">
                    <th scope="col" className="px-6 py-3 text-start font-medium">{c.table.stage}</th>
                    <th scope="col" className="px-6 py-3 text-start font-medium">{c.table.campus}</th>
                    <th scope="col" className="px-6 py-3 text-start font-medium">{c.table.days}</th>
                    <th scope="col" className="px-6 py-3 text-start font-medium">{c.table.hours}</th>
                    <th scope="col" className="px-6 py-3 text-start font-medium">{c.table.note}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-rule/60 last:border-0">
                      <th scope="row" className="px-6 py-4 text-start font-bold text-heading">{stageName(locale, row.stage)}</th>
                      <td className="px-6 py-4 text-ink">{row.campus ? (t.route.places[row.campus as keyof typeof t.route.places] ?? row.campus) : ""}</td>
                      <td className="px-6 py-4 text-ink">{row.days}</td>
                      <td className="px-6 py-4 text-ink tabular" dir="ltr">
                        {row.start}–{row.end}
                      </td>
                      <td className="px-6 py-4 text-slate">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <EmptyState text={c.empty.schedules} />
              <AskOffice locale={locale} />
            </>
          )}
        </PageSection>
      }
    />
  );
}

export function MenuPage({ locale }: { locale: Locale }) {
  return <PageShell locale={locale} page="parents/menu" lede={parentsCopy[locale].ledes.menu} figure={contactFigure(locale)} body={<LazyTodaysMenu locale={locale} />} />;
}

export function FeedbackPage({ locale }: { locale: Locale }) {
  const c = parentsCopy[locale];
  const f = c.feedback;
  return (
    <PageShell
      locale={locale}
      page="parents/feedback"
      lede={c.ledes.feedback}
      figure={contactFigure(locale)}
      band={false}
      body={
        <PageSection id="feedback" tone="mist">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="mb-6 max-w-[60ch] text-lg text-ink">{f.intro}</p>
              {/* Only this language's form texts travel to the browser (Home-style JS budget). */}
              <FeedbackForm
                locale={locale}
                copy={{ kind: f.kind, kinds: f.kinds, name: f.name, phone: f.phone, email: f.email, oneWay: f.oneWay, grade: f.grade, gradeNone: f.gradeNone, message: f.message, consent: f.consent, send: f.send, sent: f.sent("{ref}") }}
              />
            </div>
            <aside className="lg:col-span-5">
              <h2 className="font-heading text-2xl font-bold text-heading">{f.procedureTitle}</h2>
              <ol className="mt-5 flex flex-col gap-4">
                {f.procedure.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-turquoise font-bold text-on-turquoise tabular">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-ink">{step}</span>
                  </li>
                ))}
              </ol>
              <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
            </aside>
          </div>
        </PageSection>
      }
    />
  );
}

export const descriptions = {
  overview: (locale: Locale) => parentsCopy[locale].lede,
  calendar: (locale: Locale) => parentsCopy[locale].ledes.calendar,
  schedules: (locale: Locale) => parentsCopy[locale].ledes.schedules,
  menu: (locale: Locale) => parentsCopy[locale].ledes.menu,
  handbook: (locale: Locale) => parentsCopy[locale].ledes.handbook,
  feedback: (locale: Locale) => parentsCopy[locale].ledes.feedback,
};
