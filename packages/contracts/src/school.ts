// Grades from the school's "Grade and Age Eligibility" page (maarif_site_data.json):
// Kindergarten (ages 4-5) then Year 1 to Year 13.
export const grades = [
  "kg",
  "year-1",
  "year-2",
  "year-3",
  "year-4",
  "year-5",
  "year-6",
  "year-7",
  "year-8",
  "year-9",
  "year-10",
  "year-11",
  "year-12",
  "year-13",
] as const;
export type Grade = (typeof grades)[number];

export function isGrade(value: string): value is Grade {
  return (grades as readonly string[]).includes(value);
}

// Typical ages per grade, from the same page ("Kindergarten (KG) 4-5", "Year 1 5-6" ... "Year 13 17-18").
export const gradeAges: Record<Grade, readonly [number, number]> = {
  kg: [4, 5],
  "year-1": [5, 6],
  "year-2": [6, 7],
  "year-3": [7, 8],
  "year-4": [8, 9],
  "year-5": [9, 10],
  "year-6": [10, 11],
  "year-7": [11, 12],
  "year-8": [12, 13],
  "year-9": [13, 14],
  "year-10": [14, 15],
  "year-11": [15, 16],
  "year-12": [16, 17],
  "year-13": [17, 18],
};

// The three coloured lines of the design system.
export const levels = ["kindergarten", "primary", "secondary"] as const;
export type Level = (typeof levels)[number];

// [UNKNOWN] Grouping follows the Cambridge stages (Primary Years 1-6, Secondary Years 7-13);
// confirm with the administration before publishing level pages.
export function levelOfGrade(grade: Grade): Level {
  if (grade === "kg") return "kindergarten";
  const year = Number(grade.slice("year-".length));
  return year <= 6 ? "primary" : "secondary";
}

export const gradesOfLevel: Record<Level, readonly Grade[]> = {
  kindergarten: grades.filter((g) => levelOfGrade(g) === "kindergarten"),
  primary: grades.filter((g) => levelOfGrade(g) === "primary"),
  secondary: grades.filter((g) => levelOfGrade(g) === "secondary"),
};

// Age span of a whole line: first grade's lower bound to last grade's upper bound.
export function levelAges(level: Level): readonly [number, number] {
  const list = gradesOfLevel[level];
  return [gradeAges[list[0]!][0], gradeAges[list[list.length - 1]!][1]];
}

// The two campuses (owner confirmation 2026-11-05): Le Kram teaches Kindergarten to Year 9
// (kindergarten, primary and lower secondary); Charguia 2 teaches Years 10 to 13 (upper secondary).
export const campusKeys = ["schools", "highSchool"] as const;
export type CampusKey = (typeof campusKeys)[number];

export function campusOfGrade(grade: Grade): CampusKey {
  if (grade === "kg") return "schools";
  return Number(grade.slice("year-".length)) <= 9 ? "schools" : "highSchool";
}

/**
 * The grade a child would usually join, from the school's age table: the age the child turns
 * in the calendar year the school year starts (a child born in 2020 turns 6 in 2026, so joins
 * Year 2 in September 2026). Indicative only: the school confirms the class after a placement
 * test. Returns "too-young" or "too-old" outside Kindergarten to Year 13.
 */
export function gradeForBirthYear(birthYear: number, schoolYearStart: number): Grade | "too-young" | "too-old" {
  const age = schoolYearStart - birthYear;
  if (age < gradeAges.kg[0]) return "too-young";
  const match = grades.find((g) => gradeAges[g][0] === age);
  return match ?? "too-old";
}
