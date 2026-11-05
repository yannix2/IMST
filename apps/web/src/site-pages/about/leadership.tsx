import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { PeopleList } from "@/components/site/people";
import { aboutFigure } from "../figures";

// Leadership and staff: everything comes from maarifcms ("people"). The page stays out of
// menus and search (lib/navigation.ts, cmsOnlyPages) until the school publishes someone.
export function LeadershipPage({ locale }: { locale: Locale }) {
  return (
    <PageShell
      locale={locale}
      page="about/leadership"
      figure={aboutFigure(locale)}
      body={
        <PageSection id="people" tone="mist">
          <PeopleList locale={locale} />
        </PageSection>
      }
    />
  );
}
