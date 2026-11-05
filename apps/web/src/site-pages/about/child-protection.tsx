import { EyeIcon, GraduationCapIcon, HeartHandshakeIcon, MegaphoneIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { pageNames } from "@/i18n/pages";
import { campuses, schoolEmail, telHref } from "@/lib/school";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { aboutFigure } from "../figures";

// The school's own Child Protection Policy (old site, six sections), rewritten for parents
// (owner decision 2026-11-05: lightly edited). [PROPOSAL] To be approved, dated and checked
// against Tunisian rules and the Foundation's policy; a named safeguarding contact is missing
// on the old page, so parents are pointed to the school's phone and email.

type Copy = {
  lede: string;
  sections: { title: string; text: string }[];
  worriedTitle: string;
  worried: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    lede: "Every child at the school has the right to feel safe. This is how we protect them, and what to do if you are worried.",
    sections: [
      { title: "Our commitment", text: "We protect and promote the welfare of every child enrolled, with a clear way to notice, report and act on any concern." },
      { title: "A safe school", text: "A safe, welcoming and inclusive school, with background checks for all staff and teachers, and an open culture where children know they can speak up." },
      { title: "Who is responsible", text: "The school counsellor coordinates child protection, makes sure staff are trained and is the contact for outside agencies. Every member of staff reports any concern to the counsellor or the vice principal." },
      { title: "When there is a concern", text: "Staff report a concern as soon as possible, and the school follows its procedures, including referral to outside agencies when needed." },
      { title: "Training and support", text: "Staff, volunteers and contractors are trained regularly, and children at risk receive support." },
      { title: "Reviewed every year", text: "The policy is reviewed and updated each year, and changes are shared with staff and parents." },
    ],
    worriedTitle: "If you are worried about a child",
    worried: "Speak to the school counsellor or the vice principal. You can call the school or write to us; your concern is handled in confidence.",
  },
  fr: {
    lede: "Chaque enfant de l’école a le droit de se sentir en sécurité. Voici comment nous le protégeons, et que faire si vous êtes inquiet.",
    sections: [
      { title: "Notre engagement", text: "Nous protégeons et favorisons le bien-être de chaque enfant inscrit, avec une manière claire de repérer, signaler et traiter toute inquiétude." },
      { title: "Une école sûre", text: "Une école sûre, accueillante et inclusive, avec une vérification des antécédents de tout le personnel et des enseignants, et une culture ouverte où les enfants savent qu’ils peuvent parler." },
      { title: "Qui est responsable", text: "Le conseiller scolaire coordonne la protection de l’enfance, veille à la formation du personnel et est l’interlocuteur des organismes extérieurs. Chaque membre du personnel signale toute inquiétude au conseiller ou au directeur adjoint." },
      { title: "En cas d’inquiétude", text: "Le personnel signale une inquiétude dès que possible, et l’école suit ses procédures, y compris l’orientation vers des organismes extérieurs si nécessaire." },
      { title: "Formation et soutien", text: "Le personnel, les bénévoles et les prestataires sont formés régulièrement, et les enfants en danger reçoivent un soutien." },
      { title: "Revue chaque année", text: "La politique est revue et mise à jour chaque année, et les changements sont communiqués au personnel et aux parents." },
    ],
    worriedTitle: "Si vous êtes inquiet pour un enfant",
    worried: "Parlez au conseiller scolaire ou au directeur adjoint. Vous pouvez appeler l’école ou nous écrire ; votre inquiétude est traitée en toute confidentialité.",
  },
  ar: {
    lede: "لكل طفل في المدرسة الحق في أن يشعر بالأمان. هكذا نحميه، وهذا ما تفعلونه إن كنتم قلقين.",
    sections: [
      { title: "التزامنا", text: "نحمي رفاه كل طفل مسجّل ونعزّزه، بطريقة واضحة لملاحظة أي قلق والإبلاغ عنه والتعامل معه." },
      { title: "مدرسة آمنة", text: "مدرسة آمنة ومرحّبة وشاملة، مع التحقّق من سوابق جميع الموظفين والمدرّسين، وثقافة منفتحة يعرف فيها الأطفال أنّ بإمكانهم الكلام." },
      { title: "من المسؤول", text: "ينسّق المرشد المدرسي حماية الطفل، ويتأكّد من تدريب الموظفين، وهو جهة الاتصال مع الهيئات الخارجية. ويبلّغ كل موظف عن أي قلق إلى المرشد أو نائب المدير." },
      { title: "عند وجود قلق", text: "يبلّغ الموظفون عن القلق في أقرب وقت، وتتبع المدرسة إجراءاتها، بما في ذلك الإحالة إلى هيئات خارجية عند الحاجة." },
      { title: "التدريب والدعم", text: "يتلقّى الموظفون والمتطوّعون والمتعاقدون تدريبًا منتظمًا، ويحصل الأطفال المعرّضون للخطر على الدعم." },
      { title: "مراجعة كل سنة", text: "تُراجَع السياسة وتُحدَّث كل سنة، وتُبلَّغ التغييرات للموظفين والأولياء." },
    ],
    worriedTitle: "إن كنتم قلقين على طفل",
    worried: "تحدّثوا إلى المرشد المدرسي أو نائب المدير. يمكنكم الاتصال بالمدرسة أو مراسلتنا، ويُعالَج قلقكم بسرّية.",
  },
  tr: {
    lede: "Okuldaki her çocuğun kendini güvende hissetme hakkı vardır. Onları nasıl koruduğumuz ve endişeniz olursa ne yapacağınız burada.",
    sections: [
      { title: "Taahhüdümüz", text: "Kayıtlı her çocuğun esenliğini korur ve destekleriz; her endişeyi fark etmenin, bildirmenin ve ele almanın açık bir yolu vardır." },
      { title: "Güvenli bir okul", text: "Tüm personel ve öğretmenler için geçmiş kontrolü yapılan, güvenli, sıcak ve kapsayıcı bir okul; çocukların konuşabileceklerini bildikleri açık bir kültür." },
      { title: "Kim sorumlu", text: "Okul rehber öğretmeni çocuk korumayı koordine eder, personelin eğitimini sağlar ve dış kurumlarla iletişim kişisidir. Her personel, her endişeyi rehber öğretmene ya da müdür yardımcısına bildirir." },
      { title: "Bir endişe olduğunda", text: "Personel endişeyi en kısa sürede bildirir; okul, gerektiğinde dış kurumlara yönlendirme dahil kendi prosedürlerini izler." },
      { title: "Eğitim ve destek", text: "Personel, gönüllüler ve yükleniciler düzenli olarak eğitilir; risk altındaki çocuklar destek alır." },
      { title: "Her yıl gözden geçirilir", text: "Politika her yıl gözden geçirilip güncellenir; değişiklikler personel ve velilerle paylaşılır." },
    ],
    worriedTitle: "Bir çocuk için endişeleniyorsanız",
    worried: "Okul rehber öğretmeniyle ya da müdür yardımcısıyla konuşun. Okulu arayabilir ya da bize yazabilirsiniz; endişeniz gizlilik içinde ele alınır.",
  },
};

const icons = [ShieldCheckIcon, HeartHandshakeIcon, EyeIcon, MegaphoneIcon, GraduationCapIcon, RefreshCwIcon];

export function ChildProtectionPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const phone = campuses.schools.phones[0];
  return (
    <PageShell
      locale={locale}
      page="about/child-protection"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="policy" tone="mist">
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {c.sections.map((s, i) => {
                const Icon = icons[i] ?? ShieldCheckIcon;
                return (
                  <li key={s.title} className="flex flex-col gap-3 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70">
                    <Icon aria-hidden="true" className="size-7 text-turquoise-ink" strokeWidth={1.75} />
                    <h2 className="text-xl font-bold text-heading">{s.title}</h2>
                    <p className="text-slate">{s.text}</p>
                  </li>
                );
              })}
            </ul>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
          <PageSection id="worried">
            <div className="flex flex-col gap-6 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[56ch]">
                <h2 className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">{c.worriedTitle}</h2>
                <p className="mt-3 text-lg text-slate">{c.worried}</p>
              </div>
              <div className="flex flex-col gap-2 text-lg">
                <a href={telHref(phone)} dir="ltr" className="tabular font-bold text-heading no-underline hover:underline">
                  {phone}
                </a>
                <a href={`mailto:${schoolEmail}`} className="break-all text-turquoise-ink">
                  {schoolEmail}
                </a>
              </div>
            </div>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
