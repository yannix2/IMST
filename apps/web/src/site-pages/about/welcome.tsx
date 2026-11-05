import type { Locale } from "@maarif/contracts/locales";
import { pageNames } from "@/i18n/pages";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { LazyHeadMessage } from "@/components/landing/lazy-sections";
import { aboutFigure } from "../figures";

// The welcome: the head of school's video message from maarifcms (the same section as on Home,
// hidden until published), then the school's own welcome letter from the old Greetings page
// (signed "Admissions Office"), lightly edited. [PROPOSAL] Letter to be approved.

type Copy = { lede: string; letterTitle: string; letter: string[]; signature: string };

const copy: Record<Locale, Copy> = {
  en: {
    lede: "Thank you for your interest in the school. Choosing the right school for your child matters, and we would like to help.",
    letterTitle: "Dear parents",
    letter: [
      "Thank you for your interest in International Maarif Schools of Tunisia. Choosing the right school for your child is one of the most important decisions a family makes.",
      "Our staff are dedicated to every child, whatever their background or ability, and children can take part in a wide range of sporting, cultural and extra-curricular activities.",
      "We expect high standards from our students, and we reach them together: staff, parents, students and the wider community working as one team.",
      "These pages tell you about our curriculum, our campuses and how we teach. The best way to know us, though, is to come and see: contact us or book a visit, and we will show you around.",
    ],
    signature: "The Admissions Office",
  },
  fr: {
    lede: "Merci de l’intérêt que vous portez à l’école. Bien choisir l’école de votre enfant compte, et nous souhaitons vous y aider.",
    letterTitle: "Chers parents",
    letter: [
      "Merci de l’intérêt que vous portez aux Écoles Internationales Maarif de Tunisie. Choisir la bonne école pour son enfant est l’une des décisions les plus importantes pour une famille.",
      "Notre équipe se consacre à chaque enfant, quels que soient son parcours ou ses capacités, et les enfants peuvent participer à de nombreuses activités sportives, culturelles et parascolaires.",
      "Nous attendons beaucoup de nos élèves, et nous y parvenons ensemble : personnel, parents, élèves et communauté forment une seule équipe.",
      "Ces pages présentent notre programme, nos campus et notre façon d’enseigner. Mais le meilleur moyen de nous connaître est de venir nous voir : contactez-nous ou réservez une visite.",
    ],
    signature: "Le service des admissions",
  },
  ar: {
    lede: "شكرًا لاهتمامكم بالمدرسة. اختيار المدرسة المناسبة لطفلكم أمر مهم، ونودّ مساعدتكم فيه.",
    letterTitle: "أعزّاءنا الأولياء",
    letter: [
      "شكرًا لاهتمامكم بمدارس المعارف الدولية بتونس. إنّ اختيار المدرسة المناسبة للطفل من أهمّ القرارات التي تتّخذها العائلة.",
      "يكرّس فريقنا جهده لكل طفل مهما كانت خلفيّته أو قدراته، ويمكن للأطفال المشاركة في أنشطة رياضية وثقافية ولاصفّية متنوّعة.",
      "ننتظر من تلاميذنا مستوى عاليًا، ونبلغه معًا: الموظفون والأولياء والتلاميذ والمجتمع فريق واحد.",
      "تعرّفكم هذه الصفحات بمنهاجنا وفروعنا وطريقة تدريسنا. لكنّ أفضل طريقة للتعرّف إلينا هي الزيارة: اتصلوا بنا أو احجزوا زيارة.",
    ],
    signature: "مكتب القبول",
  },
  tr: {
    lede: "Okulumuza gösterdiğiniz ilgi için teşekkür ederiz. Çocuğunuz için doğru okulu seçmek önemlidir; size yardımcı olmak isteriz.",
    letterTitle: "Sevgili veliler",
    letter: [
      "Tunus Uluslararası Maarif Okulları’na gösterdiğiniz ilgi için teşekkür ederiz. Çocuğunuz için doğru okulu seçmek, bir ailenin verdiği en önemli kararlardan biridir.",
      "Kadromuz, geçmişi ya da yetenekleri ne olursa olsun her çocuğa kendini adar; çocuklar çok çeşitli spor, kültür ve ders dışı etkinliklere katılabilir.",
      "Öğrencilerimizden yüksek bir düzey bekleriz ve buna birlikte ulaşırız: personel, veliler, öğrenciler ve toplum tek bir ekip olarak çalışır.",
      "Bu sayfalar müfredatımızı, kampüslerimizi ve öğretim biçimimizi anlatır. Bizi tanımanın en iyi yolu ise gelip görmektir: bize ulaşın ya da bir ziyaret planlayın.",
    ],
    signature: "Kabul Ofisi",
  },
};

export function WelcomePage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="about/welcome"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <LazyHeadMessage locale={locale} />
          <PageSection id="letter" tone="mist">
            <article className="mx-auto max-w-[44rem] rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:p-12">
              <h2 className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-heading">{c.letterTitle}</h2>
              <div className="mt-6 flex flex-col gap-4 text-lg text-ink">
                {c.letter.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="mt-8 font-heading text-lg font-bold text-turquoise-ink">{c.signature}</p>
              <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
            </article>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
