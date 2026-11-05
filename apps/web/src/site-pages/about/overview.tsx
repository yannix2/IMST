import { BookOpenIcon, Building2Icon, GlobeIcon, LanguagesIcon, UsersRoundIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { facts } from "@/lib/facts";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { LeadershipTeaser } from "@/components/site/people";
import { aboutFigure } from "../figures";

// Who the school is, from confirmed sources only: the age table and campuses (lib/school.ts,
// contracts), English as the language of instruction and the core values "respect,
// discipline and excellence" (old site, Philosophy of Education), the Cambridge International
// curriculum (old site, Curriculum), the Foundation's 64 countries (facts.ts). The beliefs are
// the old Philosophy page, lightly edited (owner decision 2026-11-05) and to be approved.

type Copy = {
  lede: string;
  glanceTitle: string;
  glance: { ages: string; campuses: string; languages: string; curriculum: string; network: string };
  believeTitle: string;
  believeLede: string;
  values: [string, string, string];
  valuesLabel: string;
  beliefs: string[];
};

const copy: Record<Locale, Copy> = {
  en: {
    lede: "An international school in Tunis for children aged 4 to 18. Lessons follow the Cambridge International curriculum in English, and French, Arabic and Turkish are part of every school day.",
    glanceTitle: "The school at a glance",
    glance: {
      ages: "Kindergarten to Year 13, ages 4 to 18",
      campuses: "Le Kram: Kindergarten to Year 9. Charguia 2: Years 10 to 13",
      languages: "English as the language of teaching, with French, Arabic and Turkish",
      curriculum: "The Cambridge International curriculum, from Early Years to A Level",
      network: "Part of the Türkiye Maarif Foundation’s schools in 64 countries",
    },
    believeTitle: "What we believe",
    believeLede: "Respect and fairness shape every relationship in our school community.",
    values: ["Respect", "Discipline", "Excellence"],
    valuesLabel: "Our core values",
    beliefs: [
      "Loving children and respecting them are the most important steps in education.",
      "Every child is born with strengths of their own; school is there to find them and help them grow.",
      "We want a school where everyone respects one another, values each other’s differences and grows into a citizen of the world.",
      "When we educate our children, we are building our future too.",
    ],
  },
  fr: {
    lede: "Une école internationale à Tunis pour les enfants de 4 à 18 ans. Les cours suivent le programme Cambridge International en anglais, et le français, l’arabe et le turc font partie de chaque journée.",
    glanceTitle: "L’école en bref",
    glance: {
      ages: "De la maternelle à l’année 13, de 4 à 18 ans",
      campuses: "Le Kram : maternelle à l’année 9. Charguia 2 : années 10 à 13",
      languages: "L’anglais comme langue d’enseignement, avec le français, l’arabe et le turc",
      curriculum: "Le programme Cambridge International, des Early Years aux A Levels",
      network: "Membre des écoles de la Fondation Maarif de Türkiye dans 64 pays",
    },
    believeTitle: "Ce en quoi nous croyons",
    believeLede: "Le respect et l’équité guident chaque relation dans notre communauté scolaire.",
    values: ["Respect", "Discipline", "Excellence"],
    valuesLabel: "Nos valeurs",
    beliefs: [
      "Aimer les enfants et les respecter sont les premiers pas de l’éducation.",
      "Chaque enfant naît avec ses propres forces ; l’école est là pour les révéler et les faire grandir.",
      "Nous voulons une école où chacun respecte l’autre, apprécie les différences et devient citoyen du monde.",
      "En éduquant nos enfants, nous construisons aussi notre avenir.",
    ],
  },
  ar: {
    lede: "مدرسة دولية في تونس للأطفال من 4 إلى 18 سنة. تتبع الدروس منهاج Cambridge International باللغة الإنجليزية، والفرنسية والعربية والتركية جزء من كل يوم دراسي.",
    glanceTitle: "المدرسة باختصار",
    glance: {
      ages: "من الروضة إلى سنة 13، من 4 إلى 18 سنة",
      campuses: "الكرم: من الروضة إلى سنة 9. الشرقية 2: من سنة 10 إلى سنة 13",
      languages: "الإنجليزية لغة التدريس، مع الفرنسية والعربية والتركية",
      curriculum: "منهاج Cambridge International، من Early Years إلى A Level",
      network: "جزء من مدارس وقف المعارف التركي في 64 دولة",
    },
    believeTitle: "ما نؤمن به",
    believeLede: "الاحترام والإنصاف أساس كل علاقة في مجتمعنا المدرسي.",
    values: ["الاحترام", "الانضباط", "التميّز"],
    valuesLabel: "قيمنا",
    beliefs: [
      "محبّة الأطفال واحترامهم أهمّ خطوات التربية.",
      "يولد كل طفل بنقاط قوّة خاصة به، والمدرسة موجودة لاكتشافها وتنميتها.",
      "نريد مدرسة يحترم فيها الجميع بعضهم بعضًا، ويقدّرون اختلافاتهم، ويصبحون مواطنين في العالم.",
      "حين نربّي أطفالنا، فإننا نبني مستقبلنا أيضًا.",
    ],
  },
  tr: {
    lede: "Tunus’ta 4-18 yaş arası çocuklar için uluslararası bir okul. Dersler İngilizce olarak Cambridge International müfredatını izler; Fransızca, Arapça ve Türkçe her okul gününün parçasıdır.",
    glanceTitle: "Bir bakışta okul",
    glance: {
      ages: "Anaokulundan Yıl 13’e, 4-18 yaş",
      campuses: "Le Kram: Anaokulu - Yıl 9. Charguia 2: Yıl 10-13",
      languages: "Öğretim dili İngilizce; Fransızca, Arapça ve Türkçe ile birlikte",
      curriculum: "Early Years’ten A Level’a Cambridge International müfredatı",
      network: "Türkiye Maarif Vakfı’nın 64 ülkedeki okullarından biri",
    },
    believeTitle: "Neye inanıyoruz",
    believeLede: "Okul topluluğumuzdaki her ilişkiyi saygı ve adalet belirler.",
    values: ["Saygı", "Disiplin", "Mükemmellik"],
    valuesLabel: "Temel değerlerimiz",
    beliefs: [
      "Çocukları sevmek ve onlara saygı duymak eğitimin en önemli adımlarıdır.",
      "Her çocuk kendine özgü güçlü yönlerle doğar; okul onları bulmak ve geliştirmek için vardır.",
      "Herkesin birbirine saygı duyduğu, farklılıklara değer verdiği ve dünya yurttaşı olarak yetiştiği bir okul istiyoruz.",
      "Çocuklarımızı eğitirken geleceğimizi de inşa ediyoruz.",
    ],
  },
};

export function AboutPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const g = c.glance;
  const rows = [
    { icon: UsersRoundIcon, text: g.ages },
    { icon: Building2Icon, text: g.campuses },
    { icon: LanguagesIcon, text: g.languages },
    { icon: BookOpenIcon, text: g.curriculum },
    { icon: GlobeIcon, text: g.network },
  ];
  return (
    <PageShell
      locale={locale}
      page="about"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="glance" tone="mist" title={c.glanceTitle}>
            <div className="grid gap-5 lg:grid-cols-12">
              <ul className="flex flex-col divide-y divide-rule/70 rounded-[var(--radius-plate)] bg-surface px-6 shadow-rest ring-1 ring-rule/70 sm:px-8 lg:col-span-8">
                {rows.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-4 py-5">
                    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-tile)] bg-mist text-heading">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <span className="text-lg text-ink">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="plate flex flex-col justify-between gap-6 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised sm:p-9 lg:col-span-4">
                <p className="font-heading text-7xl leading-none font-bold">{facts.networkCountries}</p>
                <p className="text-lg text-on-plate-muted">{messages[locale].proof.countries}</p>
              </div>
            </div>
            <LeadershipTeaser locale={locale} />
          </PageSection>
          <PageSection id="believe" title={c.believeTitle} lede={c.believeLede}>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-sm font-medium text-slate">{c.valuesLabel}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {c.values.map((value, i) => (
                    <li
                      key={value}
                      className="flex items-center gap-4 rounded-full bg-mist py-2 ps-2 pe-6"
                      style={{ marginInlineStart: `${i * 1.5}rem` }}
                    >
                      <span aria-hidden="true" className="size-10 rounded-full bg-turquoise" />
                      <span className="font-heading text-2xl font-bold text-heading">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                {c.beliefs.map((belief) => (
                  <li key={belief} className="flex gap-4 text-lg text-ink">
                    <span aria-hidden="true" className="mt-2 size-3 shrink-0 rounded-full bg-turquoise ring-4 ring-turquoise/20" />
                    <span>{belief}</span>
                  </li>
                ))}
              </ul>
            </div>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
