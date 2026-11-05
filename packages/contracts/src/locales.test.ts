import { describe, expect, it } from "vitest";
import { negotiateLocale } from "./locales";

describe("negotiateLocale", () => {
  it("falls back to English with no header (crawlers)", () => {
    expect(negotiateLocale(undefined)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
  });

  it("matches the primary subtag", () => {
    expect(negotiateLocale("fr-TN,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(negotiateLocale("ar-TN")).toBe("ar");
    expect(negotiateLocale("tr-TR,tr;q=0.9")).toBe("tr");
  });

  it("respects quality order, not header order", () => {
    expect(negotiateLocale("en;q=0.5,ar;q=0.9")).toBe("ar");
  });

  it("skips unsupported languages and q=0", () => {
    expect(negotiateLocale("de-DE,it;q=0.9,fr;q=0.4")).toBe("fr");
    expect(negotiateLocale("fr;q=0,tr;q=0.3")).toBe("tr");
    expect(negotiateLocale("de,it")).toBe("en");
    expect(negotiateLocale("*")).toBe("en");
  });

  it("prefers the remembered choice when it is a launch language", () => {
    expect(negotiateLocale("fr-FR", "ar")).toBe("ar");
    expect(negotiateLocale("fr-FR", "xx")).toBe("fr");
  });
});
