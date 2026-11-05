import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { campuses, schoolEmail } from "@/lib/school";
import { localizedUrl, siteUrl } from "@/lib/site";
import { Admissions } from "@/components/landing/admissions";
import { Campuses } from "@/components/landing/campuses";
import { FinalCta } from "@/components/landing/final-cta";
import { LazyFaq, LazyGallery, LazyHeadMessage, LazyNews, LazyTestimonials, LazyTodaysMenu } from "@/components/landing/lazy-sections";
import { LevelsBand } from "@/components/landing/levels-band";
import { StickyHeader } from "@/components/landing/sticky-header";
import { RememberLocale } from "@/components/landing/remember-locale";
import { StickyCta } from "@/components/landing/sticky-cta";
import { Hero } from "@/components/landing/hero";
import { Reasons } from "@/components/landing/reasons";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = messages[locale];
  return {
    title: t.schoolName,
    description: t.hero.lede,
    openGraph: { title: t.schoolName, description: t.hero.lede, locale, type: "website", url: localizedUrl(locale) },
  };
}

// Structured data from confirmed facts only (contact page, age table). No ratings, numbers or claims.
function jsonLd(locale: Locale) {
  const t = messages[locale];
  const school = (name: string, address: string, phones: readonly string[]) => ({
    "@type": "School",
    name: `${t.schoolName}: ${name}`,
    address: { "@type": "PostalAddress", streetAddress: address, addressCountry: "TN" },
    telephone: phones,
  });
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: t.schoolName,
    url: localizedUrl(locale),
    logo: new URL("/brand/maarif-badge.svg", siteUrl).toString(),
    email: schoolEmail,
    inLanguage: locale,
    availableLanguage: ["en", "fr", "ar", "tr"],
    subOrganization: [
      school(t.campuses.highSchool, campuses.highSchool.address, campuses.highSchool.phones),
      school(t.campuses.schools, campuses.schools.address, campuses.schools.phones),
    ],
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-turquoise px-4 py-2 font-bold text-night focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {t.skipToContent}
      </a>
      <StickyHeader>
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
          <SiteHeader locale={locale} />
        </div>
      </StickyHeader>
      <main id="main" tabIndex={-1} className="outline-none">
        {/* The first section sits on the page ground: white in light, night navy in dark. */}
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
          <Hero locale={locale} />
          <LevelsBand locale={locale} />
        </div>
        {/* Sections staff fill in maarifcms stay absent until something is published. */}
        <Reasons locale={locale} />
        <LazyHeadMessage locale={locale} />
        <Admissions locale={locale} />
        <LazyGallery locale={locale} />
        <LazyTestimonials locale={locale} />
        <LazyNews locale={locale} />
        <LazyFaq locale={locale} />
        <FinalCta locale={locale} />
        <Campuses locale={locale} />
        <LazyTodaysMenu locale={locale} />
      </main>
      <SiteFooter locale={locale} />
      <StickyCta locale={locale} />
      <RememberLocale locale={locale} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(locale)) }} />
    </>
  );
}
