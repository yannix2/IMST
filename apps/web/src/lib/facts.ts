// The figures and recognitions the Home page states, in one place, each with its source.
// Owner decision 2026-11-05: show the Foundation's own published figure and the school's
// accreditations below. Change a value here only with a newer source; never round up.

// Türkiye Maarif Foundation, its own "Maarif in the world" page (owner decision 2026-11-06,
// replaces the 64 countries of December 2025). Read on the date below; check again before launch.
export const foundation = {
  source: "https://turkiyemaarif.org/dunyada-maarif",
  read: "2026-11-06",
  website: "https://turkiyemaarif.org/",
  countries: 66,
  institutions: 604,
  schools: 516,
  students: 75000, // shown as "75,000+": the page says "75.000+"
  universities: 2,
  dormitories: 55,
} as const;

export const facts = {
  // The Foundation's network (see `foundation` above).
  networkCountries: foundation.countries,
  // The four languages of school life (product.md, Positioning).
  languages: 4,
  // The two campuses on the school's contact page (lib/school.ts).
  campuses: 2,
  // The school's age table: Kindergarten (4 to 5) to Year 13 (17 to 18).
  ages: [4, 18] as const,
} as const;

// [PROPOSAL] Wording to confirm with the administration; certificates, centre numbers and dates
// still to be provided (product.md, Evidence on Hand).
export const accreditations = ["cambridge", "ministry", "maarif"] as const;
export type Accreditation = (typeof accreditations)[number];

// [PROPOSAL] Map positions from OpenStreetMap (Nominatim, 2026-11-05), to be checked on site:
// Charguia 2 from "Rue de l'Usine, 2035"; Le Kram from the Kheireddine industrial zone.
export const campusPositions = {
  highSchool: { lat: 36.8537, lon: 10.2074 },
  schools: { lat: 36.834, lon: 10.3032 },
} as const;
