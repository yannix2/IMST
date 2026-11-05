import { describe, expect, it } from "vitest";
import { contactSchema, preRegistrationSchema, visitBookingSchema } from "./forms";
import { levelOfGrade } from "./school";

const base = { locale: "fr", turnstileToken: "token", privacyNoticeAccepted: true } as const;

describe("preRegistrationSchema", () => {
  const valid = {
    ...base,
    studentName: "Amira Ben Salah",
    grade: "kg",
    phone: "+216 22 123 456",
    cityArea: "La Marsa",
  };

  it("accepts the current site's required fields and normalises the phone", () => {
    const result = preRegistrationSchema.parse(valid);
    expect(result.phone).toBe("+21622123456");
    expect(result.guardianName).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it("rejects a filled honeypot", () => {
    expect(preRegistrationSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
  });

  it("requires the privacy notice", () => {
    expect(preRegistrationSchema.safeParse({ ...valid, privacyNoticeAccepted: false }).success).toBe(false);
  });

  it("rejects an unknown grade and an invalid phone", () => {
    expect(preRegistrationSchema.safeParse({ ...valid, grade: "year-14" }).success).toBe(false);
    expect(preRegistrationSchema.safeParse({ ...valid, phone: "12" }).success).toBe(false);
  });
});

describe("visitBookingSchema", () => {
  it("requires an ISO date and a known slot", () => {
    const valid = {
      ...base,
      parentName: "Mehmet Yılmaz",
      phone: "0021698765432",
      grade: "year-1",
      preferredDate: "2027-01-12",
      preferredSlot: "morning",
    };
    expect(visitBookingSchema.safeParse(valid).success).toBe(true);
    expect(visitBookingSchema.safeParse({ ...valid, preferredDate: "12/01/2027" }).success).toBe(false);
    expect(visitBookingSchema.safeParse({ ...valid, preferredSlot: "night" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("needs a phone or an email", () => {
    const valid = { ...base, locale: "ar", name: "سارة", topic: "admissions", message: "أود معرفة مواعيد التسجيل." };
    expect(contactSchema.safeParse(valid).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "parent@example.com" }).success).toBe(true);
  });
});

describe("levelOfGrade", () => {
  it("maps grades to the three level lines", () => {
    expect(levelOfGrade("kg")).toBe("kindergarten");
    expect(levelOfGrade("year-6")).toBe("primary");
    expect(levelOfGrade("year-7")).toBe("secondary");
  });
});
