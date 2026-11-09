import { BadgeCheckIcon, GlobeIcon, LandmarkIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { facts } from "@/lib/facts";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { CambridgeCentre } from "@/components/site/cambridge-centre";
import { aboutFigure } from "../figures";

// The school's recognitions (facts.ts: owner's list of 2026-11-05), described only with what
// the school's own old Accreditation and Cambridge English pages state, and the Foundation's
// published 66 countries. [PROPOSAL] Wording to confirm; certificates and the Cambridge centre
// number to provide (the number appears from maarifcms once entered). The Cambridge English
// exam list comes from the old site and must be confirmed before launch.

type Body = { title: string; text: string };
type Copy = {
  lede: string;
  bodies: [Body, Body, Body];
  examsTitle: string;
  examsLede: string;
  exams: { name: string; level: string }[];
  confirm: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    lede: "Three recognitions stand behind the school: Cambridge International for what children learn, the Tunisian Ministry of Education, and the Türkiye Maarif Foundation’s network of schools.",
    bodies: [
      { title: "Cambridge International", text: "The school follows the Cambridge International curriculum from Early Years to A Level. Cambridge qualifications are recognised by universities and employers around the world." },
      { title: "Tunisian Ministry of Education", text: "The school works within the rules of the Tunisian Ministry of Education." },
      { title: "Türkiye Maarif Foundation", text: "The school belongs to the Türkiye Maarif Foundation’s network, which runs schools in 66 countries." },
    ],
    examsTitle: "Cambridge English exams",
    examsLede: "Children can sit Cambridge English exams for young learners and schools at the school.",
    exams: [
      { name: "Pre A1 Starters", level: "Ages 6 to 8" },
      { name: "A1 Movers", level: "Ages 8 to 9" },
      { name: "A2 Flyers", level: "Ages 9 to 12" },
      { name: "A2 Key for Schools", level: "Late primary" },
      { name: "B1 Preliminary for Schools", level: "Secondary" },
    ],
    confirm: "To confirm with the administration: wording, certificates and the Cambridge English exam list.",
  },
  fr: {
    lede: "Trois reconnaissances fondent l’école : Cambridge International pour ce que les enfants apprennent, le ministère tunisien de l’Éducation et le réseau d’écoles de la Fondation Maarif de Türkiye.",
    bodies: [
      { title: "Cambridge International", text: "L’école suit le programme Cambridge International des Early Years aux A Levels. Les diplômes Cambridge sont reconnus par les universités et les employeurs du monde entier." },
      { title: "Ministère tunisien de l’Éducation", text: "L’école exerce dans le cadre des règles du ministère tunisien de l’Éducation." },
      { title: "Fondation Maarif de Türkiye", text: "L’école fait partie du réseau de la Fondation Maarif de Türkiye, présent dans 66 pays." },
    ],
    examsTitle: "Examens Cambridge English",
    examsLede: "Les enfants peuvent passer à l’école les examens Cambridge English pour jeunes apprenants et pour scolaires.",
    exams: [
      { name: "Pre A1 Starters", level: "6 à 8 ans" },
      { name: "A1 Movers", level: "8 à 9 ans" },
      { name: "A2 Flyers", level: "9 à 12 ans" },
      { name: "A2 Key for Schools", level: "Fin du primaire" },
      { name: "B1 Preliminary for Schools", level: "Secondaire" },
    ],
    confirm: "À confirmer avec la direction : formulations, certificats et liste des examens Cambridge English.",
  },
  ar: {
    lede: "ثلاثة اعتمادات تقف وراء المدرسة: Cambridge International لما يتعلّمه الأطفال، ووزارة التربية التونسية، وشبكة مدارس وقف المعارف التركي.",
    bodies: [
      { title: "Cambridge International", text: "تتبع المدرسة منهاج Cambridge International من Early Years إلى A Level. وشهادات كامبريدج معترف بها لدى الجامعات وأصحاب العمل في العالم." },
      { title: "وزارة التربية التونسية", text: "تعمل المدرسة في إطار قواعد وزارة التربية التونسية." },
      { title: "وقف المعارف التركي", text: "المدرسة جزء من شبكة وقف المعارف التركي، التي تدير مدارس في 66 دولة." },
    ],
    examsTitle: "امتحانات Cambridge English",
    examsLede: "يمكن للأطفال اجتياز امتحانات Cambridge English للمتعلّمين الصغار وللتلاميذ في المدرسة.",
    exams: [
      { name: "Pre A1 Starters", level: "من 6 إلى 8 سنوات" },
      { name: "A1 Movers", level: "من 8 إلى 9 سنوات" },
      { name: "A2 Flyers", level: "من 9 إلى 12 سنة" },
      { name: "A2 Key for Schools", level: "آخر الابتدائي" },
      { name: "B1 Preliminary for Schools", level: "الثانوي" },
    ],
    confirm: "للتأكيد مع الإدارة: الصياغة والشهادات وقائمة امتحانات Cambridge English.",
  },
  tr: {
    lede: "Okulun arkasında üç tanınırlık var: çocukların öğrendikleri için Cambridge International, Tunus Eğitim Bakanlığı ve Türkiye Maarif Vakfı’nın okul ağı.",
    bodies: [
      { title: "Cambridge International", text: "Okul, Early Years’ten A Level’a Cambridge International müfredatını izler. Cambridge belgeleri dünyanın dört bir yanındaki üniversiteler ve işverenlerce tanınır." },
      { title: "Tunus Eğitim Bakanlığı", text: "Okul, Tunus Eğitim Bakanlığı’nın kuralları çerçevesinde çalışır." },
      { title: "Türkiye Maarif Vakfı", text: "Okul, 66 ülkede okulları bulunan Türkiye Maarif Vakfı ağının bir parçasıdır." },
    ],
    examsTitle: "Cambridge English sınavları",
    examsLede: "Çocuklar küçük öğrenciler ve okullar için Cambridge English sınavlarına okulda girebilir.",
    exams: [
      { name: "Pre A1 Starters", level: "6-8 yaş" },
      { name: "A1 Movers", level: "8-9 yaş" },
      { name: "A2 Flyers", level: "9-12 yaş" },
      { name: "A2 Key for Schools", level: "İlkokulun sonu" },
      { name: "B1 Preliminary for Schools", level: "Ortaöğretim" },
    ],
    confirm: "Yönetimle teyit edilecek: ifadeler, belgeler ve Cambridge English sınav listesi.",
  },
};

const icons = [BadgeCheckIcon, LandmarkIcon, GlobeIcon];

export function AccreditationsPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="about/accreditations"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="bodies" tone="mist">
            <ul className="grid gap-5 lg:grid-cols-3">
              {c.bodies.map((body, i) => {
                const Icon = icons[i] ?? BadgeCheckIcon;
                return (
                  <li key={body.title} className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:p-8">
                    <span aria-hidden="true" className="grid size-14 place-items-center rounded-[var(--radius-tile)] bg-navy text-white">
                      <Icon className="size-7" strokeWidth={1.75} />
                    </span>
                    <h2 className="text-2xl font-bold text-heading">{body.title}</h2>
                    <p className="text-lg text-slate">{body.text}</p>
                    {i === 0 ? <CambridgeCentre locale={locale} /> : null}
                    {i === 2 ? (
                      <p className="mt-auto flex items-baseline gap-3 pt-2">
                        <span className="font-heading text-4xl font-bold text-heading">{facts.networkCountries}</span>
                        <span className="text-slate">{messages[locale].proof.countries}</span>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </PageSection>
          <PageSection id="exams" title={c.examsTitle} lede={c.examsLede}>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {c.exams.map((exam, i) => (
                <li key={exam.name} className="flex flex-col gap-2 rounded-[var(--radius-tile)] bg-mist p-5 lg:mt-[var(--rise)]"
                  // On wide screens the five exams climb like steps, the first lowest.
                  style={{ "--rise": `${(4 - i) * 0.75}rem` } as React.CSSProperties}
                >
                  <span aria-hidden="true" className="flex gap-1">
                    {Array.from({ length: i + 1 }, (_, d) => (
                      <span key={d} className="size-2 rounded-full bg-turquoise" />
                    ))}
                  </span>
                  <span className="font-heading text-lg font-bold text-heading" lang="en">
                    {exam.name}
                  </span>
                  <span className="text-sm text-slate">{exam.level}</span>
                </li>
              ))}
            </ol>
            <DraftNote>{c.confirm}</DraftNote>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
