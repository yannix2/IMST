import { localeDirection, locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { builtAreas, legalPages, menuPages, pathOf } from "@/lib/navigation";
import { campuses, schoolEmail, telHref } from "@/lib/school";
import { SocialLinks } from "@/components/site/social-links";
import { LanguageTabs } from "./language-tabs";

const cookieSettings: Record<Locale, string> = { en: "Cookie settings", fr: "Réglages des cookies", ar: "إعدادات ملفات تعريف الارتباط", tr: "Çerez ayarları" };

// The closing sign: the school's name in all four scripts, every built page grouped by area,
// both campuses' phones, the social accounts, the language tabs again and the legal pages.
export function SiteFooter({ locale, path = "" }: { locale: Locale; path?: string }) {
  const t = messages[locale];
  const p = pageNames[locale];
  const linkAreas = builtAreas.filter((a) => a.key !== "contact");

  return (
    <footer className="plate bg-night text-white">
      <div className="mx-auto flex max-w-[var(--content-max)] flex-col gap-12 px-[var(--gutter)] pt-14 pb-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src="/brand/maarif-badge.svg" alt="" width={72} height={72} className="size-18 shrink-0" />
            <ul className="flex flex-col gap-0.5">
              {locales.map((code) => (
                <li key={code} lang={code} dir={localeDirection[code]} className={code === locale ? "text-lg font-bold" : "text-on-plate-muted"}>
                  {messages[code].schoolName}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-sm text-on-plate-muted">{p.ui.followUs}</p>
            <SocialLinks label={p.ui.social} />
          </div>
        </div>

        <nav aria-label={p.ui.inThisSection} className="grid gap-x-8 gap-y-10 border-t border-white/12 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {linkAreas.map((area) => (
            <div key={area.key} className="flex flex-col gap-3">
              <a href={`/${locale}${pathOf(area.pages[0]!)}`} className="font-heading text-lg font-bold text-white no-underline hover:underline">
                {p.areas[area.key]}
              </a>
              <ul className="flex flex-col gap-1.5">
                {menuPages(area).map((key) => (
                  <li key={key}>
                    <a href={`/${locale}${pathOf(key)}`} className="text-on-plate-muted no-underline hover:text-white hover:underline">
                      {p.pages[key].title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <a href={`/${locale}/contact`} className="font-heading text-lg font-bold text-white no-underline hover:underline">
              {p.areas.contact}
            </a>
            <dl className="flex flex-col gap-3 text-on-plate-muted">
              {(["schools", "highSchool"] as const).map((key) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="font-medium text-white">{t.route.places[key]}</dt>
                  {campuses[key].phones.map((phone) => (
                    <dd key={phone}>
                      <a href={telHref(phone)} dir="ltr" className="tabular text-on-plate-muted no-underline hover:text-white hover:underline">
                        {phone}
                      </a>
                    </dd>
                  ))}
                </div>
              ))}
              <div>
                <dt className="sr-only">{t.campuses.email}</dt>
                <dd>
                  <a href={`mailto:${schoolEmail}`} className="break-all text-on-plate-muted no-underline hover:text-white hover:underline">
                    {schoolEmail}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </nav>

        <div className="flex flex-col gap-4 border-t border-white/12 pt-8 md:flex-row md:items-center md:justify-between">
          <LanguageTabs locale={locale} label={t.footer.languages} path={path} />
          <div className="flex flex-col gap-3 md:items-end">
            <ul aria-label={p.areas.legal} className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {legalPages.map((key) => (
                <li key={key}>
                  <a href={`/${locale}${pathOf(key)}`} className="text-on-plate-muted no-underline hover:text-white hover:underline">
                    {p.pages[key].title}
                  </a>
                </li>
              ))}
              {/* Shown by the cookie banner (components/site/consent.tsx) once analytics exists. */}
              <li data-cookie-settings hidden>
                <button type="button" className="cursor-pointer text-on-plate-muted hover:text-white hover:underline">
                  {cookieSettings[locale]}
                </button>
              </li>
            </ul>
            <p className="text-sm text-on-plate-muted">
              © {new Date().getFullYear()} {t.schoolName}. {t.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
