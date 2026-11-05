import { messages } from "@/i18n/messages";
import { PreRegisterForm } from "@/components/site/pre-register-form";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { admissionsFigure } from "../figures";
import { copy } from "./shared";

export function PreRegisterPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const steps = messages[locale].admissions.steps;
  return (
    <PageShell
      locale={locale}
      page="admissions/pre-register"
      lede={c.lede.pre}
      figure={admissionsFigure(locale)}
      body={
        <PageSection id="form" tone="mist">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <PreRegisterForm locale={locale} />
            </div>
            <aside className="lg:col-span-4">
              <h2 className="text-xl font-bold text-heading">{c.preNext}</h2>
              <ol className="mt-4 flex flex-col gap-4">
                {steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span aria-hidden="true" className="tabular grid size-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-medium text-heading">{s.title}</span>
                      <span className="text-slate">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </PageSection>
      }
    />
  );
}

