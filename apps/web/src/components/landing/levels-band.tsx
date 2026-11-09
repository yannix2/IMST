import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { LevelCards } from "./level-cards";
import { LevelsExplorer } from "./levels-explorer";

// Right under the figures, on the same ground: the four stages as photo cards that turn over
// (wave 2), then the child's route from 4 to 18 across the two campuses, the "which level?"
// finder and the visit station. Choosing a station prefills the booking.
export function LevelsBand({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <section id="levels" aria-labelledby="levels-title" className="scroll-mt-24 pb-[var(--section-pad)]">
      <h2 id="levels-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-heading">
        {t.levels.title}
      </h2>
      <LevelCards locale={locale} />
      <p className="mt-14 mb-8 max-w-[56ch] text-lg text-slate">{t.route.hint}</p>
      <LevelsExplorer locale={locale} />
    </section>
  );
}
