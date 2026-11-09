import { ArrowUpRightIcon, BookOpenIcon, CalendarDaysIcon, ClockIcon, DownloadIcon, MessageSquareHeartIcon, UtensilsIcon } from "lucide-react";
import type { DocumentKind, SchoolDocument } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { getDocuments, getTimetable } from "@/lib/cms";
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
              {[doc.schoolYear ? `${c.schoolYear} ${doc.schoolYear}` : "", doc.validUntil ? `${c.validUntil} ${formatDate(locale, doc.validUntil)}` : "", doc.bytes ? c.pdf(formatBytes(locale, doc.bytes)) : ""]
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

export function CalendarPage({ locale }: { locale: Locale }) {
  return <DocumentsPage locale={locale} page="parents/calendar" kinds={["calendar"]} empty={parentsCopy[locale].empty.calendar} />;
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
                    {c.schoolYear} {timetable.schoolYear}
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
              <FeedbackForm locale={locale} />
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
