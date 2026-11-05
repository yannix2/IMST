import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { campuses, telHref } from "@/lib/school";
import { whatsappForPage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

// The Admissions pages. Sources: the Home admissions steps, the old Grade and Age Eligibility
// page (age table and placement rules), School Bus and Canteen page, and the owner's decisions
// of 2026-11-05 (fees on request, FAQ from maarifcms). Nothing about fees, routes or prices is
// stated: families are asked to contact the school.

// This module holds the shared copy and has no client imports, so each page's route ships
// only its own client parts.

export type Copy = {
  lede: Record<"admissions" | "ages" | "visit" | "pre" | "faq" | "bus" | "fees", string>;
  rulesTitle: string;
  rules: string[];
  tableTitle: string;
  table: { grade: string; ages: string; campus: string };
  pathTitle: string;
  faqMore: string;
  busTitle: string;
  bus: string;
  canteenTitle: string;
  canteen: string;
  feesTitle: string;
  fees: string;
  feesAsk: string;
  preNext: string;
};

export const copy: Record<Locale, Copy> = {
  en: {
    lede: {
      admissions: "Four stations from first contact to the first day. Here is how to join, and the rules for ages and placement.",
      ages: "The usual grade for each age, and your child’s whole path from the birth year.",
      visit: "Choose a day and a time. A member of our team will call you to confirm the visit.",
      pre: "Tell us about your child in a few minutes. We will call you to answer your questions and plan the next step.",
      faq: "Answers to the questions families ask most. Ask us anything else on WhatsApp.",
      bus: "School transport and lunch at school, with this week’s menu.",
      fees: "Fees depend on your child’s grade. Ask us and we will send them to you.",
    },
    rulesTitle: "Ages and placement",
    rules: [
      "Placement in a grade is based on the child’s age and the result of a placement test.",
      "The age cut-off date follows the official rules.",
      "Under certain conditions, the admissions team may accept a child whose age is outside the table.",
    ],
    tableTitle: "The age table",
    table: { grade: "Grade", ages: "Usual age", campus: "Campus" },
    pathTitle: "Your child’s path",
    faqMore: "Your question is not here? Ask us on WhatsApp.",
    busTitle: "School bus",
    bus: "The school runs a bus service for the daily journey to school. Contact the school to arrange a route.",
    canteenTitle: "Canteen",
    canteen: "The school provides lunch for children whose parents register them for it.",
    feesTitle: "Fees on request",
    fees: "Tell us your child’s grade and we will send you the fees for the coming school year, with what they include.",
    feesAsk: "Ask about fees",
    preNext: "What happens next",
  },
  fr: {
    lede: {
      admissions: "Quatre étapes du premier contact au premier jour. Voici comment nous rejoindre, et les règles d’âge et de placement.",
      ages: "La classe habituelle pour chaque âge, et tout le parcours de votre enfant selon son année de naissance.",
      visit: "Choisissez un jour et un moment. Un membre de notre équipe vous appellera pour confirmer la visite.",
      pre: "Présentez-nous votre enfant en quelques minutes. Nous vous appellerons pour répondre à vos questions et préparer la suite.",
      faq: "Les réponses aux questions les plus fréquentes. Pour toute autre question, écrivez-nous sur WhatsApp.",
      bus: "Le transport scolaire et le déjeuner à l’école, avec le menu de la semaine.",
      fees: "Les frais dépendent de la classe de votre enfant. Demandez-les-nous et nous vous les enverrons.",
    },
    rulesTitle: "Âges et placement",
    rules: [
      "Le placement dans une classe se fait selon l’âge de l’enfant et le résultat d’un test de placement.",
      "La date limite d’âge suit les règles officielles.",
      "Dans certaines conditions, l’équipe des admissions peut accepter un enfant dont l’âge sort du tableau.",
    ],
    tableTitle: "Le tableau des âges",
    table: { grade: "Classe", ages: "Âge habituel", campus: "Campus" },
    pathTitle: "Le parcours de votre enfant",
    faqMore: "Votre question n’y est pas ? Écrivez-nous sur WhatsApp.",
    busTitle: "Bus scolaire",
    bus: "L’école propose un service de bus pour le trajet quotidien. Contactez l’école pour organiser un itinéraire.",
    canteenTitle: "Cantine",
    canteen: "L’école sert le déjeuner aux enfants que leurs parents y inscrivent.",
    feesTitle: "Frais sur demande",
    fees: "Indiquez-nous la classe de votre enfant et nous vous enverrons les frais de la prochaine année scolaire, avec ce qu’ils comprennent.",
    feesAsk: "Demander les frais",
    preNext: "Et ensuite",
  },
  ar: {
    lede: {
      admissions: "أربع محطات من أول اتصال إلى أول يوم. هكذا تلتحقون بالمدرسة، وهذه قواعد الأعمار والتوجيه إلى الأقسام.",
      ages: "القسم المعتاد لكل عمر، ومسار طفلكم كاملًا حسب سنة ولادته.",
      visit: "اختاروا يومًا ووقتًا، وسيتصل بكم أحد أعضاء فريقنا لتأكيد الزيارة.",
      pre: "عرّفونا بطفلكم في دقائق. سنتصل بكم للإجابة عن أسئلتكم والتخطيط للخطوة التالية.",
      faq: "أجوبة عن أكثر ما تسأل عنه العائلات. واسألونا عن أي شيء آخر على واتساب.",
      bus: "النقل المدرسي والغداء في المدرسة، مع قائمة طعام هذا الأسبوع.",
      fees: "تختلف الرسوم حسب قسم طفلكم. اطلبوها منّا وسنرسلها إليكم.",
    },
    rulesTitle: "الأعمار والتوجيه",
    rules: [
      "يتمّ التوجيه إلى القسم حسب عمر الطفل ونتيجة اختبار تموضع.",
      "يتبع تاريخ احتساب العمر القواعد الرسمية.",
      "في بعض الحالات، يمكن لفريق القبول قبول طفل عمره خارج الجدول.",
    ],
    tableTitle: "جدول الأعمار",
    table: { grade: "القسم", ages: "العمر المعتاد", campus: "الفرع" },
    pathTitle: "مسار طفلكم",
    faqMore: "سؤالكم غير موجود؟ اسألونا على واتساب.",
    busTitle: "الحافلة المدرسية",
    bus: "توفّر المدرسة خدمة حافلة للتنقّل اليومي إلى المدرسة. اتصلوا بالمدرسة لترتيب المسار.",
    canteenTitle: "المطعم",
    canteen: "توفّر المدرسة الغداء للأطفال الذين يسجّلهم أولياؤهم فيه.",
    feesTitle: "الرسوم عند الطلب",
    fees: "أخبرونا بقسم طفلكم وسنرسل إليكم رسوم السنة الدراسية القادمة وما تشمله.",
    feesAsk: "اسألوا عن الرسوم",
    preNext: "ماذا يحدث بعد ذلك",
  },
  tr: {
    lede: {
      admissions: "İlk temastan ilk güne dört durak. Okula nasıl katılacağınız ve yaş ile yerleştirme kuralları burada.",
      ages: "Her yaş için olağan sınıf ve doğum yılından itibaren çocuğunuzun tüm yolu.",
      visit: "Bir gün ve saat seçin. Ekibimizden biri ziyareti onaylamak için sizi arayacak.",
      pre: "Birkaç dakikada çocuğunuzu bize tanıtın. Sorularınızı yanıtlamak ve sonraki adımı planlamak için sizi arayacağız.",
      faq: "Ailelerin en çok sorduğu soruların yanıtları. Diğer her şeyi WhatsApp’ta sorun.",
      bus: "Okul servisi ve okulda öğle yemeği, bu haftanın menüsüyle.",
      fees: "Ücretler çocuğunuzun sınıfına göre değişir. Bize sorun, size gönderelim.",
    },
    rulesTitle: "Yaşlar ve yerleştirme",
    rules: [
      "Bir sınıfa yerleştirme, çocuğun yaşına ve seviye sınavının sonucuna göre yapılır.",
      "Yaş için esas alınan tarih resmî kurallara göre belirlenir.",
      "Bazı koşullarda kabul ekibi, yaşı tablonun dışında kalan bir çocuğu kabul edebilir.",
    ],
    tableTitle: "Yaş tablosu",
    table: { grade: "Sınıf", ages: "Olağan yaş", campus: "Kampüs" },
    pathTitle: "Çocuğunuzun yolu",
    faqMore: "Sorunuz burada yok mu? WhatsApp’ta bize sorun.",
    busTitle: "Okul servisi",
    bus: "Okul, günlük ulaşım için servis hizmeti sunar. Güzergâh düzenlemek için okulla iletişime geçin.",
    canteenTitle: "Yemekhane",
    canteen: "Okul, velilerin kaydettirdiği çocuklara öğle yemeği verir.",
    feesTitle: "İstek üzerine ücretler",
    fees: "Çocuğunuzun sınıfını bize bildirin; gelecek öğretim yılının ücretlerini ve neleri kapsadığını size gönderelim.",
    feesAsk: "Ücretleri sorun",
    preNext: "Sonra ne olur",
  },
};

export const lineDot = { kindergarten: "bg-level-kindergarten", primary: "bg-level-primary", secondary: "bg-level-secondary" } as const;

export function Ask({ locale, page, label }: { locale: Locale; page: Parameters<typeof whatsappForPage>[1]; label: string }) {
  const phone = campuses.schools.phones[0];
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="lg">
        <a href={whatsappForPage(locale, page)} target="_blank" rel="noopener noreferrer">
          <MessageCircleIcon data-icon="inline-start" />
          {label}
        </a>
      </Button>
      <Button asChild size="lg" variant="outline">
        <a href={telHref(phone)}>
          <PhoneIcon data-icon="inline-start" />
          <span className="tabular" dir="ltr">
            {phone}
          </span>
        </a>
      </Button>
    </div>
  );
}


export const descriptions = {
  admissions: (l: Locale) => copy[l].lede.admissions,
  ages: (l: Locale) => copy[l].lede.ages,
  visit: (l: Locale) => copy[l].lede.visit,
  pre: (l: Locale) => copy[l].lede.pre,
  faq: (l: Locale) => copy[l].lede.faq,
  bus: (l: Locale) => copy[l].lede.bus,
  fees: (l: Locale) => copy[l].lede.fees,
};
