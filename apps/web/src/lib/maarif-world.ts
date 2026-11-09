// Country names for the Maarif world globe, in the visitor's language. Data: maarif-world-data.ts
// (generated from the Foundation's map). Intl.DisplayNames names every ISO country; the codes
// below are not ISO countries and carry the names given here.
import type { Locale } from "@maarif/contracts/locales";
import { maarifCountries, type MaarifCountry } from "./maarif-world-data";

export { foundationOffice, maarifCountries, worldSource, type MaarifCountry } from "./maarif-world-data";

// [PROPOSAL] The Foundation lists "KKTC" (Turkish Republic of Northern Cyprus); names to confirm
// with the administration.
const regionNames: Record<string, Record<Locale, string>> = {
  "CY-N": { en: "Northern Cyprus", fr: "Chypre du Nord", ar: "شمال قبرص", tr: "KKTC" },
};

export function countryName(code: string, locale: Locale): string {
  const own = regionNames[code]?.[locale];
  if (own) return own;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export type NamedCountry = MaarifCountry & { name: string };

// Sorted by name in the visitor's language.
export function namedCountries(locale: Locale): NamedCountry[] {
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return maarifCountries.map((c) => ({ ...c, name: countryName(c.code, locale) })).sort((a, b) => collator.compare(a.name, b.name));
}

// Search that ignores case and accents ("cote" finds "Côte d'Ivoire", "turkiye" finds "Türkiye").
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("en").replace(/ı/g, "i");
export function matchCountry(query: string, country: NamedCountry): boolean {
  const q = fold(query.trim());
  return !q || fold(country.name).includes(q) || country.code.toLowerCase() === q;
}
