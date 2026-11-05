"use client";

import { useState } from "react";
import { CalendarCheckIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { campusOfGrade, gradeForBirthYear, levelOfGrade, type Grade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

// "Which level is my child in?": the year of birth in, the usual grade, line and campus out,
// from the school's own age table (contracts/school.ts). Its own chunk (levels-explorer.tsx).
// The school year a parent is most likely planning for: the coming one from April, else the
// one under way.
function planningYear(now = new Date()) {
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

export default function Finder({ locale, onChoose }: { locale: Locale; onChoose: (grade: Grade) => void }) {
  const t = messages[locale];
  const r = t.route;
  const [birth, setBirth] = useState<number | null>(null);
  const start = planningYear();
  const years = Array.from({ length: 16 }, (_, i) => start - 3 - i);
  const result = birth ? gradeForBirthYear(birth, start) : null;
  const gradeName = (g: Grade) => (g === "kg" ? t.grade("kg") : t.grade(Number(g.slice(5))));

  return (
    <section aria-labelledby="finder-title" className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/60">
      <h3 id="finder-title" className="text-xl font-bold text-heading">
        {r.finderTitle}
      </h3>
      <Field>
        <FieldLabel htmlFor="finder-year">
          {r.birthYear} <span className="font-normal text-slate">({r.schoolYear(start)})</span>
        </FieldLabel>
        <NativeSelect id="finder-year" className="w-full" value={birth ?? ""} onChange={(e) => setBirth(e.target.value ? Number(e.target.value) : null)}>
          <NativeSelectOption value="">{r.choose}</NativeSelectOption>
          {years.map((y) => (
            <NativeSelectOption key={y} value={y}>
              {y}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <div aria-live="polite" className="min-h-[6.5rem]">
        {result === "too-young" ? <p className="text-ink">{r.tooYoung}</p> : null}
        {result === "too-old" ? <p className="text-ink">{r.tooOld}</p> : null}
        {result && result !== "too-young" && result !== "too-old" ? (
          <div className="flex flex-col gap-3">
            <p className="text-slate">{r.result}</p>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl leading-none font-bold text-heading">{gradeName(result)}</span>
              <span className="text-slate">
                {t.levels[levelOfGrade(result)]} · {t.campuses[campusOfGrade(result)]}, {r.places[campusOfGrade(result)]}
              </span>
            </p>
            <Button asChild className="self-start">
              <a href={visitHash} onClick={() => onChoose(result)}>
                <CalendarCheckIcon data-icon="inline-start" />
                {r.bookThis}
              </a>
            </Button>
          </div>
        ) : null}
      </div>
      <p className="text-sm text-slate">{r.note}</p>
    </section>
  );
}
