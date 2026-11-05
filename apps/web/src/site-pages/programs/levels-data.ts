import type { Locale } from "@maarif/contracts/locales";
import type { Level } from "@maarif/contracts/school";

// The four level pages, from the old site's Academic Curriculum page (the school's own pathway:
// Early Years, Primary, Lower Secondary, IGCSE, AS and A Levels; subjects, exams, languages)
// and the age table. Years follow the age table (Kindergarten, then Year 1 to Year 13); the
// old page's "Primary Years 2 to 6" and "Early Years 4 to 6" are its own inconsistencies.
// Campuses: owner, 2026-11-05. [PROPOSAL] Subject lists to confirm for this school year.

export const levelPages = ["kindergarten", "primary", "lower-secondary", "upper-secondary"] as const;
export type LevelPage = (typeof levelPages)[number];

export const levelMeta: Record<LevelPage, { line: Level; campus: "schools" | "highSchool"; years: [number | "kg", number | "kg"]; ages: [number, number]; stages: string[] }> = {
  kindergarten: { line: "kindergarten", campus: "schools", years: ["kg", "kg"], ages: [4, 5], stages: ["early-years"] },
  primary: { line: "primary", campus: "schools", years: [1, 6], ages: [5, 11], stages: ["primary"] },
  "lower-secondary": { line: "secondary", campus: "schools", years: [7, 9], ages: [11, 14], stages: ["lower-secondary"] },
  "upper-secondary": { line: "secondary", campus: "highSchool", years: [10, 13], ages: [14, 18], stages: ["igcse", "as-a-level"] },
};

type Area = { title: string; items: string[] };
export type LevelCopy = {
  lede: string;
  approach: string;
  areasTitle: string;
  areas: Area[];
  examsTitle?: string;
  exams?: { name: string; text: string }[];
};

type Words = { glance: { years: string; ages: string; campus: string; stage: string }; next: string; findGrade: string; pathway: string };

export const levelWords: Record<Locale, Words> = {
  en: { glance: { years: "Years", ages: "Ages", campus: "Campus", stage: "Cambridge stage" }, next: "Next on the route", findGrade: "Which grade for my child?", pathway: "See the whole Cambridge pathway" },
  fr: { glance: { years: "Années", ages: "Âges", campus: "Campus", stage: "Étape Cambridge" }, next: "La suite du parcours", findGrade: "Quelle classe pour mon enfant ?", pathway: "Voir tout le parcours Cambridge" },
  ar: { glance: { years: "السنوات", ages: "الأعمار", campus: "الفرع", stage: "مرحلة كامبريدج" }, next: "المحطة التالية", findGrade: "أيّ قسم لطفلي؟", pathway: "مسار كامبريدج كاملًا" },
  tr: { glance: { years: "Yıllar", ages: "Yaşlar", campus: "Kampüs", stage: "Cambridge aşaması" }, next: "Yolun devamı", findGrade: "Çocuğum hangi sınıfa?", pathway: "Cambridge yolunun tamamı" },
};

export const levelCopy: Record<Locale, Record<LevelPage, LevelCopy>> = {
  en: {
    kindergarten: {
      lede: "A safe, warm first step at ages 4 to 5, where children learn through active play.",
      approach: "Children learn by playing, exploring and doing, in English, with French, Arabic and Turkish around them every day.",
      areasTitle: "Six areas of learning",
      areas: [
        { title: "Personal and social", items: ["Social and personal learning", "Health and physical learning"] },
        { title: "Language and numbers", items: ["Language and communication", "Early mathematics"] },
        { title: "The world and creativity", items: ["Knowledge and understanding of the world", "Creative development"] },
      ],
    },
    primary: {
      lede: "Years 1 to 6, on a curriculum aligned with Cambridge Primary, built around three areas of study.",
      approach: "Lessons are taught in English; Arabic, French and Turkish are part of the timetable.",
      areasTitle: "Three areas of study",
      areas: [
        { title: "Environmental studies", items: ["Science", "Global Perspectives", "Geography", "History"] },
        { title: "Life skills", items: ["English", "Arabic", "French", "Turkish", "Mathematics", "Personal, social and health education"] },
        { title: "Expressive arts", items: ["Art and design", "Music and movement", "Physical education"] },
      ],
      examsTitle: "The exam at the end",
      exams: [{ name: "Cambridge Primary Checkpoint", text: "At the end of primary, an international check of English, mathematics and science." }],
    },
    "lower-secondary": {
      lede: "Years 7 to 9: the middle school years, up to the Cambridge Lower Secondary Checkpoint.",
      approach: "Separate sciences begin, languages continue, and clubs widen what children try.",
      areasTitle: "Subjects",
      areas: [
        { title: "Core", items: ["English as a second language", "Mathematics", "Biology", "Chemistry", "Physics"] },
        { title: "Languages and the world", items: ["Arabic", "French", "Turkish", "Global Perspectives"] },
        { title: "Arts, sport and technology", items: ["Art", "Music", "Physical education", "ICT", "Clubs"] },
      ],
      examsTitle: "The exam at the end",
      exams: [{ name: "Cambridge Lower Secondary Checkpoint", text: "In April of Year 9: English as a second language, mathematics and science. The required level opens the way to IGCSE." }],
    },
    "upper-secondary": {
      lede: "Years 10 to 13 at Charguia 2: Cambridge IGCSE, then AS and A Levels, and guidance towards university.",
      approach: "Students choose their subjects with their teachers, and the guidance team helps each one plan what comes after school.",
      areasTitle: "IGCSE subjects (Years 10 and 11)",
      areas: [
        { title: "Core", items: ["English as a second language", "Mathematics (Core or Extended)", "Biology", "Chemistry", "Physics"] },
        { title: "Languages and the world", items: ["Arabic", "French as a foreign language", "Global Perspectives"] },
        { title: "Options", items: ["Business", "ICT"] },
      ],
      examsTitle: "Exams on the way",
      exams: [
        { name: "Cambridge IGCSE", text: "At the end of Year 11, with Core or Extended papers by subject." },
        { name: "Cambridge AS Level", text: "In Year 12 students take four AS subjects; AS usually lasts one year." },
        { name: "Cambridge A Level", text: "A two-year course: in Year 13 a student may drop one subject with the High School Principal’s agreement." },
      ],
    },
  },
  fr: {
    kindergarten: {
      lede: "Un premier pas sûr et chaleureux, de 4 à 5 ans, où l’on apprend en jouant.",
      approach: "Les enfants apprennent en jouant, en explorant et en faisant, en anglais, avec le français, l’arabe et le turc autour d’eux chaque jour.",
      areasTitle: "Six domaines d’apprentissage",
      areas: [
        { title: "Personnel et social", items: ["Développement personnel et social", "Santé et motricité"] },
        { title: "Langage et nombres", items: ["Langage et communication", "Premières mathématiques"] },
        { title: "Le monde et la créativité", items: ["Découverte du monde", "Développement créatif"] },
      ],
    },
    primary: {
      lede: "Années 1 à 6, avec un programme aligné sur Cambridge Primary, autour de trois domaines.",
      approach: "Les cours sont donnés en anglais ; l’arabe, le français et le turc font partie de l’emploi du temps.",
      areasTitle: "Trois domaines d’étude",
      areas: [
        { title: "Études du milieu", items: ["Sciences", "Global Perspectives", "Géographie", "Histoire"] },
        { title: "Compétences de vie", items: ["Anglais", "Arabe", "Français", "Turc", "Mathématiques", "Éducation personnelle, sociale et à la santé"] },
        { title: "Arts", items: ["Arts plastiques", "Musique et mouvement", "Éducation physique"] },
      ],
      examsTitle: "L’examen de fin de cycle",
      exams: [{ name: "Cambridge Primary Checkpoint", text: "À la fin du primaire, une évaluation internationale en anglais, mathématiques et sciences." }],
    },
    "lower-secondary": {
      lede: "Années 7 à 9 : le collège, jusqu’au Cambridge Lower Secondary Checkpoint.",
      approach: "Les sciences se séparent, les langues continuent et les clubs élargissent ce que les enfants découvrent.",
      areasTitle: "Matières",
      areas: [
        { title: "Fondamentaux", items: ["Anglais langue seconde", "Mathématiques", "Biologie", "Chimie", "Physique"] },
        { title: "Langues et monde", items: ["Arabe", "Français", "Turc", "Global Perspectives"] },
        { title: "Arts, sport et technologie", items: ["Arts", "Musique", "Éducation physique", "Informatique", "Clubs"] },
      ],
      examsTitle: "L’examen de fin de cycle",
      exams: [{ name: "Cambridge Lower Secondary Checkpoint", text: "En avril de l’année 9 : anglais langue seconde, mathématiques et sciences. Le niveau requis ouvre la voie à l’IGCSE." }],
    },
    "upper-secondary": {
      lede: "Années 10 à 13 à Charguia 2 : Cambridge IGCSE, puis AS et A Levels, et l’orientation vers l’université.",
      approach: "Les élèves choisissent leurs matières avec leurs enseignants, et l’équipe d’orientation aide chacun à préparer la suite.",
      areasTitle: "Matières IGCSE (années 10 et 11)",
      areas: [
        { title: "Fondamentaux", items: ["Anglais langue seconde", "Mathématiques (Core ou Extended)", "Biologie", "Chimie", "Physique"] },
        { title: "Langues et monde", items: ["Arabe", "Français langue étrangère", "Global Perspectives"] },
        { title: "Options", items: ["Gestion (Business)", "Informatique"] },
      ],
      examsTitle: "Les examens du parcours",
      exams: [
        { name: "Cambridge IGCSE", text: "À la fin de l’année 11, avec des épreuves Core ou Extended selon la matière." },
        { name: "Cambridge AS Level", text: "En année 12, les élèves suivent quatre matières AS ; l’AS dure en général un an." },
        { name: "Cambridge A Level", text: "Un cursus de deux ans : en année 13, un élève peut abandonner une matière avec l’accord du directeur du lycée." },
      ],
    },
  },
  ar: {
    kindergarten: {
      lede: "خطوة أولى آمنة ودافئة من 4 إلى 5 سنوات، يتعلّم فيها الأطفال باللعب.",
      approach: "يتعلّم الأطفال باللعب والاستكشاف والممارسة، بالإنجليزية، مع الفرنسية والعربية والتركية من حولهم كل يوم.",
      areasTitle: "ستّة مجالات تعلّم",
      areas: [
        { title: "الشخصي والاجتماعي", items: ["التعلّم الشخصي والاجتماعي", "الصحة والحركة"] },
        { title: "اللغة والأعداد", items: ["اللغة والتواصل", "الرياضيات الأولى"] },
        { title: "العالم والإبداع", items: ["معرفة العالم وفهمه", "التنمية الإبداعية"] },
      ],
    },
    primary: {
      lede: "من سنة 1 إلى سنة 6، وفق منهاج متوافق مع Cambridge Primary، حول ثلاثة مجالات.",
      approach: "تُدرَّس الدروس بالإنجليزية، والعربية والفرنسية والتركية جزء من جدول الحصص.",
      areasTitle: "ثلاثة مجالات دراسية",
      areas: [
        { title: "دراسة المحيط", items: ["العلوم", "Global Perspectives", "الجغرافيا", "التاريخ"] },
        { title: "مهارات الحياة", items: ["الإنجليزية", "العربية", "الفرنسية", "التركية", "الرياضيات", "التربية الشخصية والاجتماعية والصحية"] },
        { title: "الفنون", items: ["الفنون التشكيلية", "الموسيقى والحركة", "التربية البدنية"] },
      ],
      examsTitle: "امتحان آخر المرحلة",
      exams: [{ name: "Cambridge Primary Checkpoint", text: "في آخر الابتدائي، تقييم دولي في الإنجليزية والرياضيات والعلوم." }],
    },
    "lower-secondary": {
      lede: "من سنة 7 إلى سنة 9: المرحلة الإعدادية حتى Cambridge Lower Secondary Checkpoint.",
      approach: "تنفصل العلوم، وتتواصل اللغات، وتوسّع النوادي ما يجرّبه الأطفال.",
      areasTitle: "المواد",
      areas: [
        { title: "الأساسيات", items: ["الإنجليزية لغة ثانية", "الرياضيات", "علم الأحياء", "الكيمياء", "الفيزياء"] },
        { title: "اللغات والعالم", items: ["العربية", "الفرنسية", "التركية", "Global Perspectives"] },
        { title: "الفنون والرياضة والتكنولوجيا", items: ["الفنون", "الموسيقى", "التربية البدنية", "الإعلامية", "النوادي"] },
      ],
      examsTitle: "امتحان آخر المرحلة",
      exams: [{ name: "Cambridge Lower Secondary Checkpoint", text: "في أفريل من سنة 9: الإنجليزية لغة ثانية والرياضيات والعلوم. المستوى المطلوب يفتح الطريق إلى IGCSE." }],
    },
    "upper-secondary": {
      lede: "من سنة 10 إلى سنة 13 في الشرقية 2: Cambridge IGCSE ثم AS و A Level، والتوجيه نحو الجامعة.",
      approach: "يختار التلاميذ موادهم مع أساتذتهم، ويساعد فريق التوجيه كل تلميذ على التخطيط لما بعد المدرسة.",
      areasTitle: "مواد IGCSE (سنة 10 وسنة 11)",
      areas: [
        { title: "الأساسيات", items: ["الإنجليزية لغة ثانية", "الرياضيات (Core أو Extended)", "علم الأحياء", "الكيمياء", "الفيزياء"] },
        { title: "اللغات والعالم", items: ["العربية", "الفرنسية لغة أجنبية", "Global Perspectives"] },
        { title: "مواد اختيارية", items: ["إدارة الأعمال", "الإعلامية"] },
      ],
      examsTitle: "امتحانات المسار",
      exams: [
        { name: "Cambridge IGCSE", text: "في آخر سنة 11، باختبارات Core أو Extended حسب المادة." },
        { name: "Cambridge AS Level", text: "في سنة 12 يدرس التلاميذ أربع مواد AS، ويدوم AS عادة سنة واحدة." },
        { name: "Cambridge A Level", text: "مسار من سنتين: في سنة 13 يمكن للتلميذ التخلّي عن مادة بموافقة مدير الثانوية." },
      ],
    },
  },
  tr: {
    kindergarten: {
      lede: "4-5 yaşta, çocukların oyunla öğrendiği güvenli ve sıcak bir ilk adım.",
      approach: "Çocuklar oynayarak, keşfederek ve yaparak öğrenir; İngilizce eğitimin yanında her gün Fransızca, Arapça ve Türkçe de çevrelerindedir.",
      areasTitle: "Altı öğrenme alanı",
      areas: [
        { title: "Kişisel ve sosyal", items: ["Kişisel ve sosyal öğrenme", "Sağlık ve beden gelişimi"] },
        { title: "Dil ve sayılar", items: ["Dil ve iletişim", "Erken matematik"] },
        { title: "Dünya ve yaratıcılık", items: ["Dünyayı tanıma ve anlama", "Yaratıcı gelişim"] },
      ],
    },
    primary: {
      lede: "Yıl 1-6, Cambridge Primary ile uyumlu, üç alan etrafında kurulmuş bir müfredat.",
      approach: "Dersler İngilizce işlenir; Arapça, Fransızca ve Türkçe ders programının parçasıdır.",
      areasTitle: "Üç çalışma alanı",
      areas: [
        { title: "Çevre çalışmaları", items: ["Fen", "Global Perspectives", "Coğrafya", "Tarih"] },
        { title: "Yaşam becerileri", items: ["İngilizce", "Arapça", "Fransızca", "Türkçe", "Matematik", "Kişisel, sosyal ve sağlık eğitimi"] },
        { title: "Sanat", items: ["Sanat ve tasarım", "Müzik ve hareket", "Beden eğitimi"] },
      ],
      examsTitle: "Dönem sonu sınavı",
      exams: [{ name: "Cambridge Primary Checkpoint", text: "İlkokulun sonunda İngilizce, matematik ve fende uluslararası bir değerlendirme." }],
    },
    "lower-secondary": {
      lede: "Yıl 7-9: Cambridge Lower Secondary Checkpoint’e kadar ortaokul yılları.",
      approach: "Fen dersleri ayrılır, diller sürer ve kulüpler çocukların denediklerini genişletir.",
      areasTitle: "Dersler",
      areas: [
        { title: "Temel", items: ["İkinci dil olarak İngilizce", "Matematik", "Biyoloji", "Kimya", "Fizik"] },
        { title: "Diller ve dünya", items: ["Arapça", "Fransızca", "Türkçe", "Global Perspectives"] },
        { title: "Sanat, spor ve teknoloji", items: ["Sanat", "Müzik", "Beden eğitimi", "Bilişim", "Kulüpler"] },
      ],
      examsTitle: "Dönem sonu sınavı",
      exams: [{ name: "Cambridge Lower Secondary Checkpoint", text: "Yıl 9’un nisan ayında: ikinci dil olarak İngilizce, matematik ve fen. Gereken düzey IGCSE’nin yolunu açar." }],
    },
    "upper-secondary": {
      lede: "Charguia 2’de Yıl 10-13: Cambridge IGCSE, ardından AS ve A Level ve üniversiteye rehberlik.",
      approach: "Öğrenciler derslerini öğretmenleriyle seçer; rehberlik ekibi her birinin okul sonrasını planlamasına yardım eder.",
      areasTitle: "IGCSE dersleri (Yıl 10 ve 11)",
      areas: [
        { title: "Temel", items: ["İkinci dil olarak İngilizce", "Matematik (Core ya da Extended)", "Biyoloji", "Kimya", "Fizik"] },
        { title: "Diller ve dünya", items: ["Arapça", "Yabancı dil olarak Fransızca", "Global Perspectives"] },
        { title: "Seçmeli", items: ["İşletme", "Bilişim"] },
      ],
      examsTitle: "Yoldaki sınavlar",
      exams: [
        { name: "Cambridge IGCSE", text: "Yıl 11’in sonunda, derse göre Core ya da Extended kâğıtlarla." },
        { name: "Cambridge AS Level", text: "Yıl 12’de öğrenciler dört AS dersi alır; AS genellikle bir yıl sürer." },
        { name: "Cambridge A Level", text: "İki yıllık bir program: Yıl 13’te öğrenci, lise müdürünün onayıyla bir dersi bırakabilir." },
      ],
    },
  },
};
