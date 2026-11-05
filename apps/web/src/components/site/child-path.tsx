"use client";

import { useEffect, useState } from "react";
import { CalendarCheckIcon, CheckIcon, LinkIcon, MessageCircleIcon, Share2Icon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { campusOfGrade, gradeAges, grades, isGrade, levelOfGrade, type Grade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { updateRoute, useRoute } from "@/lib/route-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Finder from "@/components/landing/level-finder";

// "My child's path" (owner decision 2026-11-05): from the birth year or a chosen grade, a card
// with the grade, ages, campus, Cambridge stage and the exams still ahead, which a parent can
// share on WhatsApp, share with the phone's own sheet, or copy as a link (…/admissions/ages
// ?grade=year-5 opens the same card). Nothing here is sent to the school.

const stageOf = (g: Grade) => {
  if (g === "kg") return "Cambridge Early Years";
  const y = Number(g.slice(5));
  return y <= 6 ? "Cambridge Primary" : y <= 9 ? "Cambridge Lower Secondary" : y <= 11 ? "Cambridge IGCSE" : "Cambridge AS & A Level";
};
const exams: [Grade, string][] = [
  ["year-6", "Cambridge Primary Checkpoint"],
  ["year-9", "Cambridge Lower Secondary Checkpoint"],
  ["year-11", "Cambridge IGCSE"],
  ["year-12", "Cambridge AS Level"],
  ["year-13", "Cambridge A Level"],
];

const words: Record<Locale, { title: string; empty: string; ahead: string; none: string; campus: string; share: string; copy: string; copied: string; whatsapp: string; visit: string; shareText: (grade: string, campus: string) => string }> = {
  en: { title: "My child’s path", empty: "Choose a birth year to see your child’s path.", ahead: "Exams ahead", none: "All exams done: next stop, university.", campus: "Campus", share: "Share", copy: "Copy link", copied: "Link copied", whatsapp: "Share on WhatsApp", visit: "Book a visit for this year", shareText: (g, c) => `My child’s path at International Maarif Schools of Tunisia: ${g}, ${c}.` },
  fr: { title: "Le parcours de mon enfant", empty: "Choisissez une année de naissance pour voir le parcours de votre enfant.", ahead: "Examens à venir", none: "Tous les examens sont passés : prochaine étape, l’université.", campus: "Campus", share: "Partager", copy: "Copier le lien", copied: "Lien copié", whatsapp: "Partager sur WhatsApp", visit: "Réserver une visite pour cette année", shareText: (g, c) => `Le parcours de mon enfant aux Écoles Internationales Maarif de Tunisie : ${g}, ${c}.` },
  ar: { title: "مسار طفلي", empty: "اختاروا سنة الولادة لتروا مسار طفلكم.", ahead: "الامتحانات القادمة", none: "اجتاز كل الامتحانات: المحطة التالية الجامعة.", campus: "الفرع", share: "مشاركة", copy: "نسخ الرابط", copied: "تمّ نسخ الرابط", whatsapp: "مشاركة على واتساب", visit: "احجزوا زيارة لهذه السنة", shareText: (g, c) => `مسار طفلي في مدارس المعارف الدولية بتونس: ${g}، ${c}.` },
  tr: { title: "Çocuğumun yolu", empty: "Çocuğunuzun yolunu görmek için bir doğum yılı seçin.", ahead: "Önündeki sınavlar", none: "Tüm sınavlar tamam: sıradaki durak üniversite.", campus: "Kampüs", share: "Paylaş", copy: "Bağlantıyı kopyala", copied: "Bağlantı kopyalandı", whatsapp: "WhatsApp’ta paylaş", visit: "Bu yıl için ziyaret planlayın", shareText: (g, c) => `Çocuğumun Tunus Uluslararası Maarif Okulları’ndaki yolu: ${g}, ${c}.` },
};

const lineBg = { kindergarten: "bg-level-kindergarten", primary: "bg-level-primary", secondary: "bg-level-secondary" } as const;

export function ChildPath({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const w = words[locale];
  const route = useRoute();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // A shared link (?grade=…) wins; otherwise the year remembered from the route map.
  useEffect(() => {
    const fromLink = new URLSearchParams(window.location.search).get("grade");
    setGrade(fromLink && isGrade(fromLink) ? fromLink : route.grade);
    setCanShare(typeof navigator.share === "function");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (g: Grade) => {
    setGrade(g);
    setCopied(false);
    updateRoute({ grade: g });
  };

  const name = grade ? t.grade(grade === "kg" ? "kg" : Number(grade.slice(5))) : "";
  const place = grade ? t.route.places[campusOfGrade(grade)] : "";
  const link = grade ? `${window.location.origin}/${locale}/admissions/ages?grade=${grade}` : "";
  const message = grade ? `${w.shareText(name, place)} ${link}` : "";
  const index = grade ? grades.indexOf(grade) : -1;
  const ahead = exams.filter(([g]) => grades.indexOf(g) >= index);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <Finder locale={locale} onChoose={choose} />
      </div>
      <div aria-live="polite" className="lg:col-span-7">
        {grade ? (
          <article className="plate relative flex h-full flex-col gap-6 overflow-hidden rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised sm:p-9">
            <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-[var(--line-thickness)]", lineBg[levelOfGrade(grade)])} />
            <div>
              <p className="text-sm font-medium text-turquoise">{w.title}</p>
              <h3 className="mt-2 font-heading text-4xl font-bold">{name}</h3>
              <p className="mt-1 text-on-plate-muted">
                {t.levels.ages(...gradeAges[grade])} · {stageOf(grade)}
              </p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-on-plate-muted">{w.campus}</dt>
                <dd className="text-lg font-bold">{place}</dd>
              </div>
              <div>
                <dt className="text-sm text-on-plate-muted">{w.ahead}</dt>
                <dd>
                  {ahead.length ? (
                    <ol className="flex flex-col gap-1">
                      {ahead.map(([g, exam]) => (
                        <li key={g} className="flex items-baseline gap-2">
                          <span className="tabular shrink-0 text-sm whitespace-nowrap text-turquoise">{t.grade(Number(g.slice(5)))}</span>
                          <span lang="en" className="font-medium">
                            {exam}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <span>{w.none}</span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="mt-auto flex flex-wrap gap-2">
              <Button asChild size="lg">
                <a href={`/${locale}/admissions/visit`}>
                  <CalendarCheckIcon data-icon="inline-start" />
                  {w.visit}
                </a>
              </Button>
              <Button asChild size="lg" variant="plate">
                <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircleIcon data-icon="inline-start" />
                  {w.whatsapp}
                </a>
              </Button>
              {canShare ? (
                <Button size="lg" variant="plate" onClick={() => void navigator.share({ title: w.title, text: w.shareText(name, place), url: link }).catch(() => undefined)}>
                  <Share2Icon data-icon="inline-start" />
                  {w.share}
                </Button>
              ) : null}
              <Button
                size="lg"
                variant="plate"
                onClick={() =>
                  void navigator.clipboard
                    ?.writeText(link)
                    .then(() => setCopied(true))
                    .catch(() => undefined)
                }
              >
                {copied ? <CheckIcon data-icon="inline-start" /> : <LinkIcon data-icon="inline-start" />}
                {copied ? w.copied : w.copy}
              </Button>
            </div>
          </article>
        ) : (
          <div className="grid h-full min-h-[19rem] place-items-center rounded-[var(--radius-plate)] border-2 border-dashed border-rule p-8 text-center text-lg text-slate">
            {w.empty}
          </div>
        )}
      </div>
    </div>
  );
}
