import { LightbulbIcon, RefreshCwIcon, SproutIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { pageNames } from "@/i18n/pages";
import { aboutFigure } from "../figures";

// The school's own vision, mission and "how we achieve it" from the old site's Vision &
// Mission page (maarif_site_data.json), lightly edited into shorter sentences (owner decision
// 2026-11-05). [PROPOSAL] To be approved by the administration; FR, AR, TR are drafts.

type Copy = {
  lede: string;
  visionTitle: string;
  vision: string[];
  missionTitle: string;
  mission: string[];
  howTitle: string;
  howLede: string;
  how: { title: string; text: string }[];
};

const copy: Record<Locale, Copy> = {
  en: {
    lede: "What we want for every child who walks through our doors, and the three commitments that get us there.",
    visionTitle: "Our vision",
    vision: [
      "To be a leading international school in Tunisia: a caring, stimulating place where children receive support and security as well as an education.",
      "We promote mutual respect and diversity, so that every child can follow their own path with the skills and values that lead to a successful future, and grow into someone who makes a difference in their community.",
    ],
    missionTitle: "Our mission",
    mission: [
      "To help learners become active, creative and knowledgeable citizens of the world by inspiring a love of learning that lasts a lifetime.",
      "We help each student reach their full potential and gain the skills to become a responsible global citizen and a leader of tomorrow: someone who respects the world’s cultures, traditions and environments, and contributes with principle and imagination.",
    ],
    howTitle: "How we work towards it",
    howLede: "Three commitments the school holds itself to.",
    how: [
      { title: "Teaching built around the child", text: "Student-centred teaching on an international curriculum, grounded in sound teaching practice and learning through inquiry." },
      { title: "Every child at their own level", text: "We know where each student stands and use many teaching strategies, so that every child moves forward." },
      { title: "Always improving", text: "We keep evaluating and improving the learning environment, the materials, the curriculum and the teaching team." },
    ],
  },
  fr: {
    lede: "Ce que nous voulons pour chaque enfant qui franchit nos portes, et les trois engagements qui nous y mènent.",
    visionTitle: "Notre vision",
    vision: [
      "Être une école internationale de référence en Tunisie : un lieu bienveillant et stimulant, où les enfants trouvent soutien et sécurité autant qu’une éducation.",
      "Nous cultivons le respect mutuel et la diversité, pour que chaque enfant suive son propre chemin avec les compétences et les valeurs qui mènent à la réussite, et devienne quelqu’un qui compte dans sa communauté.",
    ],
    missionTitle: "Notre mission",
    mission: [
      "Aider les élèves à devenir des citoyens du monde actifs, créatifs et cultivés, en leur donnant le goût d’apprendre tout au long de la vie.",
      "Nous aidons chaque élève à révéler tout son potentiel et à acquérir les compétences d’un citoyen du monde responsable et d’un acteur de demain : quelqu’un qui respecte les cultures, les traditions et les environnements du monde, et qui contribue avec intégrité et imagination.",
    ],
    howTitle: "Comment nous y travaillons",
    howLede: "Trois engagements que l’école se fixe.",
    how: [
      { title: "Un enseignement centré sur l’enfant", text: "Un enseignement centré sur l’élève, sur un programme international, fondé sur une pédagogie solide et l’apprentissage par la recherche." },
      { title: "Chaque enfant à son niveau", text: "Nous connaissons le niveau de chaque élève et utilisons des stratégies variées, pour que chaque enfant progresse." },
      { title: "Toujours progresser", text: "Nous évaluons et améliorons sans cesse le cadre d’apprentissage, les supports, le programme et l’équipe enseignante." },
    ],
  },
  ar: {
    lede: "ما نريده لكل طفل يدخل مدرستنا، والتزاماتنا الثلاثة لتحقيق ذلك.",
    visionTitle: "رؤيتنا",
    vision: [
      "أن نكون مدرسة دولية رائدة في تونس: مكانًا يرعى الأطفال ويحفّزهم، يجدون فيه الدعم والأمان إلى جانب التعليم.",
      "نعزّز الاحترام المتبادل والتنوّع، حتى يسلك كل طفل طريقه بالمهارات والقيم التي تقوده إلى مستقبل ناجح، ويصبح شخصًا يُحدث فرقًا في مجتمعه.",
    ],
    missionTitle: "رسالتنا",
    mission: [
      "أن نساعد المتعلّمين على أن يصبحوا مواطنين فاعلين ومبدعين ومثقّفين في العالم، بإلهامهم حبّ التعلّم مدى الحياة.",
      "نساعد كل تلميذ على بلوغ كامل إمكاناته واكتساب مهارات المواطن العالمي المسؤول وقائد الغد: شخص يحترم ثقافات العالم وتقاليده وبيئاته، ويساهم بنزاهة وخيال.",
    ],
    howTitle: "كيف نعمل لتحقيق ذلك",
    howLede: "ثلاثة التزامات تلتزم بها المدرسة.",
    how: [
      { title: "تعليم محوره الطفل", text: "تعليم يتمحور حول التلميذ وفق منهاج دولي، قائم على ممارسات تربوية سليمة والتعلّم بالاستقصاء." },
      { title: "كل طفل حسب مستواه", text: "نعرف مستوى كل تلميذ ونستعمل استراتيجيات تدريس متنوّعة، حتى يتقدّم كل طفل." },
      { title: "تحسين مستمر", text: "نقيّم باستمرار بيئة التعلّم والوسائل والمنهاج وفريق التدريس، ونطوّرها." },
    ],
  },
  tr: {
    lede: "Kapımızdan giren her çocuk için ne istediğimiz ve bizi oraya götüren üç taahhüdümüz.",
    visionTitle: "Vizyonumuz",
    vision: [
      "Tunus’ta öncü bir uluslararası okul olmak: çocukların eğitimin yanında destek ve güven de bulduğu, sevgi dolu ve teşvik edici bir yer.",
      "Karşılıklı saygıyı ve çeşitliliği destekliyoruz; böylece her çocuk, başarılı bir geleceğe götüren beceri ve değerlerle kendi yolunu izler ve toplumunda fark yaratan biri olur.",
    ],
    missionTitle: "Misyonumuz",
    mission: [
      "Öğrencilerin, ömür boyu süren bir öğrenme sevgisiyle dünyanın etkin, yaratıcı ve bilgili yurttaşları olmalarına yardım etmek.",
      "Her öğrencinin potansiyelini tam olarak ortaya koymasına ve sorumlu bir dünya yurttaşı, yarının bir lideri olacak becerileri kazanmasına yardım ediyoruz: dünyanın kültürlerine, geleneklerine ve çevrelerine saygı duyan, ilkeli ve yaratıcı biçimde katkı sunan biri.",
    ],
    howTitle: "Buna nasıl çalışıyoruz",
    howLede: "Okulun kendine koyduğu üç taahhüt.",
    how: [
      { title: "Çocuğu merkeze alan öğretim", text: "Uluslararası bir müfredatla, sağlam öğretim uygulamalarına ve sorgulayarak öğrenmeye dayanan, öğrenci merkezli öğretim." },
      { title: "Her çocuk kendi düzeyinde", text: "Her öğrencinin düzeyini biliyor ve çeşitli öğretim stratejileri kullanıyoruz; böylece her çocuk ilerliyor." },
      { title: "Sürekli gelişim", text: "Öğrenme ortamını, materyalleri, müfredatı ve öğretmen kadrosunu sürekli değerlendirip geliştiriyoruz." },
    ],
  },
};

const icons = [LightbulbIcon, SproutIcon, RefreshCwIcon];

export function MissionVisionPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="about/mission-vision"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="statements" tone="mist">
            <div className="grid gap-5 lg:grid-cols-12">
              <article className="plate flex flex-col gap-5 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised sm:p-10 lg:col-span-7">
                <h2 className="font-heading text-sm font-bold text-turquoise-plate">{c.visionTitle}</h2>
                <p className="font-heading text-2xl leading-snug font-bold text-balance sm:text-3xl">{c.vision[0]}</p>
                <p className="text-lg text-on-plate-muted">{c.vision[1]}</p>
              </article>
              <article className="flex flex-col gap-5 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70 sm:p-10 lg:col-span-5">
                <h2 className="font-heading text-sm font-bold text-turquoise-ink">{c.missionTitle}</h2>
                <p className="font-heading text-2xl leading-snug font-bold text-balance text-heading">{c.mission[0]}</p>
                <p className="text-lg text-slate">{c.mission[1]}</p>
              </article>
            </div>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
          <PageSection id="how" title={c.howTitle} lede={c.howLede}>
            <ul className="grid gap-5 md:grid-cols-3">
              {c.how.map((item, i) => {
                const Icon = icons[i] ?? LightbulbIcon;
                return (
                  <li key={item.title} className="flex flex-col gap-4 border-t-4 border-turquoise pt-6">
                    <Icon aria-hidden="true" className="size-8 text-turquoise-ink" strokeWidth={1.75} />
                    <h3 className="text-xl font-bold text-heading">{item.title}</h3>
                    <p className="text-slate">{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
