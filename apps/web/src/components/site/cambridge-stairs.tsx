"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCapIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { campusOfGrade, gradeAges, grades, levelOfGrade, type Grade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { updateRoute, useRoute } from "@/lib/route-store";
import { cn } from "@/lib/utils";

// The Cambridge pathway as a staircase (owner decision 2026-11-05): one step per school year,
// Kindergarten to Year 13, rising to university. Pointing along the stair (or tapping, or the
// arrow keys) opens a step: its ages, campus, Cambridge stage and the exam taken that year.
// The chosen year is the same "You are here" as on the route map. The stair is HTML, not a
// drawing: every step is a real button.

type Stage = "early-years" | "primary" | "lower-secondary" | "igcse" | "as-a-level";
const stageOf = (g: Grade): Stage => {
  if (g === "kg") return "early-years";
  const y = Number(g.slice(5));
  return y <= 6 ? "primary" : y <= 9 ? "lower-secondary" : y <= 11 ? "igcse" : "as-a-level";
};
const stageNames: Record<Stage, string> = {
  "early-years": "Cambridge Early Years",
  primary: "Cambridge Primary",
  "lower-secondary": "Cambridge Lower Secondary",
  igcse: "Cambridge IGCSE",
  "as-a-level": "Cambridge AS & A Level",
};
// Exams the school's curriculum page names, by the year they are taken.
const examOf: Partial<Record<Grade, string>> = {
  "year-6": "Cambridge Primary Checkpoint",
  "year-9": "Cambridge Lower Secondary Checkpoint",
  "year-11": "Cambridge IGCSE",
  "year-12": "Cambridge AS Level",
  "year-13": "Cambridge A Level",
};

const words: Record<Locale, { ages: string; campus: string; label: string; exam: string; noExam: string; university: string; universityText: string; hint: string }> = {
  en: { ages: "Ages", campus: "Campus", label: "The Cambridge pathway, year by year", exam: "Exam this year", noExam: "No external exam this year", university: "University", universityText: "Cambridge qualifications are recognised by universities around the world.", hint: "Point along the stair, or use the arrow keys." },
  fr: { ages: "Âges", campus: "Campus", label: "Le parcours Cambridge, année par année", exam: "Examen cette année", noExam: "Pas d’examen externe cette année", university: "Université", universityText: "Les diplômes Cambridge sont reconnus par les universités du monde entier.", hint: "Parcourez l’escalier avec le pointeur ou les flèches du clavier." },
  ar: { ages: "الأعمار", campus: "الفرع", label: "مسار كامبريدج، سنة بسنة", exam: "امتحان هذه السنة", noExam: "لا امتحان خارجي هذه السنة", university: "الجامعة", universityText: "شهادات كامبريدج معترف بها لدى الجامعات في العالم.", hint: "مرّروا المؤشر على الدرج، أو استعملوا أسهم لوحة المفاتيح." },
  tr: { ages: "Yaşlar", campus: "Kampüs", label: "Yıl yıl Cambridge yolu", exam: "Bu yılın sınavı", noExam: "Bu yıl dış sınav yok", university: "Üniversite", universityText: "Cambridge belgeleri dünyanın dört bir yanındaki üniversitelerce tanınır.", hint: "İmleçle merdivende gezinin ya da ok tuşlarını kullanın." },
};

const lineBg = { kindergarten: "bg-level-kindergarten", primary: "bg-level-primary", secondary: "bg-level-secondary" } as const;

export function CambridgeStairs({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const w = words[locale];
  const route = useRoute();
  const [open, setOpen] = useState<Grade>(route.grade ?? "kg");
  const stair = useRef<HTMLOListElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (route.grade) setOpen(route.grade);
  }, [route.grade]);

  const choose = (g: Grade) => {
    setOpen(g);
    updateRoute({ grade: g });
  };

  // Pointer along the stair: the step under the pointer's x, read against the steps' fixed
  // columns (they never move), so the choice cannot flicker.
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = stair.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let f = (e.clientX - r.left) / r.width;
    if (getComputedStyle(el).direction === "rtl") f = 1 - f;
    const g = grades[Math.min(grades.length - 1, Math.max(0, Math.floor(f * grades.length)))]!;
    if (g !== open) setOpen(g);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : e.key === "ArrowLeft" ? (rtl ? 1 : -1) : e.key === "Home" ? -99 : e.key === "End" ? 99 : 0;
    if (!step) return;
    e.preventDefault();
    const j = Math.min(grades.length - 1, Math.max(0, i + step));
    buttons.current[j]?.focus();
    choose(grades[j]!);
  };

  const grade = open;
  const year = grade === "kg" ? "kg" : Number(grade.slice(5));
  const [a0, a1] = gradeAges[grade];
  const exam = examOf[grade];

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p className="mb-3 text-sm text-slate">{w.hint}</p>
        <div className="relative rounded-[var(--radius-plate)] bg-surface p-4 shadow-rest ring-1 ring-rule/70 sm:p-6">
          {/* University: the landing at the top of the stair. */}
          <div className="mb-3 flex items-center justify-end gap-2 text-turquoise-ink rtl:justify-start">
            <GraduationCapIcon aria-hidden="true" className="size-6" />
            <span className="font-heading font-bold">{w.university}</span>
          </div>
          <ol ref={stair} aria-label={w.label} onPointerMove={onMove} className="flex h-64 items-end gap-1 sm:h-72 sm:gap-1.5">
            {grades.map((g, i) => {
              const active = g === grade;
              const line = levelOfGrade(g);
              const y = g === "kg" ? "kg" : Number(g.slice(5));
              return (
                <li key={g} className="flex h-full flex-1 items-end">
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    type="button"
                    aria-pressed={active}
                    aria-label={`${t.grade(y)}, ${t.levels.ages(...gradeAges[g])}, ${stageNames[stageOf(g)]}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => choose(g)}
                    onFocus={() => setOpen(g)}
                    onKeyDown={(e) => onKey(e, i)}
                    style={{ height: `${18 + (i / (grades.length - 1)) * 82}%` }}
                    className={cn(
                      "relative w-full cursor-pointer rounded-t-[0.6rem] rounded-b-sm transition-[filter,translate,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      lineBg[line],
                      active ? "-translate-y-2 shadow-raised" : "opacity-55 hover:opacity-90",
                    )}
                  >
                    {examOf[g] ? <span aria-hidden="true" className="absolute inset-x-0 top-1.5 mx-auto size-2 rounded-full bg-night/70" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <div aria-hidden="true" className="mt-2 flex gap-1 text-xs text-slate sm:gap-1.5">
            {grades.map((g) => (
              <span key={g} className={cn("flex-1 text-center tabular", g === grade && "font-bold text-heading")}>
                {g === "kg" ? "KG" : g.slice(5)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="plate flex flex-col gap-4 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised lg:col-span-4">
        <p className="text-sm font-medium text-turquoise">{stageNames[stageOf(grade)]}</p>
        <p className="font-heading text-4xl font-bold">{t.grade(year)}</p>
        <dl className="grid grid-cols-2 gap-3 text-on-plate-muted">
          <div>
            <dt className="text-sm">{w.ages}</dt>
            <dd className="tabular font-bold text-white" dir="ltr">
              {a0}–{a1}
            </dd>
          </div>
          <div>
            <dt className="text-sm">{w.campus}</dt>
            <dd className="font-bold text-white">{t.route.places[campusOfGrade(grade)]}</dd>
          </div>
        </dl>
        <div className="rounded-[var(--radius-tile)] bg-white/[0.07] p-4 ring-1 ring-white/10">
          <p className="text-sm text-on-plate-muted">{exam ? w.exam : w.noExam}</p>
          {exam ? <p className="mt-1 font-bold" lang="en">{exam}</p> : null}
        </div>
        {grade === "year-13" ? <p className="text-on-plate-muted">{w.universityText}</p> : null}
      </div>
    </div>
  );
}
