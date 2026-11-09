import { CalendarCheckIcon, ChevronDownIcon, LanguagesIcon } from "lucide-react";
import { localeDirection, localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { builtAreas, menuPages, pathOf } from "@/lib/navigation";
import { visitHash } from "@/lib/visit";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CtaSpark } from "./cta-spark";
import { LanguageTabs } from "./language-tabs";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

// The top of the sign plate: badge, the page menu, the four script tabs and the next step.
// Each area opens a panel through the browser's own popover (no script: Escape and a click
// outside close it, and the button reports its state). Page links are plain links, so moving
// between pages is a document navigation that the view transition in globals.css animates.
// xl and up: area menu (seven areas since wave 3) and a compact language panel (the four tabs
// from 2xl); 2xl: Book a visit (it is also in every page's closing band); below xl: the menu sheet.
// `path` is the current page ("" on Home).

const panel =
  "fixed inset-x-0 border-0 top-[5.5rem] bottom-auto mx-auto w-[min(calc(100%-2*var(--gutter)),68rem)] rounded-[var(--radius-plate)] bg-surface p-6 text-ink shadow-raised ring-1 ring-rule/70";

export function SiteHeader({ locale, path = "" }: { locale: Locale; path?: string }) {
  const t = messages[locale];
  const p = pageNames[locale];
  const visit = path === "" ? visitHash : `/${locale}/admissions/visit`;

  return (
    <header className="flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-4">
      <a href={`/${locale}`} className="flex items-center gap-3 no-underline">
        {/* The official badge, unchanged (DESIGN.md). */}
        <img src="/brand/maarif-badge.svg" alt="" width={48} height={48} className="size-12 shrink-0" />
        <span className="max-w-[14rem] text-base font-bold leading-tight text-heading">{t.schoolName}</span>
      </a>

      <nav aria-label={t.nav.menu} className="hidden xl:block">
        <ul className="flex gap-0.5">
          {builtAreas.map((area) => {
            const head = pathOf(area.pages[0]!);
            const current = path === head || path.startsWith(`${head}/`);
            const pages = menuPages(area);
            const item = cn(
              "inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-3 font-medium text-ink no-underline transition-colors hover:bg-mist hover:text-heading",
              current && "bg-mist text-heading",
            );
            if (pages.length === 0) {
              return (
                <li key={area.key}>
                  <a href={`/${locale}${head}`} aria-current={path === head ? "page" : undefined} className={item}>
                    {p.areas[area.key]}
                  </a>
                </li>
              );
            }
            const id = `menu-${area.key}`;
            return (
              <li key={area.key}>
                <button type="button" popoverTarget={id} className={cn(item, "cursor-pointer")}>
                  {p.areas[area.key]}
                  <ChevronDownIcon aria-hidden="true" className="size-4 text-slate" />
                </button>
                <div id={id} popover="auto" aria-label={p.ui.menuOf(p.areas[area.key])} className={panel}>
                  <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
                    <a href={`/${locale}${head}`} className="group flex flex-col gap-2 rounded-[var(--radius-tile)] bg-mist p-5 no-underline">
                      <span className="font-heading text-xl font-bold text-heading">{p.pages[area.pages[0]!].title}</span>
                      <span className="text-sm text-slate">{p.pages[area.pages[0]!].blurb}</span>
                      <span className="mt-auto pt-4 text-sm font-medium text-turquoise-ink group-hover:underline">{p.ui.overview}</span>
                    </a>
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {pages.map((key) => (
                        <li key={key}>
                          <a
                            href={`/${locale}${pathOf(key)}`}
                            aria-current={path === pathOf(key) ? "page" : undefined}
                            className="flex flex-col gap-0.5 rounded-[var(--radius-tile)] p-3 no-underline transition-colors hover:bg-mist aria-[current=page]:bg-mist"
                          >
                            <span className="font-medium text-heading">{p.pages[key].title}</span>
                            <span className="text-sm text-slate">{p.pages[key].blurb}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageTabs locale={locale} label={t.nav.language} className="hidden 2xl:block" tone="ground" path={path} />
        <div className="hidden xl:block 2xl:hidden">
          <button
            type="button"
            popoverTarget="menu-language"
            aria-label={t.nav.language}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3.5 font-medium text-ink ring-1 ring-rule transition-colors hover:bg-mist"
          >
            <LanguagesIcon aria-hidden="true" className="size-4" />
            <span lang={locale}>{localeNativeName[locale]}</span>
          </button>
          <div id="menu-language" popover="auto" aria-label={t.nav.language} className={cn(panel, "w-[min(calc(100%-2*var(--gutter)),24rem)] p-3")}>
            <ul className="grid grid-cols-2 gap-1">
              {locales.map((code) => (
                <li key={code}>
                  <a
                    href={`/${code}${path}`}
                    hrefLang={code}
                    lang={code}
                    dir={localeDirection[code]}
                    aria-current={code === locale ? "page" : undefined}
                    className="flex min-h-11 items-center justify-center rounded-full px-4 font-medium text-ink no-underline hover:bg-mist aria-[current=page]:bg-navy aria-[current=page]:text-white"
                  >
                    {localeNativeName[code]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ThemeToggle label={t.nav.theme} />
        <CtaSpark className="hidden 2xl:inline-flex">
          <Button asChild>
            <a href={visit}>
              <CalendarCheckIcon data-icon="inline-start" />
              {t.station.bookVisit}
            </a>
          </Button>
        </CtaSpark>
        <MobileNav locale={locale} path={path} />
      </div>
    </header>
  );
}
