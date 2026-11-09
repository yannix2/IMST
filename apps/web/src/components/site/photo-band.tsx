import type { Locale } from "@maarif/contracts/locales";
import type { PageKey } from "@/lib/navigation";
import { getPageVisual } from "@/lib/cms";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";

// A row of up to three photos inside an inner page (wave 3, C2), from maarifcms: Page photos >
// this page > Photos inside the page, places "band-1", "band-2", "band-3". Nothing is shown
// until at least one is published. PageShell puts it after the page's own sections; a page can
// place it itself (PageShell band={false}). Server HTML, lazy images, boxes sized by aspect
// ratio before the photos arrive (CLS 0).

export const bandSlots = ["band-1", "band-2", "band-3"] as const;

export async function PhotoBand({ locale, page, className }: { locale: Locale; page: PageKey; className?: string }) {
  const visual = await getPageVisual(locale, page);
  const items = bandSlots.map((slot) => visual.slots[slot]).filter((p) => p != null);
  if (items.length === 0) return null;

  const three = items.length === 3;
  return (
    <div className={cn("defer-paint mx-auto max-w-[var(--content-max)] px-[var(--gutter)] py-[calc(var(--section-pad)*0.5)]", className)}>
      <ul className={cn("grid gap-4 sm:gap-5", three ? "grid-cols-2 lg:grid-cols-12" : items.length === 2 ? "sm:grid-cols-2" : "")}>
        {items.map((photo, i) => (
          <li
            key={photo.src}
            className={cn(
              "relative overflow-hidden rounded-[var(--radius-plate)] shadow-rest ring-1 ring-rule/70",
              three
                ? i === 0
                  ? "col-span-2 aspect-[4/3] lg:col-span-7 lg:row-span-2 lg:aspect-auto"
                  : "aspect-square lg:col-span-5 lg:aspect-[16/10]"
                : items.length === 2
                  ? "aspect-[4/3]"
                  : "aspect-[16/9] lg:aspect-[21/9]",
            )}
          >
            <Photo
              photo={photo}
              locale={locale}
              sizes={three ? (i === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 40vw, 50vw") : items.length === 2 ? "(min-width: 640px) 50vw, 100vw" : "100vw"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
