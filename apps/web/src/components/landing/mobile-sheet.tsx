// The phone menu's sheet (Radix Dialog). Loaded on the first press of "Menu" (mobile-nav.tsx),
// a client component, so no entry directive here. Every built area with its pages, then the
// language tabs; the current page is marked.
import { localeDirection, type Locale } from "@maarif/contracts/locales";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { builtAreas, menuPages, pathOf } from "@/lib/navigation";
import { LanguageTabs } from "./language-tabs";

type Props = { locale: Locale; path: string; id: string; triggerId: string; open: boolean; onOpenChange: (open: boolean) => void };

export default function MobileSheet({ locale, path, id, triggerId, open, onOpenChange }: Props) {
  const t = messages[locale];
  const p = pageNames[locale];
  const side = localeDirection[locale] === "rtl" ? "left" : "right";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id={id}
        side={side}
        className="plate overflow-y-auto border-0 bg-navy text-white"
        // The trigger lives outside this lazily loaded sheet, so hand focus back to it by hand.
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById(triggerId)?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-white">{t.schoolName}</SheetTitle>
        </SheetHeader>
        <nav aria-label={t.nav.menu} className="px-4">
          <ul className="flex flex-col gap-5">
            <li>
              <a href={`/${locale}`} aria-current={path === "" ? "page" : undefined} className="font-heading text-xl font-bold text-white no-underline">
                {p.ui.home}
              </a>
            </li>
            {builtAreas.map((area) => {
              const head = area.pages[0]!;
              return (
                <li key={area.key} className="flex flex-col gap-1 border-t border-white/15 pt-4">
                  <a
                    href={`/${locale}${pathOf(head)}`}
                    aria-current={path === pathOf(head) ? "page" : undefined}
                    className="font-heading text-xl font-bold text-white no-underline aria-[current=page]:text-turquoise"
                  >
                    {p.areas[area.key]}
                  </a>
                  <ul className="flex flex-col">
                    {menuPages(area).map((key) => (
                      <li key={key}>
                        <a
                          href={`/${locale}${pathOf(key)}`}
                          aria-current={path === pathOf(key) ? "page" : undefined}
                          className="flex min-h-11 items-center text-on-plate-muted no-underline aria-[current=page]:font-bold aria-[current=page]:text-white"
                        >
                          {p.pages[key].title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
        <LanguageTabs locale={locale} label={t.nav.language} className="px-4 pt-6 pb-8" path={path} />
      </SheetContent>
    </Sheet>
  );
}
