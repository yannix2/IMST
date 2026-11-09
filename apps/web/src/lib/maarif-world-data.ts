// Maarif schools around the world, for the Home globe (wave 2, task 6.5). GENERATED: do not edit
// by hand; regenerate from the Foundation's page. Source: turkiyemaarif.org/dunyada-maarif, map data
// read 2026-11-06. One entry per country where the Foundation's map lists at least one school
// or institution; the marker sits where most of its schools are; `places` counts distinct map
// positions. The Foundation's own headline figure (66 countries, lib/facts.ts) is larger: some
// countries have offices but no school on the map. Country names come from Intl.DisplayNames per
// locale, except the codes in `regionNames`.

export type MaarifCountry = { code: string; lat: number; lon: number; places: number };

export const worldSource = { url: "https://turkiyemaarif.org/dunyada-maarif", read: "2026-11-06" } as const;

// The Foundation's head office (Altunizade, Üsküdar, Istanbul), origin of the network arcs.
export const foundationOffice = { lat: 41.02, lon: 29.04 } as const;

export const maarifCountries: readonly MaarifCountry[] = [
  { code: "AF", lat: 34.51, lon: 69.17, places: 17 },
  { code: "AL", lat: 41.29, lon: 19.85, places: 6 },
  { code: "AT", lat: 48.21, lon: 16.32, places: 1 },
  { code: "AU", lat: -37.3, lon: 144.95, places: 3 },
  { code: "AZ", lat: 40.41, lon: 49.82, places: 2 },
  { code: "BA", lat: 43.84, lon: 18.35, places: 2 },
  { code: "BE", lat: 50.87, lon: 4.38, places: 4 },
  { code: "BF", lat: 12.3, lon: -1.5, places: 3 },
  { code: "BG", lat: 42.65, lon: 23.35, places: 3 },
  { code: "BI", lat: -3.06, lon: 29.75, places: 2 },
  { code: "BR", lat: -15.78, lon: -47.93, places: 1 },
  { code: "BY", lat: 53.92, lon: 27.61, places: 1 },
  { code: "CA", lat: 43.67, lon: -79.35, places: 1 },
  { code: "CD", lat: -4.31, lon: 15.28, places: 1 },
  { code: "CG", lat: -4.28, lon: 15.27, places: 1 },
  { code: "CI", lat: 5.35, lon: -4.01, places: 1 },
  { code: "CM", lat: 3.97, lon: 9.81, places: 7 },
  { code: "CO", lat: 4.61, lon: -74.08, places: 1 },
  { code: "CY-N", lat: 35.18, lon: 33.37, places: 1 },
  { code: "DE", lat: 50.96, lon: 6.95, places: 2 },
  { code: "DJ", lat: 11.53, lon: 43.15, places: 1 },
  { code: "DZ", lat: 36.76, lon: 2.98, places: 1 },
  { code: "ET", lat: 8.93, lon: 38.66, places: 11 },
  { code: "FR", lat: 48.58, lon: 7.77, places: 2 },
  { code: "GA", lat: 0.51, lon: 9.4, places: 1 },
  { code: "GE", lat: 41.74, lon: 44.73, places: 2 },
  { code: "GH", lat: 5.61, lon: -0.19, places: 1 },
  { code: "GM", lat: 13.45, lon: -16.71, places: 1 },
  { code: "GN", lat: 9.62, lon: -13.63, places: 2 },
  { code: "GQ", lat: 3.75, lon: 8.78, places: 2 },
  { code: "HU", lat: 47.5, lon: 19.08, places: 1 },
  { code: "ID", lat: -6.2, lon: 106.84, places: 1 },
  { code: "IQ", lat: 35.46, lon: 44.38, places: 7 },
  { code: "JO", lat: 32, lon: 35.87, places: 2 },
  { code: "KG", lat: 42.81, lon: 74.63, places: 22 },
  { code: "MG", lat: -18.84, lon: 47.46, places: 1 },
  { code: "MK", lat: 41.98, lon: 20.97, places: 2 },
  { code: "ML", lat: 12.61, lon: -8.04, places: 5 },
  { code: "MR", lat: 18.1, lon: -16, places: 2 },
  { code: "NE", lat: 13.53, lon: 2.15, places: 3 },
  { code: "NL", lat: 52.4, lon: 4.84, places: 1 },
  { code: "PK", lat: 31.42, lon: 74.23, places: 32 },
  { code: "RO", lat: 44.43, lon: 26.11, places: 2 },
  { code: "RS", lat: 44.8, lon: 20.49, places: 9 },
  { code: "SD", lat: 15.5, lon: 32.56, places: 1 },
  { code: "SL", lat: 8.46, lon: -13.27, places: 2 },
  { code: "SN", lat: 14.72, lon: -17.47, places: 3 },
  { code: "SO", lat: 2.04, lon: 45.31, places: 5 },
  { code: "ST", lat: 0.19, lon: 6.61, places: 1 },
  { code: "SY", lat: 36.58, lon: 37.05, places: 3 },
  { code: "TD", lat: 12.13, lon: 15.08, places: 1 },
  { code: "TG", lat: 6.17, lon: 1.23, places: 2 },
  { code: "TN", lat: 36.84, lon: 10.3, places: 2 },
  { code: "TZ", lat: -6.19, lon: 39.22, places: 1 },
  { code: "US", lat: 40.81, lon: -74.19, places: 1 },
  { code: "VE", lat: 10.47, lon: -66.86, places: 4 },
  { code: "XK", lat: 42.51, lon: 21.17, places: 2 },
  { code: "ZA", lat: -26.14, lon: 28.07, places: 4 },
  { code: "ZM", lat: -15.42, lon: 28.36, places: 2 },
];
