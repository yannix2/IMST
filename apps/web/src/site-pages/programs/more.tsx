import { BookOpenIcon, CalendarDaysIcon, ClipboardCheckIcon, CompassIcon, CpuIcon, FlaskConicalIcon, HandHelpingIcon, MessageCircleHeartIcon, PaletteIcon, UsersRoundIcon, BotIcon, GraduationCapIcon } from "lucide-react";
import { localeDirection, localeNativeName, locales, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { PageShell } from "@/components/site/page-shell";
import { DraftNote, PageSection } from "@/components/site/blocks";
import { aboutFigure, programsFigure } from "../figures";

// Three Programs pages from the school's own old pages, lightly edited:
//   languages        Philosophy (English as the language of teaching), Academic Curriculum
//                    (languages per stage), Teaching of Turkish Language (Foundation aims)
//   student-support  Student Support Programme pages (incl. Saturday 9.00 to 12.30) and
//                    Orientation Services
//   technology       product.md Positioning (science fair, computing, robotics club), Academic
//                    Curriculum (ICT), Philosophy (bright classrooms, clubs). The old pages on
//                    technology and learning spaces are Foundation boilerplate, so nothing
//                    about equipment is claimed. [PROPOSAL] All three to be approved.

type Item = { title: string; text: string };

// ---- Languages ---------------------------------------------------------------------------

const languages: Record<Locale, { lede: string; roles: Record<Locale, string>; stagesTitle: string; stages: Item[]; turkish: Item }> = {
  en: {
    lede: "English is the language of teaching. French, Arabic and Turkish are taught too, so children grow at ease in more than one language.",
    roles: { en: "The language of teaching, from Kindergarten to A Level", fr: "Taught from primary, through IGCSE as a foreign language", ar: "Taught at every stage, through IGCSE", tr: "Taught from primary, with clubs and activities" },
    stagesTitle: "Languages at each stage",
    stages: [
      { title: "Kindergarten", text: "Children hear and use English every day, with the other languages around them." },
      { title: "Primary", text: "English, Arabic, French and Turkish are all part of the timetable." },
      { title: "Lower secondary", text: "English as a second language, with Arabic, French and Turkish as modern languages." },
      { title: "Upper secondary", text: "English as a second language, Arabic and French as a foreign language at IGCSE." },
    ],
    turkish: { title: "Turkish with the Maarif Foundation", text: "Across its schools, the Türkiye Maarif Foundation aims for its high school graduates to reach level B2 in Turkish." },
  },
  fr: {
    lede: "L’anglais est la langue d’enseignement. Le français, l’arabe et le turc sont aussi enseignés : les enfants grandissent à l’aise dans plusieurs langues.",
    roles: { en: "La langue d’enseignement, de la maternelle aux A Levels", fr: "Enseigné dès le primaire, jusqu’à l’IGCSE en langue étrangère", ar: "Enseigné à chaque étape, jusqu’à l’IGCSE", tr: "Enseigné dès le primaire, avec clubs et activités" },
    stagesTitle: "Les langues à chaque étape",
    stages: [
      { title: "Maternelle", text: "Les enfants entendent et utilisent l’anglais chaque jour, avec les autres langues autour d’eux." },
      { title: "Primaire", text: "L’anglais, l’arabe, le français et le turc font tous partie de l’emploi du temps." },
      { title: "Collège", text: "L’anglais langue seconde, avec l’arabe, le français et le turc comme langues vivantes." },
      { title: "Lycée", text: "L’anglais langue seconde, l’arabe et le français langue étrangère à l’IGCSE." },
    ],
    turkish: { title: "Le turc avec la Fondation Maarif", text: "Dans ses écoles, la Fondation Maarif de Türkiye vise le niveau B2 en turc pour ses bacheliers." },
  },
  ar: {
    lede: "الإنجليزية لغة التدريس، وتُدرَّس أيضًا الفرنسية والعربية والتركية، فينشأ الأطفال مرتاحين في أكثر من لغة.",
    roles: { en: "لغة التدريس، من الروضة إلى A Level", fr: "تُدرَّس منذ الابتدائي حتى IGCSE لغةً أجنبية", ar: "تُدرَّس في كل المراحل حتى IGCSE", tr: "تُدرَّس منذ الابتدائي، مع النوادي والأنشطة" },
    stagesTitle: "اللغات في كل مرحلة",
    stages: [
      { title: "الروضة", text: "يسمع الأطفال الإنجليزية ويستعملونها كل يوم، مع اللغات الأخرى من حولهم." },
      { title: "الابتدائي", text: "الإنجليزية والعربية والفرنسية والتركية كلّها في جدول الحصص." },
      { title: "الإعدادي", text: "الإنجليزية لغة ثانية، مع العربية والفرنسية والتركية لغاتٍ حيّة." },
      { title: "الثانوي", text: "الإنجليزية لغة ثانية، والعربية والفرنسية لغة أجنبية في IGCSE." },
    ],
    turkish: { title: "التركية مع وقف المعارف", text: "يهدف وقف المعارف التركي في مدارسه إلى أن يبلغ خرّيجو الثانوي المستوى B2 في التركية." },
  },
  tr: {
    lede: "Öğretim dili İngilizcedir. Fransızca, Arapça ve Türkçe de öğretilir; çocuklar birden çok dilde rahat büyür.",
    roles: { en: "Anaokulundan A Level’a öğretim dili", fr: "İlkokuldan itibaren, IGCSE’de yabancı dil olarak", ar: "Her aşamada, IGCSE’ye kadar", tr: "İlkokuldan itibaren, kulüp ve etkinliklerle" },
    stagesTitle: "Her aşamada diller",
    stages: [
      { title: "Anaokulu", text: "Çocuklar her gün İngilizce duyar ve kullanır; diğer diller de çevrelerindedir." },
      { title: "İlkokul", text: "İngilizce, Arapça, Fransızca ve Türkçe ders programının parçasıdır." },
      { title: "Ortaokul", text: "İkinci dil olarak İngilizce; Arapça, Fransızca ve Türkçe yabancı diller olarak." },
      { title: "Lise", text: "İkinci dil olarak İngilizce; IGCSE’de Arapça ve yabancı dil olarak Fransızca." },
    ],
    turkish: { title: "Maarif Vakfı ile Türkçe", text: "Türkiye Maarif Vakfı, okullarında lise mezunlarının Türkçede B2 düzeyine ulaşmasını hedefler." },
  },
};

export function LanguagesPage({ locale }: { locale: Locale }) {
  const c = languages[locale];
  return (
    <PageShell
      locale={locale}
      page="programs/languages"
      lede={c.lede}
      figure={aboutFigure(locale)}
      body={
        <>
          <PageSection id="four" tone="mist">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {locales.map((code, i) => (
                <li
                  key={code}
                  className={i === 0 ? "plate flex flex-col gap-4 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised" : "flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70"}
                >
                  <span lang={code} dir={localeDirection[code]} className={i === 0 ? "font-heading text-4xl font-bold" : "font-heading text-4xl font-bold text-heading"}>
                    {localeNativeName[code]}
                  </span>
                  <span className={i === 0 ? "text-on-plate-muted" : "text-slate"}>{c.roles[code]}</span>
                </li>
              ))}
            </ul>
          </PageSection>
          <PageSection id="stages" title={c.stagesTitle}>
            <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {c.stages.map((s) => (
                <li key={s.title} className="flex flex-col gap-2 border-t-4 border-turquoise pt-5">
                  <h3 className="text-xl font-bold text-heading">{s.title}</h3>
                  <p className="text-slate">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 rounded-[var(--radius-plate)] bg-mist p-7 sm:p-9">
              <h3 className="text-xl font-bold text-heading">{c.turkish.title}</h3>
              <p className="mt-2 max-w-[60ch] text-lg text-slate">{c.turkish.text}</p>
            </div>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
        </>
      }
    />
  );
}

// ---- Student support ---------------------------------------------------------------------

const support: Record<Locale, { lede: string; howTitle: string; how: Item[]; formsTitle: string; forms: Item[]; guidanceTitle: string; guidance: Item[] }> = {
  en: {
    lede: "Some children need more time with a subject; every student needs advice about what comes next. Both are part of school life here.",
    howTitle: "How support starts",
    how: [
      { title: "A clear starting point", text: "At enrolment, a written placement test and an individual evaluation set each child’s level. Parents are told if a level changes." },
      { title: "Teachers notice", text: "Teachers spot difficulties from tests, grades and reports; the school counsellor adds their view." },
      { title: "One person follows it", text: "The support programme is planned by the school’s leadership and followed by a support coordinator." },
    ],
    formsTitle: "Forms of support",
    forms: [
      { title: "Saturday programme", text: "Saturdays from 9.00 to 12.30." },
      { title: "During the school day", text: "Changes to the timetable when a child needs more time with a subject." },
      { title: "A teaching assistant", text: "Extra help in the core subjects." },
      { title: "Parents in the loop", text: "Information and advice for parents, and written reports that are followed up." },
      { title: "Clubs", text: "Clubs that build confidence and interests." },
    ],
    guidanceTitle: "Guidance for what comes next",
    guidance: [
      { title: "Strengths and goals", text: "A guidance team helps each student discover their strengths, interests and goals." },
      { title: "University choices", text: "Near graduation, personal counselling to explore universities in Tunisia and abroad." },
      { title: "Universities in Türkiye", text: "Through the Maarif network, advice and contacts for universities in Türkiye." },
    ],
  },
  fr: {
    lede: "Certains enfants ont besoin de plus de temps dans une matière ; chaque élève a besoin de conseils pour la suite. Les deux font partie de la vie de l’école.",
    howTitle: "Comment l’accompagnement commence",
    how: [
      { title: "Un point de départ clair", text: "À l’inscription, un test de placement écrit et une évaluation individuelle fixent le niveau de chaque enfant. Les parents sont informés de tout changement." },
      { title: "Les enseignants repèrent", text: "Les enseignants repèrent les difficultés à partir des tests, des notes et des rapports ; le conseiller scolaire donne son avis." },
      { title: "Une personne assure le suivi", text: "Le programme est planifié par la direction et suivi par un coordinateur de l’accompagnement." },
    ],
    formsTitle: "Les formes d’accompagnement",
    forms: [
      { title: "Programme du samedi", text: "Le samedi de 9 h à 12 h 30." },
      { title: "Pendant la journée", text: "Un emploi du temps adapté quand un enfant a besoin de plus de temps dans une matière." },
      { title: "Un assistant d’enseignement", text: "Une aide supplémentaire dans les matières principales." },
      { title: "Les parents informés", text: "Information et conseils pour les parents, et des rapports écrits suivis." },
      { title: "Les clubs", text: "Des clubs qui développent la confiance et les centres d’intérêt." },
    ],
    guidanceTitle: "L’orientation pour la suite",
    guidance: [
      { title: "Forces et objectifs", text: "Une équipe d’orientation aide chaque élève à découvrir ses forces, ses intérêts et ses objectifs." },
      { title: "Le choix de l’université", text: "À l’approche du diplôme, un conseil personnalisé pour explorer les universités en Tunisie et à l’étranger." },
      { title: "Les universités de Türkiye", text: "Grâce au réseau Maarif, des conseils et des contacts pour les universités de Türkiye." },
    ],
  },
  ar: {
    lede: "يحتاج بعض الأطفال إلى وقت أطول مع مادة ما، ويحتاج كل تلميذ إلى نصيحة لما بعد. والأمران جزء من الحياة المدرسية هنا.",
    howTitle: "كيف تبدأ المرافقة",
    how: [
      { title: "نقطة انطلاق واضحة", text: "عند التسجيل، يحدّد اختبار تموضع كتابي وتقييم فردي مستوى كل طفل، ويُعلَم الأولياء بأي تغيير." },
      { title: "الأساتذة يلاحظون", text: "يلاحظ الأساتذة الصعوبات من الاختبارات والأعداد والتقارير، ويضيف المرشد المدرسي رأيه." },
      { title: "شخص واحد يتابع", text: "تخطّط إدارة المدرسة لبرنامج المرافقة ويتابعه منسّق خاص." },
    ],
    formsTitle: "أشكال المرافقة",
    forms: [
      { title: "برنامج السبت", text: "أيّام السبت من 9:00 إلى 12:30." },
      { title: "خلال اليوم الدراسي", text: "تعديل الجدول حين يحتاج الطفل إلى وقت أطول مع مادة." },
      { title: "مساعد تدريس", text: "مساعدة إضافية في المواد الأساسية." },
      { title: "الأولياء على اطّلاع", text: "معلومات ونصائح للأولياء، وتقارير مكتوبة تُتابَع." },
      { title: "النوادي", text: "نوادٍ تبني الثقة والاهتمامات." },
    ],
    guidanceTitle: "التوجيه لما بعد المدرسة",
    guidance: [
      { title: "نقاط القوة والأهداف", text: "يساعد فريق التوجيه كل تلميذ على اكتشاف نقاط قوّته واهتماماته وأهدافه." },
      { title: "اختيار الجامعة", text: "قرب التخرّج، إرشاد شخصي لاستكشاف الجامعات في تونس وخارجها." },
      { title: "جامعات تركيا", text: "عبر شبكة المعارف، نصائح وصلات مع جامعات في تركيا." },
    ],
  },
  tr: {
    lede: "Bazı çocukların bir derste daha fazla zamana ihtiyacı olur; her öğrencinin de sonrası için rehberliğe. İkisi de buradaki okul yaşamının parçası.",
    howTitle: "Destek nasıl başlar",
    how: [
      { title: "Net bir başlangıç", text: "Kayıtta yazılı bir seviye sınavı ve bireysel değerlendirme her çocuğun düzeyini belirler. Düzey değişirse veliler bilgilendirilir." },
      { title: "Öğretmenler fark eder", text: "Öğretmenler zorlukları sınavlardan, notlardan ve raporlardan fark eder; rehber öğretmen de görüşünü ekler." },
      { title: "Bir kişi izler", text: "Destek programını okul yönetimi planlar ve bir destek koordinatörü izler." },
    ],
    formsTitle: "Destek biçimleri",
    forms: [
      { title: "Cumartesi programı", text: "Cumartesi 9.00-12.30." },
      { title: "Okul günü içinde", text: "Bir çocuğun bir derste daha fazla zamana ihtiyacı olduğunda ders programında düzenleme." },
      { title: "Öğretmen yardımcısı", text: "Temel derslerde ek destek." },
      { title: "Veliler bilgide", text: "Velilere bilgi ve öneriler, izlenen yazılı raporlar." },
      { title: "Kulüpler", text: "Özgüveni ve ilgi alanlarını geliştiren kulüpler." },
    ],
    guidanceTitle: "Sonrası için rehberlik",
    guidance: [
      { title: "Güçlü yönler ve hedefler", text: "Rehberlik ekibi her öğrencinin güçlü yönlerini, ilgilerini ve hedeflerini keşfetmesine yardım eder." },
      { title: "Üniversite seçimi", text: "Mezuniyete doğru, Tunus’ta ve yurt dışında üniversiteleri keşfetmek için kişisel danışmanlık." },
      { title: "Türkiye’de üniversiteler", text: "Maarif ağı aracılığıyla Türkiye’deki üniversiteler için öneriler ve bağlantılar." },
    ],
  },
};

export function StudentSupportPage({ locale }: { locale: Locale }) {
  const c = support[locale];
  const howIcons = [ClipboardCheckIcon, UsersRoundIcon, HandHelpingIcon];
  const formIcons = [CalendarDaysIcon, BookOpenIcon, HandHelpingIcon, MessageCircleHeartIcon, PaletteIcon];
  const guideIcons = [CompassIcon, GraduationCapIcon, GraduationCapIcon];
  const cards = (items: Item[], icons: typeof howIcons) =>
    items.map((s, i) => {
      const Icon = icons[i] ?? BookOpenIcon;
      return (
        <li key={s.title} className="flex flex-col gap-3 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70">
          <Icon aria-hidden="true" className="size-7 text-turquoise-ink" strokeWidth={1.75} />
          <h3 className="text-lg font-bold text-heading">{s.title}</h3>
          <p className="text-slate">{s.text}</p>
        </li>
      );
    });
  return (
    <PageShell
      locale={locale}
      page="programs/student-support"
      lede={c.lede}
      figure={programsFigure(locale)}
      body={
        <>
          <PageSection id="how" tone="mist" title={c.howTitle}>
            <ul className="grid gap-5 md:grid-cols-3">{cards(c.how, howIcons)}</ul>
          </PageSection>
          <PageSection id="forms" title={c.formsTitle}>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{cards(c.forms, formIcons)}</ul>
          </PageSection>
          <PageSection id="guidance" tone="mist" title={c.guidanceTitle}>
            <ul className="grid gap-5 md:grid-cols-3">{cards(c.guidance, guideIcons)}</ul>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
        </>
      }
    />
  );
}

// ---- Technology and learning spaces ------------------------------------------------------

const tech: Record<Locale, { lede: string; doTitle: string; does: Item[]; spacesTitle: string; spaces: string; robotLabel: string }> = {
  en: {
    lede: "Hands-on projects in science, computing and robotics, in bright classrooms made for learning by doing.",
    doTitle: "What children do",
    does: [
      { title: "Science fair", text: "Students plan, build and present their own science projects to the school." },
      { title: "Computing", text: "ICT is taught from lower secondary, and is an IGCSE option in upper secondary." },
      { title: "Robotics club", text: "Children design, build and program robots together." },
    ],
    spacesTitle: "Where they learn",
    spaces: "The school’s buildings are spacious, with bright, colourful classrooms and a variety of clubs and activities that follow children’s interests.",
    robotLabel: "A small robot arm on a work plate. It turns to follow the pointer and lowers its gripper.",
  },
  fr: {
    lede: "Des projets concrets en sciences, informatique et robotique, dans des salles lumineuses faites pour apprendre en faisant.",
    doTitle: "Ce que font les enfants",
    does: [
      { title: "Foire scientifique", text: "Les élèves préparent, construisent et présentent leurs propres projets scientifiques à l’école." },
      { title: "Informatique", text: "L’informatique est enseignée dès le collège et proposée en option à l’IGCSE au lycée." },
      { title: "Club de robotique", text: "Les enfants conçoivent, construisent et programment des robots ensemble." },
    ],
    spacesTitle: "Où ils apprennent",
    spaces: "Les bâtiments de l’école sont spacieux, avec des salles lumineuses et colorées et de nombreux clubs et activités qui suivent les centres d’intérêt des enfants.",
    robotLabel: "Un petit bras robotique sur un plateau. Il suit le pointeur et abaisse sa pince.",
  },
  ar: {
    lede: "مشاريع عملية في العلوم والإعلامية والروبوتيك، في قاعات مضيئة صُمّمت للتعلّم بالممارسة.",
    doTitle: "ما يقوم به الأطفال",
    does: [
      { title: "معرض العلوم", text: "يخطّط التلاميذ مشاريعهم العلمية ويبنونها ويعرضونها أمام المدرسة." },
      { title: "الإعلامية", text: "تُدرَّس الإعلامية منذ الإعدادي، وهي مادة اختيارية في IGCSE بالثانوي." },
      { title: "نادي الروبوتيك", text: "يصمّم الأطفال الروبوتات ويبنونها ويبرمجونها معًا." },
    ],
    spacesTitle: "أين يتعلّمون",
    spaces: "مباني المدرسة فسيحة، بقاعات مضيئة وملوّنة، ونوادٍ وأنشطة متنوّعة تتبع اهتمامات الأطفال.",
    robotLabel: "ذراع روبوت صغيرة على لوح عمل، تتبع المؤشر وتُنزل ملقطها.",
  },
  tr: {
    lede: "Yaparak öğrenmek için tasarlanmış aydınlık sınıflarda fen, bilişim ve robotik projeleri.",
    doTitle: "Çocuklar neler yapıyor",
    does: [
      { title: "Bilim fuarı", text: "Öğrenciler kendi bilim projelerini planlar, kurar ve okula sunar." },
      { title: "Bilişim", text: "Bilişim ortaokuldan itibaren öğretilir ve lisede IGCSE seçmeli dersidir." },
      { title: "Robotik kulübü", text: "Çocuklar birlikte robot tasarlar, kurar ve programlar." },
    ],
    spacesTitle: "Nerede öğreniyorlar",
    spaces: "Okulun binaları geniştir; aydınlık, renkli sınıflar ve çocukların ilgilerini izleyen çeşitli kulüp ve etkinlikler vardır.",
    robotLabel: "Bir çalışma tablasında küçük bir robot kol. İmleci izler ve kıskacını indirir.",
  },
};

export function TechnologyPage({ locale }: { locale: Locale }) {
  const c = tech[locale];
  const icons = [FlaskConicalIcon, CpuIcon, BotIcon];
  return (
    <PageShell
      locale={locale}
      page="programs/technology"
      lede={c.lede}
      figure={{ name: "robot", label: c.robotLabel }}
      body={
        <>
          <PageSection id="does" tone="mist" title={c.doTitle}>
            <ul className="grid gap-5 md:grid-cols-3">
              {c.does.map((d, i) => {
                const Icon = icons[i] ?? CpuIcon;
                return (
                  <li key={d.title} className="plate flex flex-col gap-4 rounded-[var(--radius-plate)] bg-navy p-7 text-white shadow-raised">
                    <span aria-hidden="true" className="grid size-14 place-items-center rounded-[var(--radius-tile)] bg-turquoise text-night">
                      <Icon className="size-7" strokeWidth={1.75} />
                    </span>
                    <h3 className="text-xl font-bold">{d.title}</h3>
                    <p className="text-on-plate-muted">{d.text}</p>
                  </li>
                );
              })}
            </ul>
          </PageSection>
          <PageSection id="spaces" title={c.spacesTitle}>
            <p className="max-w-[60ch] text-xl text-ink">{c.spaces}</p>
            <p className="mt-4 text-slate">{messages[locale].reasons.items[3]?.text}</p>
            <DraftNote>{pageNames[locale].ui.toApprove}</DraftNote>
          </PageSection>
        </>
      }
    />
  );
}

export const descriptions = {
  languages: (locale: Locale) => languages[locale].lede,
  support: (locale: Locale) => support[locale].lede,
  technology: (locale: Locale) => tech[locale].lede,
};
