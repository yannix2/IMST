import { ArrowUpRightIcon } from "lucide-react";
import { localeDirection, localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { facts } from "@/lib/facts";
import { gradeAges } from "@maarif/contracts/school";
import { ReasonsStage, type ReasonFigure } from "./reasons-stage";

// "Why families choose Maarif" as a scroll story (owner decision 2026-11-05). The four
// confirmed reasons (product.md, Positioning) are chapters; each carries its proof (facts.ts
// only, nothing invented) and leads to the page that tells more. On large screens one stage
// stays beside the text and changes figure as each chapter reaches the middle of the screen:
// the rosette's four arms (languages), the schoolhouse with its Kindergarten door ajar (a
// caring start), a ring of schools (the network) and a robot arm (science and robotics).
// Phones: each chapter shows its own figure under its text.

type Extra = {
  activities: [string, string, string];
  more: [string, string, string, string];
  networkLabel: string;
  robotLabel: string;
};

const extra: Record<Locale, Extra> = {
  en: {
    activities: ["Science fair", "Computing", "Robotics club"],
    more: ["The four languages", "Kindergarten", "Accreditations and network", "Technology and learning spaces"],
    networkLabel: "One school at the centre of a ring of schools. Point at one to raise it and light its link.",
    robotLabel: "A small robot arm on a work plate. It turns to follow the pointer and lowers its gripper.",
  },
  fr: {
    activities: ["Foire scientifique", "Informatique", "Club de robotique"],
    more: ["Les quatre langues", "La maternelle", "Accréditations et réseau", "Technologie et espaces d’apprentissage"],
    networkLabel: "Une école au centre d’un cercle d’écoles. Pointez-en une pour la soulever et éclairer son lien.",
    robotLabel: "Un petit bras robotique sur un plateau. Il suit le pointeur et abaisse sa pince.",
  },
  ar: {
    activities: ["معرض العلوم", "الإعلامية", "نادي الروبوتيك"],
    more: ["اللغات الأربع", "الروضة", "الاعتمادات والشبكة", "التكنولوجيا وفضاءات التعلّم"],
    networkLabel: "مدرسة في وسط حلقة من المدارس. أشيروا إلى إحداها لترتفع ويضيء رابطها.",
    robotLabel: "ذراع روبوت صغيرة على لوح عمل، تتبع المؤشر وتُنزل ملقطها.",
  },
  tr: {
    activities: ["Bilim fuarı", "Bilişim", "Robotik kulübü"],
    more: ["Dört dil", "Anaokulu", "Akreditasyonlar ve ağ", "Teknoloji ve öğrenme alanları"],
    networkLabel: "Okullardan oluşan bir halkanın ortasında bir okul. Birinin üzerine gelin, yükselsin ve bağı parlasın.",
    robotLabel: "Bir çalışma tablasında küçük bir robot kol. İmleci izler ve kıskacını indirir.",
  },
};

const pages = ["/programs/languages", "/programs/kindergarten", "/about/accreditations", "/programs/technology"] as const;

export function Reasons({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const x = extra[locale];
  const items = t.reasons.items;
  if (items.length !== 4) return null;

  const figures: ReasonFigure[] = [
    { name: "rosette", label: t.hero.figureLabel, captions: { ...localeNativeName } },
    {
      name: "schoolhouse",
      label: t.cta.figureLabel,
      captions: { kindergarten: t.levels.kindergarten, primary: t.levels.primary, secondary: t.levels.secondary },
    },
    { name: "network", label: x.networkLabel },
    { name: "robot", label: x.robotLabel },
  ];

  // The proof each chapter leads with: a figure from facts.ts, or the things the text names.
  const [kg0, kg1] = gradeAges.kg;
  const proofs: React.ReactNode[] = [
    <ul key="l" className="flex flex-wrap gap-2">
      {locales.map((code) => (
        <li key={code} lang={code} dir={localeDirection[code]} className="rounded-full bg-surface px-4 py-2 font-heading text-lg font-bold text-heading shadow-rest ring-1 ring-rule/70">
          {localeNativeName[code]}
        </li>
      ))}
    </ul>,
    <p key="c" className="flex items-baseline gap-3">
      <span className="tabular font-heading text-5xl font-bold text-heading" dir="ltr">
        {kg0}–{kg1}
      </span>
      <span className="text-slate">{t.levels.kindergarten}</span>
    </p>,
    <p key="n" className="flex items-baseline gap-3">
      <span className="tabular font-heading text-5xl font-bold text-heading">{facts.networkCountries}</span>
      <span className="text-slate">{t.proof.countries}</span>
    </p>,
    <ul key="s" className="flex flex-wrap gap-2">
      {x.activities.map((name) => (
        <li key={name} className="rounded-full bg-turquoise px-4 py-2 font-medium text-on-turquoise">
          {name}
        </li>
      ))}
    </ul>,
  ];

  return (
    <section aria-labelledby="reasons-title" className="bg-turquoise-wash py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <h2 id="reasons-title" className="max-w-[24ch] text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-heading">
          {t.reasons.title}
        </h2>
        <ReasonsStage
          figures={figures}
          chapters={items.map((item, i) => (
              <div key={item.title} className="flex flex-col gap-5">
                {proofs[i]}
                <h3 className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-heading">{item.title}</h3>
                <p className="max-w-[46ch] text-lg text-slate">{item.text}</p>
                <a href={`/${locale}${pages[i]}`} className="group inline-flex min-h-11 w-fit items-center gap-2 font-medium text-turquoise-ink no-underline hover:underline">
                  {x.more[i]}
                  <ArrowUpRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
                </a>
              </div>
          ))}
        />
      </div>
    </section>
  );
}
