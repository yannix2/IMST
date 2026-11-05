import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@maarif/contracts/locales";
import type { PageKey } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-meta";

// Every inner page has its own route file under app/(site)/[locale]/ (generated from the
// navigation tree), so a page ships only the client parts it uses. Each file calls this with
// its page component and, optionally, its search description.

type Params = { params: Promise<{ locale: string }> };
type PageComponent = (props: { locale: Locale }) => React.ReactNode | Promise<React.ReactNode>;

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
