import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, localeDirection, locales } from "@maarif/contracts/locales";
import { fontVariables } from "@/lib/fonts";
import { languageAlternates, localizedUrl, siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "../../globals.css";

// Only the four launch locales exist; any other first segment is a 404, never a render.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    metadataBase: siteUrl,
    alternates: { canonical: localizedUrl(locale), languages: languageAlternates() },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // data-theme is set by the head script before React hydrates, hence suppressHydrationWarning.
    <html lang={locale} dir={localeDirection[locale]} className={`${fontVariables} font-root`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
