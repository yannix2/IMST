import type { Locale } from "@maarif/contracts/locales";
import { journeyCopy, journeyPhotos, milestones } from "@/content/home/journey";
import { HairlineIcon } from "@/components/hairline/icon";
import { DraftNote } from "@/components/site/blocks";
import { Photo, slotPhoto } from "@/components/site/photo";
import { getPageVisual } from "@/lib/cms";
import { showPreviews } from "@/lib/home-content";
import { JourneyStack } from "./journey-stack";
import { SectionHeading } from "./section-heading";

// "Our journey in Tunisia" (wave 2, task 6.3): the school today in a fan of photos (designali
// gallery, 21st.dev), then its milestones on a line, each from the old site's own news.
// Milestones the school still has to confirm (founding year, campus openings) appear only in
// development, marked [to confirm].
export async function Journey({ locale }: { locale: Locale }) {
  const c = journeyCopy[locale];
  const visual = await getPageVisual(locale, "home");
  const shown = milestones.filter((m) => m.confirmed || showPreviews);
  const cards = journeyPhotos.map((id, i) => ({
    key: id,
    node: <Photo photo={slotPhoto(visual, `journey-${i + 1}`, id)!} locale={locale} sizes="220px" />,
  }));

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-24 overflow-hidden py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <SectionHeading id="journey-title" eyebrow={c.eyebrow} title={c.title} lede={c.lede} icon={<HairlineIcon name="door" className="w-16 text-heading" />} />
      </div>
      <p className="mt-10 mb-4 text-center text-sm font-bold tracking-wide text-slate uppercase">{c.today}</p>
      <JourneyStack cards={cards} label={c.today} />
      <div className="mx-auto mt-12 max-w-[var(--content-max)] px-[var(--gutter)]">
        <ol className="grid gap-6 md:grid-cols-2 md:gap-x-12 lg:grid-cols-3">
          {shown.map((m) => (
            <li key={m.key} className="relative border-s-2 border-turquoise ps-6 pb-1">
              <span aria-hidden="true" className="absolute -start-[0.45rem] top-1.5 size-3 rounded-full bg-turquoise ring-4 ring-ground" />
              <p className="font-bold text-turquoise-ink tabular-nums">
                {m.year}
                {!m.confirmed ? <span className="ms-2 rounded-full bg-notice/10 px-2 py-0.5 text-xs text-notice">{c.toConfirm}</span> : null}
              </p>
              <h3 className="mt-1 font-bold text-heading">{m.title[locale]}</h3>
              <p className="mt-1 text-slate">{m.text[locale]}</p>
            </li>
          ))}
        </ol>
        <DraftNote>PROPOSAL: milestones from the old site’s news; founding year and campus openings to be provided by the school</DraftNote>
      </div>
    </section>
  );
}
