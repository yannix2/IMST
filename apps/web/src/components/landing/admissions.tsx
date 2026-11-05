"use client";

import { CalendarCheckIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { useRoute } from "@/lib/route-store";
import { visitHash } from "@/lib/visit";
import { CtaSpark } from "./cta-spark";
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
} from "@/components/ui/stepper";

// The admissions route as numbered stations on the turquoise Maarif line. The numbers carry
// the order a family goes through; "You are here" follows them across visits.
// visitHref: Home opens its own visit station (#visit); inner pages go to the visit page.
export function Admissions({ locale, visitHref = visitHash }: { locale: Locale; visitHref?: string }) {
  const t = messages[locale];
  const { station } = useRoute();

  return (
    <section id="admissions" aria-labelledby="admissions-title" className="defer-paint scroll-mt-24 py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <h2 id="admissions-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">
          {t.admissions.title}
        </h2>
        <p className="mt-2 max-w-[60ch] text-lg text-slate">{t.admissions.lede}</p>

        <Stepper value={station} orientation="responsive" className="mt-12 gap-0">
          {t.admissions.steps.map((step, i) => {
            const n = i + 1;
            return (
              <StepperItem key={step.title} step={n} className="station-pass flex-1 gap-4 md:flex-col md:gap-0">
                <div className="flex flex-col items-center md:w-full md:flex-row">
                  <StepperIndicator className="size-12 border-[3px] border-turquoise bg-surface shadow-rest text-lg text-heading group-data-[state=active]/step:bg-turquoise group-data-[state=active]/step:text-night group-data-[state=completed]/step:bg-turquoise group-data-[state=completed]/step:text-night" />
                  {n < t.admissions.steps.length ? (
                    <StepperSeparator className="min-h-10 w-[var(--line-thickness)] flex-1 rounded-full md:h-[var(--line-thickness)] md:min-h-0 md:w-auto" />
                  ) : null}
                </div>
                <div className="pb-8 md:pe-6 md:pt-5 md:pb-0">
                  {n === station ? (
                    <span className="mb-2 inline-block rounded-full bg-turquoise px-3 py-0.5 text-sm font-bold text-night">
                      {t.station.youAreHere}
                    </span>
                  ) : null}
                  <StepperTitle className="text-xl text-heading">{step.title}</StepperTitle>
                  <StepperDescription className="mt-1 text-slate">{step.text}</StepperDescription>
                </div>
              </StepperItem>
            );
          })}
        </Stepper>

        <CtaSpark className="mt-4">
          <Button asChild size="lg">
            <a href={visitHref}>
              <CalendarCheckIcon data-icon="inline-start" />
              {t.station.bookVisit}
            </a>
          </Button>
        </CtaSpark>
      </div>
    </section>
  );
}
