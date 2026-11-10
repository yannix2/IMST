import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { RememberLocale } from "@/components/landing/remember-locale";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StickyHeader } from "@/components/landing/sticky-header";

// Pages outside the menu and the sitemap (wave 4: newsletter confirmed / unsubscribe): the header,
// one centred card, the footer. `path` keeps the language switch on the same page.
export function UtilityShell({ locale, path, children }: { locale: Locale; path: string; children: React.ReactNode }) {
  const t = messages[locale];
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-md bg-turquoise px-4 py-2 font-bold text-night focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.skipToContent}
      </a>
      <StickyHeader>
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
          <SiteHeader locale={locale} path={path} />
        </div>
      </StickyHeader>
      <main id="main" tabIndex={-1} className="outline-none">
        <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)] py-[var(--section-pad)]">
          <div className="mx-auto max-w-[40rem] rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-10">{children}</div>
        </div>
      </main>
      <SiteFooter locale={locale} path={path} />
      <RememberLocale locale={locale} />
    </>
  );
}
