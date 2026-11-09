import type { Locale } from "@maarif/contracts/locales";
import type { PhotoId } from "@/content/media";

// "Our journey in Tunisia" on Home (wave 2, task 6.3; owner decision 2026-11-06: dated events from
// the old site plus slots to confirm). Every dated milestone comes from the old site's own news
// (maarif_site_data.json, date in brackets). Milestones marked `confirmed: false` are questions for
// the school: they show only in development, as [to confirm], never on the live site.
// The photos show the school today (2025-26 and 2026-27); they do not illustrate older years.

type Words = Record<Locale, string>;
export type Milestone = { key: string; year: string; confirmed: boolean; title: Words; text: Words };

export const milestones: Milestone[] = [
  {
    key: "founding",
    year: "[year]",
    confirmed: false,
    title: { en: "The school opens", fr: "Ouverture de l’école", ar: "افتتاح المدرسة", tr: "Okul açılıyor" },
    text: {
      en: "[to confirm: the year the International Maarif Schools of Tunisia opened]",
      fr: "[à confirmer : l’année d’ouverture des Écoles Internationales Maarif de Tunisie]",
      ar: "[للتأكيد: سنة افتتاح مدارس المعارف الدولية بتونس]",
      tr: "[teyit edilecek: Tunus Uluslararası Maarif Okulları’nın açıldığı yıl]",
    },
  },
  {
    key: "foundation-tunisia",
    year: "2018",
    confirmed: true, // old site news, 2018-10-26
    title: { en: "The Foundation in Tunisia", fr: "La Fondation en Tunisie", ar: "الوقف في تونس", tr: "Vakıf Tunus’ta" },
    text: {
      en: "The Türkiye Maarif Foundation continues its work in Tunisia, one of its pilot countries.",
      fr: "La Fondation Maarif de Türkiye poursuit son action en Tunisie, l’un de ses pays pilotes.",
      ar: "يواصل وقف المعارف التركي نشاطه في تونس، أحد بلدانه النموذجية.",
      tr: "Türkiye Maarif Vakfı, pilot ülkelerinden biri olan Tunus’taki çalışmalarını sürdürüyor.",
    },
  },
  {
    key: "first-igcse",
    year: "2020",
    confirmed: true, // old site news, 2020-09-01
    title: { en: "First Cambridge IGCSE exams", fr: "Premiers examens Cambridge IGCSE", ar: "أولى امتحانات Cambridge IGCSE", tr: "İlk Cambridge IGCSE sınavları" },
    text: {
      en: "Our students sit the Cambridge IGCSE exams for the first time.",
      fr: "Nos élèves passent pour la première fois les examens Cambridge IGCSE.",
      ar: "يجتاز تلاميذنا امتحانات ⁨Cambridge IGCSE⁩ لأول مرة.",
      tr: "Öğrencilerimiz Cambridge IGCSE sınavlarına ilk kez giriyor.",
    },
  },
  {
    key: "robotics",
    year: "2020",
    confirmed: true, // old site news, 2020-11-09
    title: { en: "Robotics club", fr: "Club de robotique", ar: "نادي الروبوتيك", tr: "Robotik kulübü" },
    text: {
      en: "The robotics club presents its FLL Junior project to FLL Tunisie.",
      fr: "Le club de robotique présente son projet FLL Junior à FLL Tunisie.",
      // ⁨ … ⁩ isolate the Latin names so the Arabic sentence keeps its order.
      ar: "يقدّم نادي الروبوتيك مشروعه في ⁨FLL Junior⁩ أمام ⁨FLL Tunisie⁩.",
      tr: "Robotik kulübü FLL Junior projesini FLL Tunisie’ye sunuyor.",
    },
  },
  {
    key: "math-olympiads",
    year: "2022",
    confirmed: true, // old site news, 2022-05-09
    title: { en: "Maarif Math Olympiads", fr: "Olympiades de mathématiques Maarif", ar: "أولمبياد المعارف للرياضيات", tr: "Maarif Matematik Olimpiyatları" },
    text: {
      en: "A team of our students wins the Maarif Math Olympiads 2021/2022.",
      fr: "Une équipe de nos élèves remporte les Olympiades de mathématiques Maarif 2021/2022.",
      ar: "فريق من تلاميذنا يفوز بأولمبياد المعارف للرياضيات 2021/2022.",
      tr: "Öğrencilerimizden bir takım 2021/2022 Maarif Matematik Olimpiyatları’nı kazanıyor.",
    },
  },
  {
    key: "graduates-2024",
    year: "2024",
    confirmed: true, // old site news, 2024-07-16
    title: { en: "Class of 2024", fr: "Promotion 2024", ar: "دفعة 2024", tr: "2024 mezunları" },
    text: {
      en: "Our high school graduates of 2024 complete Year 13.",
      fr: "Nos lycéens de la promotion 2024 terminent l’Année 13.",
      ar: "يُنهي تلاميذ الثانوي من دفعة 2024 سنة 13.",
      tr: "2024 lise mezunlarımız Yıl 13’ü tamamlıyor.",
    },
  },
  {
    key: "archery-club",
    year: "2025",
    confirmed: true, // old site news, 2025-10-08
    title: { en: "Traditional archery club", fr: "Club de tir à l’arc traditionnel", ar: "نادي الرماية التقليدية", tr: "Geleneksel okçuluk kulübü" },
    text: {
      en: "The Traditional Turkish Archery Club opens, organised with Yunus Emre Enstitüsü.",
      fr: "Ouverture du club de tir à l’arc traditionnel turc, organisé avec le Yunus Emre Enstitüsü.",
      ar: "افتتاح نادي الرماية التركية التقليدية بالتعاون مع معهد يونس إمره.",
      tr: "Yunus Emre Enstitüsü ile birlikte Geleneksel Türk Okçuluğu Kulübü açılıyor.",
    },
  },
  {
    key: "campuses",
    year: "[year]",
    confirmed: false,
    title: { en: "Our two campuses", fr: "Nos deux campus", ar: "فرعانا", tr: "İki kampüsümüz" },
    text: {
      en: "[to confirm: when the Le Kram and Charguia 2 campuses opened]",
      fr: "[à confirmer : dates d’ouverture des campus du Kram et de Charguia 2]",
      ar: "[للتأكيد: تاريخ افتتاح فرعي الكرم والشرقية 2]",
      tr: "[teyit edilecek: Le Kram ve Charguia 2 kampüslerinin açılış tarihleri]",
    },
  },
];

// The stack of photos above the timeline (Home "Page photos" slots journey-1 … journey-5).
export const journeyPhotos: PhotoId[] = ["graduation-plaque", "archery-targets", "maarif-talks", "back-to-school", "model-oic"];

export const journeyCopy: Record<Locale, { eyebrow: string; title: string; lede: string; today: string; toConfirm: string }> = {
  en: { eyebrow: "Our journey", title: "Our journey in Tunisia", lede: "Some of the moments that shaped the school, as recorded in its own news.", today: "The school today", toConfirm: "to confirm" },
  fr: { eyebrow: "Notre parcours", title: "Notre parcours en Tunisie", lede: "Quelques moments qui ont façonné l’école, tels que racontés dans ses propres actualités.", today: "L’école aujourd’hui", toConfirm: "à confirmer" },
  ar: { eyebrow: "مسيرتنا", title: "مسيرتنا في تونس", lede: "بعض اللحظات التي صنعت المدرسة، كما روتها أخبارها.", today: "المدرسة اليوم", toConfirm: "للتأكيد" },
  tr: { eyebrow: "Yolculuğumuz", title: "Tunus’taki yolculuğumuz", lede: "Okulun kendi haberlerinde anlattığı, onu şekillendiren anlardan bazıları.", today: "Bugün okulumuz", toConfirm: "teyit edilecek" },
};
