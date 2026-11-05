import { BusIcon, MessageCircleIcon, ReceiptTextIcon, UtensilsIcon } from "lucide-react";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { whatsappForPage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Admissions } from "@/components/landing/admissions";
import { LazyFaq, LazyTodaysMenu } from "@/components/landing/lazy-sections";
import { Ask } from "./shared";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { admissionsFigure } from "../figures";
import { copy } from "./shared";

// The Admissions overview, questions, bus and canteen, and fees pages (copy in shared.tsx).

export function AdmissionsPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="admissions"
      lede={c.lede.admissions}
      figure={admissionsFigure(locale)}
      body={
        <>
          <Admissions locale={locale} visitHref={`/${locale}/admissions/visit`} />
          <PageSection id="rules" tone="mist" title={c.rulesTitle}>
            <ul className="grid gap-5 md:grid-cols-3">
              {c.rules.map((r) => (
                <li key={r} className="rounded-[var(--radius-plate)] bg-surface p-6 text-lg text-ink shadow-rest ring-1 ring-rule/70">
                  {r}
                </li>
              ))}
            </ul>
          </PageSection>
        </>
      }
    />
  );
}

export function FaqPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="admissions/faq"
      lede={c.lede.faq}
      figure={admissionsFigure(locale)}
      body={
        <>
          <LazyFaq locale={locale} />
          <PageSection id="ask" tone="mist">
            <div className="flex flex-col gap-5 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xl font-bold text-heading">{c.faqMore}</p>
              <Ask locale={locale} page="admissions/faq" label={messages[locale].station.whatsapp} />
            </div>
          </PageSection>
        </>
      }
    />
  );
}

export function BusCanteenPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="admissions/bus-canteen"
      lede={c.lede.bus}
      figure={admissionsFigure(locale)}
      body={
        <>
          <PageSection id="services" tone="mist">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { icon: BusIcon, title: c.busTitle, text: c.bus },
                { icon: UtensilsIcon, title: c.canteenTitle, text: c.canteen },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:p-9">
                  <span aria-hidden="true" className="grid size-14 place-items-center rounded-[var(--radius-tile)] bg-navy text-white">
                    <Icon className="size-7" strokeWidth={1.75} />
                  </span>
                  <h2 className="text-2xl font-bold text-heading">{title}</h2>
                  <p className="text-lg text-slate">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-6">
              <Ask locale={locale} page="admissions/bus-canteen" label={messages[locale].station.whatsapp} />
            </div>
          </PageSection>
          <LazyTodaysMenu locale={locale} />
        </>
      }
    />
  );
}

export function FeesPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const p = pageNames[locale];
  return (
    <PageShell
      locale={locale}
      page="admissions/fees"
      lede={c.lede.fees}
      figure={admissionsFigure(locale)}
      body={
        <PageSection id="fees-ask" tone="mist">
          <div className="plate flex flex-col gap-6 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised sm:p-10">
            <ReceiptTextIcon aria-hidden="true" className="size-10 text-turquoise" strokeWidth={1.5} />
            <h2 className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold">{c.feesTitle}</h2>
            <p className="max-w-[56ch] text-lg text-on-plate-muted">{c.fees}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappForPage(locale, "admissions/fees")} target="_blank" rel="noopener noreferrer">
                  <MessageCircleIcon data-icon="inline-start" />
                  {c.feesAsk}
                </a>
              </Button>
              <Button asChild size="lg" variant="plate">
                <a href={`/${locale}/admissions/pre-register`}>{p.pages["admissions/pre-register"].title}</a>
              </Button>
            </div>
          </div>
        </PageSection>
      }
    />
  );
}

