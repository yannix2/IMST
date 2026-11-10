import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@maarif/contracts/locales";
import { newsletterCopy } from "@/content/newsletter";
import { messages } from "@/i18n/messages";
import { schoolEmail } from "@/lib/school";
import { UtilityShell } from "@/components/site/utility-shell";
import { UnsubscribeButton } from "@/components/site/unsubscribe-button";

// The unsubscribe link of every newsletter (wave 4, B4). Opening the page changes nothing (mail
// scanners open links); the button does. Rendered per request so the page already knows whether
// the link is well formed (no state swap, nothing moves). Mail clients' own "Unsubscribe" uses
// the one-click POST and never comes here.

const TOKEN = /^\d{1,12}\.[A-Za-z0-9_-]{32}$/;
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ t?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${newsletterCopy[locale].unsubscribe.title} | ${messages[locale].schoolName}`, robots: { index: false, follow: false } };
}

export default async function NewsletterUnsubscribe({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { t } = await searchParams;
  const token = typeof t === "string" && TOKEN.test(t) ? t : null;
  const c = newsletterCopy[locale];
  return (
    <UtilityShell locale={locale} path="/newsletter/unsubscribe">
      <h1 className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">{c.unsubscribe.title}</h1>
      <UnsubscribeButton locale={locale} email={schoolEmail} token={token} />
      <a href={`/${locale}`} className="mt-8 inline-block font-medium text-turquoise-ink">
        {c.home}
      </a>
    </UtilityShell>
  );
}
