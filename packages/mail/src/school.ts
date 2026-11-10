import type { Locale } from "@maarif/contracts/locales";
import type { CampusKey, Grade } from "@maarif/contracts/school";

// The school facts an email may show (same sources as apps/web/src/lib/school.ts:
// maarif_site_data.json contact page; campuses confirmed by the owner 2026-11-05).

export const schoolName: Record<Locale, string> = {
  en: "International Maarif Schools of Tunisia",
  fr: "Écoles Internationales Maarif de Tunisie",
  ar: "مدارس المعارف الدولية بتونس",
  tr: "Tunus Uluslararası Maarif Okulları",
};

export const campuses: Record<CampusKey, { name: Record<Locale, string>; address: string; phone: string }> = {
  schools: {
    name: { en: "Le Kram", fr: "Le Kram", ar: "الكرم", tr: "Le Kram" },
    address: "4 Rue Socrate, ZI Kheireddine, Le Kram 2089",
    phone: "+216 29 90 52 09",
  },
  highSchool: {
    name: { en: "Charguia 2", fr: "Charguia 2", ar: "الشرقية 2", tr: "Charguia 2" },
    address: "22 Rue de l’Usine, Charguia 2, Ariana 2035",
    phone: "+216 70 74 70 46",
  },
};

// The main admissions line (Le Kram), as on the site's forms.
export const mainPhone = campuses.schools.phone;

// Grade names per language (CLAUDE.md: "Year 13", "Année 13", "سنة 13", "Yıl 13").
const kindergarten: Record<Locale, string> = { en: "Kindergarten", fr: "Maternelle", ar: "الروضة", tr: "Anaokulu" };
const year: Record<Locale, string> = { en: "Year", fr: "Année", ar: "سنة", tr: "Yıl" };

export function gradeName(grade: Grade, locale: Locale): string {
  return grade === "kg" ? kindergarten[locale] : `${year[locale]} ${grade.slice("year-".length)}`;
}

// Dates and times in Tunis time, Western digits in every language (Arabic included).
const intlLocale: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };

export function formatDate(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Tunis" }).format(date);
}

export function formatTime(value: string | Date, locale: Locale): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Tunis" }).format(date);
}
