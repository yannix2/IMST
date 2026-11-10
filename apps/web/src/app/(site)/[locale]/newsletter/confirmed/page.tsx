import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { isLocale } from "@maarif/contracts/locales";
import { newsletterCopy } from "@/content/newsletter";
import { messages } from "@/i18n/messages";
import { UtilityShell } from "@/components/site/utility-shell";

// Where the confirmation link of a newsletter sign-up lands (wave 4, B4): maarif-api confirms the
// subscription, then redirects here, with ?status=invalid or ?status=error when it could not.
// Outside the menu and the sitemap; not indexed.

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${newsletterCopy[locale].heading} | ${messages[locale].schoolName}`, robots: { index: false, follow: false } };
}

export default async function NewsletterConfirmed({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { status } = await searchParams;
  const c = newsletterCopy[locale];
  const state = status === "invalid" ? "invalid" : status === "error" ? "error" : "ok";
  const [title, text] = c.confirmed[state];
  const Icon = state === "ok" ? CheckCircle2Icon : TriangleAlertIcon;
  return (
    <UtilityShell locale={locale} path="/newsletter/confirmed">
      <Icon aria-hidden="true" className={state === "ok" ? "size-10 text-turquoise-ink" : "size-10 text-destructive"} />
      <h1 className="mt-4 text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">{title}</h1>
      <p className="mt-3 text-lg text-ink">{text}</p>
      <a href={`/${locale}`} className="mt-8 inline-block font-medium text-turquoise-ink">
        {c.home}
      </a>
    </UtilityShell>
  );
}
