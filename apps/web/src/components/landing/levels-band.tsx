import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { LevelsExplorer } from "./levels-explorer";

// Right under the hero, on the same ground: the child's route from 4 to 18 across the two
// campuses, the "which level?" finder and the visit station. Choosing a station prefills the
// booking.
export function LevelsBand({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <section id="levels" aria-labelledby="levels-title" className="scroll-mt-24 pb-[var(--section-pad)]">
      <h2 id="levels-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-heading">
        {t.levels.title}
      </h2>
      <p className="mt-2 mb-8 max-w-[56ch] text-lg text-slate">{t.route.hint}</p>
      <LevelsExplorer locale={locale} />
    </section>
  );
}
