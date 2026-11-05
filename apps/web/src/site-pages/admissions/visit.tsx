import { VisitPanel } from "@/components/site/visit-panel";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { admissionsFigure } from "../figures";
import { copy } from "./shared";

export function VisitPage({ locale }: { locale: Locale }) {
  return (
    <PageShell
      locale={locale}
      page="admissions/visit"
      lede={copy[locale].lede.visit}
      figure={admissionsFigure(locale)}
      body={
        <PageSection id="visit-page" tone="mist">
          <VisitPanel locale={locale} />
        </PageSection>
      }
    />
  );
}

