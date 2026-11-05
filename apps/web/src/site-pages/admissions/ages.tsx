import { campusOfGrade, gradeAges, grades, levelOfGrade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import { ChildPath } from "@/components/site/child-path";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { admissionsFigure } from "../figures";
import { copy, lineDot } from "./shared";

export function AgesPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const t = messages[locale];
  return (
    <PageShell
      locale={locale}
      page="admissions/ages"
      lede={c.lede.ages}
      figure={admissionsFigure(locale)}
      body={
        <>
          <PageSection id="path" title={c.pathTitle}>
            <ChildPath locale={locale} />
          </PageSection>
          <PageSection id="table" tone="mist" title={c.tableTitle}>
            <div className="overflow-hidden rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/70">
              <table className="w-full text-start">
                <thead className="bg-navy text-white">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-start font-medium">{c.table.grade}</th>
                    <th scope="col" className="px-5 py-3 text-start font-medium">{c.table.ages}</th>
                    <th scope="col" className="px-5 py-3 text-start font-medium">{c.table.campus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/70">
                  {grades.map((g) => {
                    const [a0, a1] = gradeAges[g];
                    return (
                      <tr key={g}>
                        <th scope="row" className="px-5 py-3 text-start font-medium whitespace-nowrap text-heading">
                          <span className="flex items-center gap-3">
                            <span aria-hidden="true" className={cn("size-3 rounded-full", lineDot[levelOfGrade(g)])} />
                            {t.grade(g === "kg" ? "kg" : Number(g.slice(5)))}
                          </span>
                        </th>
                        <td className="tabular px-5 py-3 text-ink">
                          <span dir="ltr" className="inline-block">
                            {a0}–{a1}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-slate">{t.route.places[campusOfGrade(g)]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="mt-6 flex flex-col gap-2 text-slate">
              {c.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </PageSection>
        </>
      }
    />
  );
}

