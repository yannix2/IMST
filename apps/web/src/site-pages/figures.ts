import { localeNativeName, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import type { FigureName } from "@/components/hairline/page-figure";

// The Hairline figure of each area's page headers (plan 2.4): About = the symbol rosette,
// Contact = the schoolhouse. Programs and Admissions get theirs when drawn (plan 2.2, 2.3).

type HeroFigure = { name: FigureName; label: string; captions?: Record<string, string> };

export function aboutFigure(locale: Locale): HeroFigure {
  // The rosette's read-out is a language code; the caption names it in its own script.
  return { name: "rosette", label: messages[locale].hero.figureLabel, captions: { ...localeNativeName } };
}

// The Cambridge programme names are the same in every language (Cambridge International's own).
export const cambridgeStages = {
  "early-years": "Cambridge Early Years",
  primary: "Cambridge Primary",
  "lower-secondary": "Cambridge Lower Secondary",
  igcse: "Cambridge IGCSE",
  "as-a-level": "Cambridge AS & A Level",
} as const;

const staircaseLabel: Record<Locale, string> = {
  en: "The Cambridge pathway as five steps, from Early Years to AS and A Level. Point at a step to raise it.",
  fr: "Le parcours Cambridge en cinq marches, des Early Years aux AS et A Levels. Pointez une marche pour la soulever.",
  ar: "مسار كامبريدج في خمس درجات، من Early Years إلى AS و A Level. أشيروا إلى درجة لترفعوها.",
  tr: "Early Years’ten AS ve A Level’a beş basamakta Cambridge yolu. Bir basamağı yükseltmek için üzerine gelin.",
};

export function programsFigure(locale: Locale): HeroFigure {
  return { name: "staircase", label: staircaseLabel[locale], captions: { ...cambridgeStages } };
}

const doorLabel: Record<Locale, string> = {
  en: "Four stepping stones up to the school’s door, one per admission step. Point at a stone and the door opens wider.",
  fr: "Quatre pierres de gué jusqu’à la porte de l’école, une par étape d’admission. Pointez une pierre et la porte s’ouvre davantage.",
  ar: "أربعة أحجار تقود إلى باب المدرسة، حجر لكل خطوة من خطوات القبول. أشيروا إلى حجر فينفتح الباب أكثر.",
  tr: "Okulun kapısına giden dört basamak taşı, her kabul adımı için bir tane. Bir taşın üzerine gelin, kapı daha çok açılsın.",
};

export function admissionsFigure(locale: Locale): HeroFigure {
  const steps = messages[locale].admissions.steps;
  const captions: Record<string, string> = {};
  steps.forEach((s, i) => (captions[`step-${i + 1}`] = s.title));
  return { name: "door", label: doorLabel[locale], captions };
}

export function contactFigure(locale: Locale): HeroFigure {
  const t = messages[locale];
  return {
    name: "schoolhouse",
    label: t.cta.figureLabel,
    captions: { kindergarten: t.levels.kindergarten, primary: t.levels.primary, secondary: t.levels.secondary },
  };
}
