import { ArrowLeftIcon, ArrowUpRightIcon, BriefcaseIcon, CalendarClockIcon, CheckIcon, MapPinIcon } from "lucide-react";
import type { Job, JobSummary } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { getJobs } from "@/lib/cms";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { RichText } from "@/components/site/rich-text";
import { EmptyState, formatDate } from "@/components/site/cms-bits";
import { ApplicationForm } from "@/components/site/application-form";
import { aboutFigure } from "../figures";
import { careersCopy } from "./copy";

// Careers (wave 3, D4): working at the school, the openings staff publish in maarifcms (Jobs),
// each with its application form, and an open application on the Careers page.

export const jobHref = (locale: Locale, slug: string) => `/${locale}/careers/openings/${slug}`;

function JobFacts({ locale, job }: { locale: Locale; job: JobSummary & { startsOn?: string | null } }) {
  const c = careersCopy[locale];
  const t = messages[locale];
  const items = [
    job.campus ? { icon: MapPinIcon, label: c.campus, value: t.route.places[job.campus as keyof typeof t.route.places] ?? job.campus } : null,
    job.contract ? { icon: BriefcaseIcon, label: c.contract, value: job.contract } : null,
    job.startsOn ? { icon: CalendarClockIcon, label: c.startsOn, value: formatDate(locale, job.startsOn) } : null,
    job.closesOn ? { icon: CalendarClockIcon, label: c.closesOn, value: formatDate(locale, job.closesOn) } : null,
  ].filter((x) => x !== null);
  if (items.length === 0) return null;
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-ink">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-4 shrink-0 text-turquoise-ink" />
          <dt className="text-slate">{label}:</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function JobList({ locale, jobs }: { locale: Locale; jobs: JobSummary[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {jobs.map((job) => (
        <li key={job.slug}>
          <a
            href={jobHref(locale, job.slug)}
            className="group flex flex-col gap-3 rounded-[var(--radius-plate)] bg-surface p-6 no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-rest-hover"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="font-heading text-xl font-bold text-heading">{job.title}</span>
              <ArrowUpRightIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink rtl:-scale-x-100" />
            </span>
            {job.summary ? <span className="text-slate">{job.summary}</span> : null}
            <JobFacts locale={locale} job={job} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export async function CareersPage({ locale }: { locale: Locale }) {
  const c = careersCopy[locale];
  const jobs = (await getJobs(locale)) ?? [];
  return (
    <PageShell
      locale={locale}
      page="careers"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="why" title={c.whyTitle}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {c.why.map((line) => (
                <li key={line} className="flex gap-4 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-turquoise text-on-turquoise">
                    <CheckIcon className="size-5" />
                  </span>
                  <span className="pt-1 text-lg text-ink">{line}</span>
                </li>
              ))}
            </ul>
          </PageSection>
          <PageSection id="openings" tone="mist" title={c.openingsTitle}>
            {jobs.length ? <JobList locale={locale} jobs={jobs.slice(0, 5)} /> : <EmptyState text={c.empty} />}
          </PageSection>
          <PageSection id="open-application" title={c.openTitle} lede={c.openText}>
            <div className="max-w-3xl">
              <ApplicationForm locale={locale} job="open" />
            </div>
          </PageSection>
        </>
      }
    />
  );
}

export async function OpeningsPage({ locale }: { locale: Locale }) {
  const c = careersCopy[locale];
  const jobs = (await getJobs(locale)) ?? [];
  return (
    <PageShell
      locale={locale}
      page="careers/openings"
      lede={c.openText}
      figure={aboutFigure(locale)}
      band={false}
      body={
        <PageSection id="openings-list" tone="mist">
          {jobs.length ? (
            <JobList locale={locale} jobs={jobs} />
          ) : (
            <>
              <EmptyState text={c.empty} />
              <a href={`/${locale}/careers#open-application`} className="mt-6 inline-flex items-center gap-1 font-bold text-turquoise-ink">
                {c.openTitle}
                <ArrowUpRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </a>
            </>
          )}
        </PageSection>
      }
    />
  );
}

export function JobPage({ locale, item }: { locale: Locale; item: Job }) {
  const c = careersCopy[locale];
  return (
    <PageShell
      locale={locale}
      page="careers/openings"
      title={item.title}
      lede={item.summary || undefined}
      photo={null}
      figure={aboutFigure(locale)}
      band={false}
      body={
        <PageSection id="job">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-6">
              <JobFacts locale={locale} job={item} />
              <RichText blocks={item.body} />
              <a href={`/${locale}/careers/openings`} className="inline-flex items-center gap-2 font-bold text-turquoise-ink">
                <ArrowLeftIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                {c.backToOpenings}
              </a>
            </div>
            <div className="lg:col-span-6">
              <h2 className="mb-5 font-heading text-2xl font-bold text-heading">{c.applyTitle}</h2>
              <ApplicationForm locale={locale} job={item.slug} position={item.title} />
            </div>
          </div>
        </PageSection>
      }
    />
  );
}

export const descriptions = {
  overview: (locale: Locale) => careersCopy[locale].lede,
  openings: (locale: Locale) => careersCopy[locale].openText,
};
