import { ArrowRightIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { photos, type PhotoId } from "@/content/media";
import { homeCopy } from "@/content/home/wave2";
import { HairlineIcon } from "@/components/hairline/icon";
import { DraftNote } from "@/components/site/blocks";
import { getPageVisual } from "@/lib/cms";
import { CambridgeGallery } from "./cambridge-gallery";
import { SectionHeading } from "./section-heading";

// The Cambridge pathway on Home (wave 2): the Cambridge mark (temporary file until the school's
// official logo pack, owner 2026-11-06), the four international milestones from the level pages,
// a link to /programs/cambridge, and learning photos turning in the 21st.dev circular gallery.
// The accreditation itself stays [PROPOSAL] until the certificate is on file (product.md).

// In the order of copy.cambridge.captions.
const cambridgePhotos: PhotoId[] = [
  "microscope-from-above",
  "microscope-hands",
  "kind-words-outline",
  "tracing-hands",
  "kindergarten-classroom",
  "teeth-brushing-hands",
  "pink-day-class",
  "graduation-plaque",
];

// Photos: maarifcms "Page photos" for Home, slots cambridge-1 … cambridge-8 (the captions keep
// their order); the built-in set until then.
export async function Cambridge({ locale }: { locale: Locale }) {
  const c = homeCopy[locale].cambridge;
  const visual = await getPageVisual(locale, "home");
  const items = cambridgePhotos.map((id, i) => {
    const cms = visual.slots[`cambridge-${i + 1}`];
    return cms
      ? { image: `${cms.src}?w=960&f=webp`, text: c.captions[i] ?? "", alt: cms.alt }
      : { image: `/media/photos/${id}-960.webp`, text: c.captions[i] ?? "", alt: photos[id].alt[locale] };
  });

  return (
    <section id="cambridge" aria-labelledby="cambridge-title" className="scroll-mt-24 overflow-hidden py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-10 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <img src="/brand/partners/cambridge-temporary.svg" alt={c.logoAlt} width={240} height={60} loading="lazy" className="mb-6 h-12 w-auto dark:rounded-lg dark:bg-white dark:p-2 dark:h-14" />
          <DraftNote>{c.temporaryLogo}</DraftNote>
          <SectionHeading id="cambridge-title" title={c.title} lede={c.lede} icon={<HairlineIcon name="staircase" className="w-20 text-heading" />} className="mt-4" />
          <h3 className="mt-8 font-bold text-heading">{c.stagesTitle}</h3>
          <ol className="relative mt-4 space-y-3 border-s-2 border-turquoise ps-5">
            {c.stages.map((stage) => (
              <li key={stage.name} className="relative">
                <span aria-hidden="true" className="absolute -start-[1.72rem] top-1.5 size-3 rounded-full bg-turquoise ring-4 ring-ground" />
                <p className="font-bold text-heading">{stage.name}</p>
                <p className="text-sm text-slate">{stage.when}</p>
              </li>
            ))}
          </ol>
          <a href={`/${locale}/programs/cambridge`} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-turquoise px-6 font-bold text-on-turquoise shadow-cta transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-cta-hover">
            {c.link}
            <ArrowRightIcon aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </a>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <CambridgeGallery items={items} label={c.galleryLabel} previousLabel={c.previous} nextLabel={c.next} />
        </div>
      </div>
    </section>
  );
}
