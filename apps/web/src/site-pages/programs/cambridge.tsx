import { BrainIcon, GlobeIcon, LanguagesIcon, MessagesSquareIcon, RouteIcon, SearchIcon, UsersRoundIcon, CompassIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { CambridgeCentre } from "@/components/site/cambridge-centre";
import { CambridgeStairs } from "@/components/site/cambridge-stairs";
import { programsFigure } from "../figures";

// The Cambridge pathway (owner decision 2026-11-05: show the pathway now, the centre number
// once entered). Sources: the old Academic Curriculum page (what the curriculum gives, the
// stages and exams) and Learning Outcomes page (the school's five learner profiles).

type Copy = {
  lede: string;
  stairTitle: string;
  stairLede: string;
  givesTitle: string;
  gives: { title: string; text: string }[];
  profilesTitle: string;
  profilesLede: string;
  profiles: { title: string; text: string }[];
};

const copy: Record<Locale, Copy> = {
  en: {
    lede: "The Cambridge International curriculum takes children step by step from Kindergarten to A Level, with international exams along the way.",
    stairTitle: "Year by year",
    stairLede: "Fourteen steps from Kindergarten to Year 13. Open a step to see its stage, its campus and the exam taken that year.",
    givesTitle: "What the curriculum gives children",
    gives: [
      { title: "Deep subject knowledge", text: "Strong foundations in English, mathematics and science, and real understanding of ideas, not just facts." },
      { title: "Thinking skills", text: "Higher-order thinking: questioning, reasoning and solving problems." },
      { title: "A spiral path", text: "Each stage builds on the one before, from age 5 to 19, so nothing is learned twice or skipped." },
      { title: "Many languages", text: "Taught in English, with French, Arabic and Turkish as part of school life." },
      { title: "Recognised worldwide", text: "Cambridge qualifications are accepted by universities around the world." },
    ],
    profilesTitle: "The learners we want to see",
    profilesLede: "Five profiles from the school’s own learning outcomes.",
    profiles: [
      { title: "Critical thinkers", text: "Research and weigh information from many sources, decide, and reflect on the result." },
      { title: "Effective communicators", text: "Speak, read and write fluently in English, learn French, Arabic and Turkish, and back opinions with evidence." },
      { title: "Independent learners", text: "Show initiative and self-discipline, accept mistakes and ask for help when needed." },
      { title: "Collaborative workers", text: "Take different roles in a group and solve problems together through clear communication." },
      { title: "Global citizens", text: "Care about the planet, respect other cultures and act for change, locally and globally." },
    ],
  },
  fr: {
    lede: "Le programme Cambridge International mène les enfants pas à pas de la maternelle aux A Levels, avec des examens internationaux en chemin.",
    stairTitle: "Année après année",
    stairLede: "Quatorze marches de la maternelle à l’année 13. Ouvrez une marche pour voir son étape, son campus et l’examen de l’année.",
    givesTitle: "Ce que le programme apporte aux enfants",
    gives: [
      { title: "Des connaissances solides", text: "De bonnes bases en anglais, mathématiques et sciences, et une vraie compréhension des notions." },
      { title: "Apprendre à penser", text: "Questionner, raisonner et résoudre des problèmes." },
      { title: "Un parcours en spirale", text: "Chaque étape s’appuie sur la précédente, de 5 à 19 ans : rien n’est appris deux fois ni oublié." },
      { title: "Plusieurs langues", text: "Un enseignement en anglais, avec le français, l’arabe et le turc dans la vie de l’école." },
      { title: "Reconnu dans le monde", text: "Les diplômes Cambridge sont acceptés par les universités du monde entier." },
    ],
    profilesTitle: "Les élèves que nous voulons former",
    profilesLede: "Cinq profils tirés des objectifs d’apprentissage de l’école.",
    profiles: [
      { title: "Esprits critiques", text: "Chercher et évaluer l’information de sources variées, décider et réfléchir au résultat." },
      { title: "Bons communicants", text: "Parler, lire et écrire couramment l’anglais, apprendre le français, l’arabe et le turc, et étayer ses opinions." },
      { title: "Élèves autonomes", text: "Prendre des initiatives, être discipliné, accepter ses erreurs et demander de l’aide." },
      { title: "Esprit d’équipe", text: "Tenir différents rôles dans un groupe et résoudre les problèmes ensemble." },
      { title: "Citoyens du monde", text: "Prendre soin de la planète, respecter les autres cultures et agir, ici et ailleurs." },
    ],
  },
  ar: {
    lede: "يأخذ منهاج Cambridge International الأطفال خطوة بخطوة من الروضة إلى A Level، مع امتحانات دولية على الطريق.",
    stairTitle: "سنة بسنة",
    stairLede: "أربع عشرة درجة من الروضة إلى سنة 13. افتحوا درجة لتروا مرحلتها وفرعها وامتحان تلك السنة.",
    givesTitle: "ما يمنحه المنهاج للأطفال",
    gives: [
      { title: "معرفة عميقة بالمواد", text: "أسس متينة في الإنجليزية والرياضيات والعلوم، وفهم حقيقي للأفكار." },
      { title: "مهارات التفكير", text: "التساؤل والاستدلال وحلّ المشكلات." },
      { title: "مسار حلزوني", text: "تبني كل مرحلة على سابقتها من 5 إلى 19 سنة، فلا يُكرَّر شيء ولا يُترك." },
      { title: "لغات عديدة", text: "التدريس بالإنجليزية، والفرنسية والعربية والتركية جزء من الحياة المدرسية." },
      { title: "اعتراف عالمي", text: "شهادات كامبريدج مقبولة لدى الجامعات في العالم." },
    ],
    profilesTitle: "المتعلّمون الذين نريدهم",
    profilesLede: "خمس صفات من أهداف التعلّم الخاصة بالمدرسة.",
    profiles: [
      { title: "مفكّرون ناقدون", text: "يبحثون عن المعلومة من مصادر عديدة ويقيّمونها ويقرّرون ويتأمّلون النتيجة." },
      { title: "متواصلون فاعلون", text: "يتكلّمون الإنجليزية ويقرؤونها ويكتبونها بطلاقة، ويتعلّمون الفرنسية والعربية والتركية، ويدعمون آراءهم بالحجّة." },
      { title: "متعلّمون مستقلّون", text: "يبادرون وينضبطون، ويتقبّلون الخطأ ويطلبون المساعدة عند الحاجة." },
      { title: "عاملون متعاونون", text: "يتولّون أدوارًا مختلفة في المجموعة ويحلّون المشكلات معًا." },
      { title: "مواطنون في العالم", text: "يهتمّون بالكوكب ويحترمون الثقافات الأخرى ويعملون من أجل التغيير." },
    ],
  },
  tr: {
    lede: "Cambridge International müfredatı çocukları anaokulundan A Level’a adım adım götürür; yol boyunca uluslararası sınavlar vardır.",
    stairTitle: "Yıl yıl",
    stairLede: "Anaokulundan Yıl 13’e on dört basamak. Aşamasını, kampüsünü ve o yılın sınavını görmek için bir basamak açın.",
    givesTitle: "Müfredatın çocuklara kazandırdıkları",
    gives: [
      { title: "Derin konu bilgisi", text: "İngilizce, matematik ve fende sağlam temeller ve kavramları gerçekten anlamak." },
      { title: "Düşünme becerileri", text: "Sorgulamak, akıl yürütmek ve problem çözmek." },
      { title: "Sarmal bir yol", text: "Her aşama bir öncekinin üzerine kurulur, 5’ten 19 yaşa: hiçbir şey iki kez öğrenilmez ya da atlanmaz." },
      { title: "Birçok dil", text: "Öğretim İngilizce; Fransızca, Arapça ve Türkçe okul yaşamının parçası." },
      { title: "Dünyada tanınır", text: "Cambridge belgeleri dünyanın dört bir yanındaki üniversitelerce kabul edilir." },
    ],
    profilesTitle: "Yetiştirmek istediğimiz öğrenciler",
    profilesLede: "Okulun kendi öğrenme çıktılarından beş profil.",
    profiles: [
      { title: "Eleştirel düşünenler", text: "Bilgiyi pek çok kaynaktan araştırıp değerlendirir, karar verir ve sonucu düşünür." },
      { title: "Etkili iletişim kuranlar", text: "İngilizceyi akıcı konuşur, okur ve yazar; Fransızca, Arapça ve Türkçe öğrenir; görüşlerini kanıtla destekler." },
      { title: "Bağımsız öğrenenler", text: "İnisiyatif alır, öz disiplin gösterir, hatayı kabul eder ve gerektiğinde yardım ister." },
      { title: "İş birliği yapanlar", text: "Grupta farklı roller üstlenir ve sorunları birlikte çözer." },
      { title: "Dünya yurttaşları", text: "Gezegeni önemser, diğer kültürlere saygı duyar ve değişim için harekete geçer." },
    ],
  },
};

const givesIcons = [BrainIcon, SearchIcon, RouteIcon, LanguagesIcon, GlobeIcon];
const profileIcons = [SearchIcon, MessagesSquareIcon, CompassIcon, UsersRoundIcon, GlobeIcon];

export function CambridgePage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <PageShell
      locale={locale}
      page="programs/cambridge"
      lede={c.lede}
      figure={programsFigure(locale)}
      body={
        <>
          <PageSection id="stairs" title={c.stairTitle} lede={c.stairLede}>
            <CambridgeStairs locale={locale} />
            <div className="mt-6">
              <CambridgeCentre locale={locale} />
            </div>
          </PageSection>
          <PageSection id="gives" tone="mist" title={c.givesTitle}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {c.gives.map((g, i) => {
                const Icon = givesIcons[i] ?? BrainIcon;
                return (
                  <li key={g.title} className="flex flex-col gap-3 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70">
                    <Icon aria-hidden="true" className="size-7 text-turquoise-ink" strokeWidth={1.75} />
                    <h3 className="text-lg font-bold text-heading">{g.title}</h3>
                    <p className="text-slate">{g.text}</p>
                  </li>
                );
              })}
            </ul>
          </PageSection>
          <PageSection id="profiles" title={c.profilesTitle} lede={c.profilesLede}>
            <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {c.profiles.map((pr, i) => {
                const Icon = profileIcons[i] ?? SearchIcon;
                return (
                  <li key={pr.title} className="flex gap-4">
                    <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-navy text-white">
                      <Icon className="size-6" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block text-lg font-bold text-heading">{pr.title}</span>
                      <span className="mt-1 block text-slate">{pr.text}</span>
                    </span>
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
