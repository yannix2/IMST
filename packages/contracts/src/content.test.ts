import { describe, expect, it } from "vitest";
import { schoolWeek } from "./content";
import { campusOfGrade, gradeForBirthYear } from "./school";

describe("schoolWeek", () => {
  it("opens on today during the school week (Tunis time)", () => {
    // Thursday 5 November 2026, 09:00 in Tunis (UTC+1).
    const week = schoolWeek(new Date("2026-11-05T08:00:00Z"));
    expect(week.weekOf).toBe("2026-11-02");
    expect(week.today).toBe("thursday");
    expect(week.dates.friday).toBe("2026-11-06");
  });

  it("uses the Tunis date, not the UTC date, around midnight", () => {
    // Sunday 23:30 UTC is already Monday 00:30 in Tunis.
    const week = schoolWeek(new Date("2026-11-08T23:30:00Z"));
    expect(week.weekOf).toBe("2026-11-09");
    expect(week.today).toBe("monday");
  });

  it("shows the coming week on the weekend", () => {
    const week = schoolWeek(new Date("2026-11-07T12:00:00Z"));
    expect(week.weekOf).toBe("2026-11-09");
    expect(week.today).toBe("monday");
  });

  it("crosses month and year ends", () => {
    const week = schoolWeek(new Date("2026-12-31T10:00:00Z"));
    expect(week.weekOf).toBe("2026-12-28");
    expect(week.dates.friday).toBe("2027-01-01");
  });
});

describe("campus and birth-year helpers", () => {
  it("places Kindergarten to Year 9 at Le Kram and Years 10 to 13 at Charguia 2", () => {
    expect(campusOfGrade("kg")).toBe("schools");
    expect(campusOfGrade("year-9")).toBe("schools");
    expect(campusOfGrade("year-10")).toBe("highSchool");
    expect(campusOfGrade("year-13")).toBe("highSchool");
  });

  it("maps a birth year to the usual grade from the age table", () => {
    expect(gradeForBirthYear(2022, 2026)).toBe("kg");
    expect(gradeForBirthYear(2021, 2026)).toBe("year-1");
    expect(gradeForBirthYear(2020, 2026)).toBe("year-2");
    expect(gradeForBirthYear(2009, 2026)).toBe("year-13");
    expect(gradeForBirthYear(2023, 2026)).toBe("too-young");
    expect(gradeForBirthYear(2008, 2026)).toBe("too-old");
  });
});
