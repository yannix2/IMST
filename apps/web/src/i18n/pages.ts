import type { Locale } from "@maarif/contracts/locales";
import type { AreaKey, PageKey } from "@/lib/navigation";

// Names of the menu areas and pages, with the one-line description shown in menus, cards and
// search results. English is the source; FR, AR and TR are drafts for native-speaker review.

type PageName = { title: string; blurb: string };

export type PageNames = {
  areas: Record<AreaKey, string>;
  pages: Record<PageKey, PageName>;
  ui: {
    home: string;
    breadcrumb: string;
    menuOf: (area: string) => string;
    overview: string;
    inThisSection: string;
    social: string;
    followUs: string;
    contactUs: string;
    whatsappAbout: (topic: string) => string;
    back: string;
    toApprove: string;
  };
};

const en: PageNames = {
  areas: {
    about: "About",
    programs: "Programs",
    admissions: "Admissions",
    "campus-life": "Campus life",
    parents: "Parents",
    careers: "Careers",
    contact: "Contact",
  },
  pages: {
    about: { title: "About the school", blurb: "Who we are, what we believe and how the school works." },
    "about/mission-vision": { title: "Mission and vision", blurb: "What we want for every child, and how we work towards it." },
    "about/welcome": { title: "Welcome message", blurb: "A word from the head of school." },
    "about/leadership": { title: "Leadership and staff", blurb: "The people who lead the school." },
    "about/accreditations": { title: "Accreditations", blurb: "Cambridge, the Tunisian Ministry of Education and the Maarif network." },
    "about/child-protection": { title: "Child protection", blurb: "How we keep every child safe at school." },
    programs: { title: "Programs", blurb: "Kindergarten to Year 13 on one route, in four languages." },
    "programs/kindergarten": { title: "Kindergarten", blurb: "Ages 4 to 5: a safe, warm first step." },
    "programs/primary": { title: "Primary", blurb: "Years 1 to 6, aligned with Cambridge Primary." },
    "programs/lower-secondary": { title: "Lower secondary", blurb: "Years 7 to 9, up to the Cambridge Checkpoint." },
    "programs/upper-secondary": { title: "Upper secondary", blurb: "Years 10 to 13: IGCSE, then AS and A Levels." },
    "programs/cambridge": { title: "The Cambridge pathway", blurb: "Every stage and exam from age 4 to 18, step by step." },
    "programs/languages": { title: "Four languages", blurb: "English, French, Arabic and Turkish in school life." },
    "programs/student-support": { title: "Student support", blurb: "Help for each child, and guidance for what comes next." },
    "programs/technology": { title: "Technology and learning spaces", blurb: "Computing, robotics and the rooms where children learn." },
    admissions: { title: "Admissions", blurb: "How to join the school, in four steps." },
    "admissions/ages": { title: "Ages and grades", blurb: "Which grade your child joins, from the birth year." },
    "admissions/visit": { title: "Book a visit", blurb: "Choose a day; we call you to confirm." },
    "admissions/pre-register": { title: "Pre-register", blurb: "Tell us about your child in a few minutes." },
    "admissions/faq": { title: "Questions from parents", blurb: "Answers to what families ask most." },
    "admissions/bus-canteen": { title: "Bus and canteen", blurb: "School transport and this week’s menu." },
    "admissions/fees": { title: "Fees", blurb: "Ask us for the fees for your child’s grade." },
    contact: { title: "Contact", blurb: "Both campuses, phones, WhatsApp and email." },
  },
  ui: {
    home: "Home",
    breadcrumb: "You are here",
    menuOf: (area) => `${area} pages`,
    overview: "Overview",
    inThisSection: "In this section",
    social: "Social media",
    followUs: "Follow the school",
    contactUs: "Contact us",
    whatsappAbout: (topic) => `Hello, I have a question about: ${topic}.`,
    back: "Back",
    toApprove: "Text to be approved by the administration.",
  },
};

const fr: PageNames = {
  areas: {
    about: "L’école",
    programs: "Programmes",
    admissions: "Admissions",
    "campus-life": "Vie scolaire",
    parents: "Parents",
    careers: "Carrières",
    contact: "Contact",
  },
  pages: {
    about: { title: "À propos de l’école", blurb: "Qui nous sommes, ce que nous croyons et comment l’école fonctionne." },
    "about/mission-vision": { title: "Mission et vision", blurb: "Ce que nous voulons pour chaque enfant, et comment nous y travaillons." },
    "about/welcome": { title: "Mot de bienvenue", blurb: "Un mot de la direction de l’école." },
    "about/leadership": { title: "Direction et équipe", blurb: "Les personnes qui dirigent l’école." },
    "about/accreditations": { title: "Accréditations", blurb: "Cambridge, le ministère tunisien de l’Éducation et le réseau Maarif." },
    "about/child-protection": { title: "Protection de l’enfance", blurb: "Comment nous protégeons chaque enfant à l’école." },
    programs: { title: "Programmes", blurb: "De la maternelle à l’année 13 sur une seule ligne, en quatre langues." },
    "programs/kindergarten": { title: "Maternelle", blurb: "4 à 5 ans : un premier pas sûr et chaleureux." },
    "programs/primary": { title: "Primaire", blurb: "Années 1 à 6, alignées sur Cambridge Primary." },
    "programs/lower-secondary": { title: "Collège", blurb: "Années 7 à 9, jusqu’au Cambridge Checkpoint." },
    "programs/upper-secondary": { title: "Lycée", blurb: "Années 10 à 13 : IGCSE, puis AS et A Levels." },
    "programs/cambridge": { title: "Le parcours Cambridge", blurb: "Chaque étape et chaque examen de 4 à 18 ans, pas à pas." },
    "programs/languages": { title: "Quatre langues", blurb: "L’anglais, le français, l’arabe et le turc dans la vie de l’école." },
    "programs/student-support": { title: "Accompagnement des élèves", blurb: "Une aide pour chaque enfant, et une orientation pour la suite." },
    "programs/technology": { title: "Technologie et espaces d’apprentissage", blurb: "Informatique, robotique et les salles où les enfants apprennent." },
    admissions: { title: "Admissions", blurb: "Comment rejoindre l’école, en quatre étapes." },
    "admissions/ages": { title: "Âges et classes", blurb: "La classe de votre enfant selon son année de naissance." },
    "admissions/visit": { title: "Réserver une visite", blurb: "Choisissez un jour ; nous vous appelons pour confirmer." },
    "admissions/pre-register": { title: "Préinscription", blurb: "Présentez-nous votre enfant en quelques minutes." },
    "admissions/faq": { title: "Questions des parents", blurb: "Les réponses aux questions les plus fréquentes." },
    "admissions/bus-canteen": { title: "Bus et cantine", blurb: "Le transport scolaire et le menu de la semaine." },
    "admissions/fees": { title: "Frais de scolarité", blurb: "Demandez-nous les frais pour la classe de votre enfant." },
    contact: { title: "Contact", blurb: "Les deux campus, les téléphones, WhatsApp et l’e-mail." },
  },
  ui: {
    home: "Accueil",
    breadcrumb: "Vous êtes ici",
    menuOf: (area) => `Pages : ${area}`,
    overview: "Vue d’ensemble",
    inThisSection: "Dans cette rubrique",
    social: "Réseaux sociaux",
    followUs: "Suivez l’école",
    contactUs: "Nous contacter",
    whatsappAbout: (topic) => `Bonjour, j’ai une question au sujet de : ${topic}.`,
    back: "Retour",
    toApprove: "Texte à faire approuver par la direction.",
  },
};

const ar: PageNames = {
  areas: {
    about: "عن المدرسة",
    programs: "البرامج",
    admissions: "القبول",
    "campus-life": "الحياة المدرسية",
    parents: "الأولياء",
    careers: "الوظائف",
    contact: "اتصل بنا",
  },
  pages: {
    about: { title: "عن المدرسة", blurb: "من نحن، وما نؤمن به، وكيف تعمل المدرسة." },
    "about/mission-vision": { title: "الرسالة والرؤية", blurb: "ما نريده لكل طفل، وكيف نعمل لتحقيقه." },
    "about/welcome": { title: "كلمة ترحيب", blurb: "كلمة من إدارة المدرسة." },
    "about/leadership": { title: "الإدارة والفريق", blurb: "الأشخاص الذين يقودون المدرسة." },
    "about/accreditations": { title: "الاعتمادات", blurb: "كامبريدج ووزارة التربية التونسية وشبكة المعارف." },
    "about/child-protection": { title: "حماية الطفل", blurb: "كيف نحافظ على سلامة كل طفل في المدرسة." },
    programs: { title: "البرامج", blurb: "من الروضة إلى سنة 13 على مسار واحد، بأربع لغات." },
    "programs/kindergarten": { title: "الروضة", blurb: "من 4 إلى 5 سنوات: خطوة أولى آمنة ودافئة." },
    "programs/primary": { title: "الابتدائي", blurb: "من سنة 1 إلى سنة 6، وفق Cambridge Primary." },
    "programs/lower-secondary": { title: "الإعدادي", blurb: "من سنة 7 إلى سنة 9، حتى اختبار Cambridge Checkpoint." },
    "programs/upper-secondary": { title: "الثانوي", blurb: "من سنة 10 إلى سنة 13: IGCSE ثم AS و A Level." },
    "programs/cambridge": { title: "مسار كامبريدج", blurb: "كل مرحلة وكل امتحان من 4 إلى 18 سنة، خطوة بخطوة." },
    "programs/languages": { title: "أربع لغات", blurb: "الإنجليزية والفرنسية والعربية والتركية في الحياة المدرسية." },
    "programs/student-support": { title: "مرافقة التلاميذ", blurb: "مساعدة لكل طفل، وتوجيه لما بعد المدرسة." },
    "programs/technology": { title: "التكنولوجيا وفضاءات التعلّم", blurb: "الإعلامية والروبوتيك والقاعات التي يتعلّم فيها الأطفال." },
    admissions: { title: "القبول", blurb: "كيف تلتحقون بالمدرسة، في أربع خطوات." },
    "admissions/ages": { title: "الأعمار والأقسام", blurb: "القسم الذي يلتحق به طفلكم حسب سنة ولادته." },
    "admissions/visit": { title: "احجزوا زيارة", blurb: "اختاروا يومًا، وسنتصل بكم للتأكيد." },
    "admissions/pre-register": { title: "التسجيل المسبق", blurb: "عرّفونا بطفلكم في دقائق قليلة." },
    "admissions/faq": { title: "أسئلة الأولياء", blurb: "أجوبة عن أكثر ما تسأل عنه العائلات." },
    "admissions/bus-canteen": { title: "الحافلة والمطعم", blurb: "النقل المدرسي وقائمة طعام هذا الأسبوع." },
    "admissions/fees": { title: "الرسوم الدراسية", blurb: "اطلبوا منّا رسوم قسم طفلكم." },
    contact: { title: "اتصل بنا", blurb: "الفرعان والهواتف وواتساب والبريد الإلكتروني." },
  },
  ui: {
    home: "الرئيسية",
    breadcrumb: "أنتم هنا",
    menuOf: (area) => `صفحات ${area}`,
    overview: "نظرة عامة",
    inThisSection: "في هذا القسم",
    social: "وسائل التواصل الاجتماعي",
    followUs: "تابعوا المدرسة",
    contactUs: "اتصلوا بنا",
    whatsappAbout: (topic) => `مرحبًا، لديّ سؤال حول: ${topic}.`,
    back: "رجوع",
    toApprove: "نص في انتظار موافقة الإدارة.",
  },
};

const tr: PageNames = {
  areas: {
    about: "Okulumuz",
    programs: "Programlar",
    admissions: "Kabul",
    "campus-life": "Okul yaşamı",
    parents: "Veliler",
    careers: "Kariyer",
    contact: "İletişim",
  },
  pages: {
    about: { title: "Okulumuz hakkında", blurb: "Kim olduğumuz, neye inandığımız ve okulun nasıl işlediği." },
    "about/mission-vision": { title: "Misyon ve vizyon", blurb: "Her çocuk için ne istediğimiz ve bunun için nasıl çalıştığımız." },
    "about/welcome": { title: "Hoş geldiniz mesajı", blurb: "Okul müdürlüğünden bir mesaj." },
    "about/leadership": { title: "Yönetim ve kadro", blurb: "Okulu yöneten kişiler." },
    "about/accreditations": { title: "Akreditasyonlar", blurb: "Cambridge, Tunus Eğitim Bakanlığı ve Maarif ağı." },
    "about/child-protection": { title: "Çocuk koruma", blurb: "Okulda her çocuğu nasıl güvende tuttuğumuz." },
    programs: { title: "Programlar", blurb: "Anaokulundan Yıl 13’e tek bir yol, dört dilde." },
    "programs/kindergarten": { title: "Anaokulu", blurb: "4-5 yaş: güvenli ve sıcak bir ilk adım." },
    "programs/primary": { title: "İlkokul", blurb: "Yıl 1-6, Cambridge Primary ile uyumlu." },
    "programs/lower-secondary": { title: "Ortaokul", blurb: "Yıl 7-9, Cambridge Checkpoint’e kadar." },
    "programs/upper-secondary": { title: "Lise", blurb: "Yıl 10-13: IGCSE, ardından AS ve A Level." },
    "programs/cambridge": { title: "Cambridge yolu", blurb: "4’ten 18 yaşa her aşama ve her sınav, adım adım." },
    "programs/languages": { title: "Dört dil", blurb: "Okul yaşamında İngilizce, Fransızca, Arapça ve Türkçe." },
    "programs/student-support": { title: "Öğrenci desteği", blurb: "Her çocuğa destek ve sonrası için rehberlik." },
    "programs/technology": { title: "Teknoloji ve öğrenme alanları", blurb: "Bilişim, robotik ve çocukların öğrendiği sınıflar." },
    admissions: { title: "Kabul", blurb: "Okula dört adımda nasıl katılırsınız." },
    "admissions/ages": { title: "Yaşlar ve sınıflar", blurb: "Doğum yılına göre çocuğunuzun sınıfı." },
    "admissions/visit": { title: "Ziyaret planlayın", blurb: "Bir gün seçin; onaylamak için sizi arayalım." },
    "admissions/pre-register": { title: "Ön kayıt", blurb: "Birkaç dakikada çocuğunuzu bize tanıtın." },
    "admissions/faq": { title: "Velilerin soruları", blurb: "Ailelerin en çok sorduğu soruların yanıtları." },
    "admissions/bus-canteen": { title: "Servis ve yemekhane", blurb: "Okul servisi ve bu haftanın menüsü." },
    "admissions/fees": { title: "Ücretler", blurb: "Çocuğunuzun sınıfı için ücretleri bize sorun." },
    contact: { title: "İletişim", blurb: "İki kampüs, telefonlar, WhatsApp ve e-posta." },
  },
  ui: {
    home: "Ana sayfa",
    breadcrumb: "Buradasınız",
    menuOf: (area) => `${area} sayfaları`,
    overview: "Genel bakış",
    inThisSection: "Bu bölümde",
    social: "Sosyal medya",
    followUs: "Okulu takip edin",
    contactUs: "Bize ulaşın",
    whatsappAbout: (topic) => `Merhaba, şu konuda bir sorum var: ${topic}.`,
    back: "Geri",
    toApprove: "Metin okul yönetiminin onayını bekliyor.",
  },
};

export const pageNames: Record<Locale, PageNames> = { en, fr, ar, tr };
