import { MailIcon, MapPinIcon, NavigationIcon, PhoneIcon, SchoolIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { campusPositions } from "@/lib/facts";
import { campuses, schoolEmail, telHref } from "@/lib/school";
import { Button } from "@/components/ui/button";
import { CampusGlobe } from "./campus-globe";

// Where the school is: a globe turning towards Tunis (both campuses, one marker), linked to
// the Foundation in Türkiye, and the two campus cards with the levels each one teaches,
// one-tap phone pills and Directions into the visitor's own maps app.
export function Campuses({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const plates = [
    { key: "schools", name: t.campuses.schools, ...campuses.schools, at: campusPositions.schools },
    { key: "highSchool", name: t.campuses.highSchool, ...campuses.highSchool, at: campusPositions.highSchool },
  ] as const;

  return (
    <section id="contact" aria-labelledby="contact-title" className="defer-paint scroll-mt-24 bg-mist py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-10 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <CampusGlobe label={t.map.label} city={t.map.city} foundation={t.map.foundation} />
        </div>
        <div className="flex flex-col gap-5 lg:col-span-6">
          <h2 id="contact-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">
            {t.campuses.title}
          </h2>
          {plates.map((plate) => (
            <article key={plate.key} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-navy text-white">
                  <SchoolIcon className="size-6" strokeWidth={2} />
                </span>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-heading">
                    {plate.name} · {t.route.places[plate.key]}
                  </h3>
                  <p className="text-slate">{t.route.campusLevels[plate.key]}</p>
                </div>
              </div>
              <address className="flex items-start gap-3 text-ink not-italic">
                <MapPinIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-turquoise-ink" />
                <span dir="ltr">{plate.address}</span>
              </address>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Button asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${plate.at.lat},${plate.at.lon}`} target="_blank" rel="noopener noreferrer">
                      <NavigationIcon data-icon="inline-start" />
                      {t.map.directions}
                    </a>
                  </Button>
                </li>
                {plate.phones.map((phone) => (
                  <li key={phone}>
                    <Button asChild variant="outline">
                      <a href={telHref(phone)}>
                        <PhoneIcon data-icon="inline-start" />
                        <span className="tabular" dir="ltr">{phone}</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate">{t.campuses.email}</span>
            <Button asChild variant="outline">
              <a href={`mailto:${schoolEmail}`}>
                <MailIcon data-icon="inline-start" />
                <span dir="ltr">{schoolEmail}</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
