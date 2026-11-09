import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@maarif/contracts/locales";
import type { PageKey } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-meta";
import { localizedUrl } from "@/lib/site";
import { messages } from "@/i18n/messages";

// Every inner page has its own route file under app/(site)/[locale]/ (generated from the
// navigation tree), so a page ships only the client parts it uses. Each file calls this with
// its page component and, optionally, its search description.

type Params = { params: Promise<{ locale: string }> };
type PageComponent = (props: { locale: Locale }) => React.ReactNode | Promise<React.ReactNode>;

// Detail pages under a page (a news article, an album, a job opening): rendered on first visit,
// then kept and refreshed like the other CMS pages (lib/cms.ts tags). A slug that does not
// exist, or is not ready in this language, is a 404. Canonical only: a translation may be missing.
type DetailParams = { params: Promise<{ locale: string; slug: string }> };
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function detailRoute<T>(
  path: (slug: string) => string,
  load: (locale: Locale, slug: string) => Promise<T | null>,
  meta: (item: T) => { title: string; description: string },
  Page: (props: { locale: Locale; item: T }) => React.ReactNode | Promise<React.ReactNode>,
) {
  const resolve = async ({ params }: DetailParams) => {
    const { locale, slug } = await params;
    if (!isLocale(locale) || !slugPattern.test(slug)) return null;
    const item = await load(locale, slug);
    return item ? { locale, slug, item } : null;
  };
  return {
    generateStaticParams: async () => [],
    async generateMetadata(props: DetailParams): Promise<Metadata> {
      const found = await resolve(props);
      if (!found) return {};
      const { title, description } = meta(found.item);
      const full = `${title} | ${messages[found.locale].schoolName}`;
      const url = localizedUrl(found.locale, path(found.slug));
      return { title: full, description, alternates: { canonical: url }, openGraph: { title: full, description, locale: found.locale, type: "article", url } };
    },
    async Page(props: DetailParams) {
      const found = await resolve(props);
      if (!found) notFound();
      return <Page locale={found.locale} item={found.item} />;
    },
  };
}

export function innerRoute(key: PageKey, Page: PageComponent, description?: (locale: Locale) => string) {
  return {
    async generateMetadata({ params }: Params): Promise<Metadata> {
      const { locale } = await params;
      return isLocale(locale) ? pageMetadata(locale, key, description?.(locale)) : {};
    },
    async Page({ params }: Params) {
      const { locale } = await params;
      if (!isLocale(locale)) notFound();
      return <Page locale={locale} />;
    },
  };
}
