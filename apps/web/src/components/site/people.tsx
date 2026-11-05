"use client";

import { useEffect, useState } from "react";
import { ArrowUpRightIcon, UserRoundIcon } from "lucide-react";
import type { Person } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { pageNames } from "@/i18n/pages";
import { loadAboutContent } from "@/lib/about-content";
import { showPreviews } from "@/lib/home-content";

// The leadership team from maarifcms (collection "people"; photos only with consent, served
// through maarif-api). Nothing is invented: until one person is published the list shows a
// short "not yet" note in production, and development shows marked placeholders.

const preview: Person[] = [1, 2, 3].map((n) => ({ id: `p${n}`, name: `[Name ${n}]`, role: "[Role]", bio: "[Short biography]", photo: null }));

function usePeople(locale: Locale): Person[] | null {
  const [people, setPeople] = useState<Person[] | null>(null);
  useEffect(() => {
    let live = true;
    void loadAboutContent(locale).then((c) => {
      if (!live) return;
      setPeople(c ? c.people : showPreviews ? preview : []);
    });
    return () => {
      live = false;
    };
  }, [locale]);
  return people;
}

const empty: Record<Locale, string> = {
  en: "The leadership team will be introduced here soon.",
  fr: "L’équipe de direction sera bientôt présentée ici.",
  ar: "سيتمّ تقديم فريق الإدارة هنا قريبًا.",
  tr: "Yönetim ekibi yakında burada tanıtılacak.",
};

export function PeopleList({ locale }: { locale: Locale }) {
  const people = usePeople(locale);
  if (people === null) return <div className="min-h-64" aria-busy="true" />;
  if (people.length === 0) return <p className="text-lg text-slate">{empty[locale]}</p>;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <li key={person.id} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70">
          {person.photo ? (
            <img src={person.photo.src} alt={person.photo.alt} loading="lazy" className="aspect-[4/5] w-full rounded-[var(--radius-tile)] object-cover" />
          ) : (
            <span aria-hidden="true" className="grid aspect-[4/5] w-full place-items-center rounded-[var(--radius-tile)] bg-mist text-slate">
              <UserRoundIcon className="size-12" strokeWidth={1.25} />
            </span>
          )}
          <div>
            <h3 className="text-xl font-bold text-heading">{person.name}</h3>
            <p className="font-medium text-turquoise-ink">{person.role}</p>
          </div>
          {person.bio ? <p className="text-slate">{person.bio}</p> : null}
        </li>
      ))}
    </ul>
  );
}

// On the About page: a card to the leadership page, only once someone is published.
export function LeadershipTeaser({ locale }: { locale: Locale }) {
  const people = usePeople(locale);
  if (!people || people.length === 0) return null;
  const p = pageNames[locale];
  return (
    <a
      href={`/${locale}/about/leadership`}
      className="group mt-5 flex items-center justify-between gap-4 rounded-[var(--radius-plate)] bg-surface p-6 no-underline shadow-rest ring-1 ring-rule/70 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-rest-hover"
    >
      <span>
        <span className="block font-heading text-xl font-bold text-heading">{p.pages["about/leadership"].title}</span>
        <span className="text-slate">{p.pages["about/leadership"].blurb}</span>
      </span>
      <ArrowUpRightIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink rtl:-scale-x-100" />
    </a>
  );
}
