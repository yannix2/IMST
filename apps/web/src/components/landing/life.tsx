import { CalendarDaysIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { photos, type PhotoId } from "@/content/media";
import { homeCopy, lifeEvents, type LifeEvent } from "@/content/home/wave2";
import { FlipCard } from "@/components/site/flip-card";
import { Photo, slotPhoto } from "@/components/site/photo";
import { getPageVisual } from "@/lib/cms";
import { HairlineIcon } from "@/components/hairline/icon";
import { DraftNote } from "@/components/site/blocks";
import { LifeFan } from "./life-fan";
import { SectionHeading } from "./section-heading";

// Life at Maarif (wave 2): one card per moment of the school year, in date order, fanned out by
// the 21st.dev card fan; each card turns over to its story. Photos are the school's own
// (content/media.ts, owner checkpoint A); stories describe what the photos show or repeat the old
// site's news. Replaces the CMS coverflow gallery on Home (that returns on /gallery, wave 3).

const photoOf: Record<LifeEvent, PhotoId> = {
  "back-to-school": "back-to-school",
  "teachers-day": "teachers-day-staff",
  archery: "archery-targets",
  "kind-words": "kind-words-paper",
  "teeth-brushing": "teeth-brushing-hands",
  "farm-trip": "farm-pond",
  "model-oic": "model-oic",
  "traditional-day": "traditional-day-ebru",
  "maarif-talks": "maarif-talks",
  "end-of-year": "end-of-year-stage",
  graduation: "graduation-plaque",
  "pink-day": "pink-day-staff",
};

const dateTag: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };
const monthYear = (locale: Locale, iso: string | null) =>
  iso ? new Intl.DateTimeFormat(dateTag[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`)) : "";

// Photos: maarifcms "Page photos" for Home, slots life-<event>; the built-in set until then.
export async function Life({ locale }: { locale: Locale }) {
  const visual = await getPageVisual(locale, "home");
  const c = homeCopy[locale].life;
  const moments = [...lifeEvents].sort((a, b) => (photos[photoOf[a]].date ?? "").localeCompare(photos[photoOf[b]].date ?? ""));

  const cards = moments.map((event) => {
    const story = c.events[event];
    const when = monthYear(locale, photos[photoOf[event]].date);
    return {
      key: event,
      node: (
        <FlipCard
          title={story.title}
          openLabel={c.open}
          closeLabel={c.close}
          className="size-full shadow-raised"
          front={
            <div className="relative size-full bg-night">
              <Photo photo={slotPhoto(visual, `life-${event}`, photoOf[event])!} locale={locale} sizes="(min-width: 1024px) 19rem, (min-width: 640px) 16rem, 14rem" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgb(11_42_71/0.9)_0%,rgb(11_42_71/0.3)_40%,transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-sm font-medium text-white/80">{when}</p>
                <h3 className="text-lg leading-tight font-bold">{story.title}</h3>
              </div>
            </div>
          }
          back={
            <div className="flex size-full flex-col bg-turquoise-wash p-5 pe-14 text-ink">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-turquoise-ink">
                <CalendarDaysIcon aria-hidden="true" className="size-4" />
                {when}
              </p>
              <h3 className="mt-2 text-xl leading-tight font-bold text-heading">{story.title}</h3>
              <p className="mt-3 leading-relaxed">{story.story}</p>
            </div>
          }
        />
      ),
    };
  });

  return (
    <section id="life" aria-labelledby="life-title" className="scroll-mt-24 overflow-hidden bg-mist py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <SectionHeading id="life-title" title={c.title} lede={c.lede} icon={<HairlineIcon name="schoolhouse" className="w-20 text-heading" />} />
        <DraftNote>PROPOSAL: event stories written from the photos and the old site’s news; the school to review before launch</DraftNote>
      </div>
      <LifeFan
        cards={cards}
        label={c.label}
        previousLabel={c.previous}
        nextLabel={c.next}
        positions={moments.map((_, i) => c.position(i + 1, moments.length))}
      />
    </section>
  );
}
