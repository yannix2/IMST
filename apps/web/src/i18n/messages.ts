import type { Locale } from "@maarif/contracts/locales";
import type { Level } from "@maarif/contracts/school";
import type { Course } from "@maarif/contracts/content";
import type { Accreditation } from "@/lib/facts";

// Landing page copy. English is the source; FR, AR and TR are drafts that must be
// proofread by native speakers before launch (product.md section 8, launch rule).
// Facts come only from confirmed sources: product.md "Positioning", the school's
// age table and contact page (maarif_site_data.json). No figures are invented.

export type Messages = {
  schoolName: string;
  skipToContent: string;
  nav: { levels: string; admissions: string; campuses: string; canteen: string; contact: string; menu: string; language: string; theme: string };
  hero: { headline: string; lede: string; figureLabel: string; chooseLine: string };
  // Figures and recognitions from lib/facts.ts, each sourced there.
  proof: {
    label: string;
    countries: string;
    languages: string;
    campuses: string;
    ages: (from: number, to: number) => string;
    agesLabel: string;
    accreditationTitle: string;
    accreditations: Record<Accreditation, string>;
  };
  head: { title: string; play: string; pause: string; soundOn: string; soundOff: string; videoLabel: (name: string) => string };
  canteen: {
    title: string;
    lede: string;
    today: string;
    days: string;
    empty: string;
    courses: Record<Course, string>;
  };
  map: { label: string; directions: string; foundation: string; city: string };
  // The level route map and the birth-year finder.
  route: {
    hint: string;
    campusLevels: { schools: string; highSchool: string };
    places: { schools: string; highSchool: string };
    finderTitle: string;
    birthYear: string;
    choose: string;
    schoolYear: (from: number) => string;
    result: string;
    tooYoung: string;
    tooOld: string;
    note: string;
    bookThis: string;
  };
  gallery: { title: string; lede: string; label: string; previous: string; next: string };
  testimonials: { title: string; lede: string; previous: string; next: string; kinds: Record<"parent" | "student" | "alumni", string> };
  news: { title: string; lede: string; kinds: Record<"news" | "event", string> };
  faq: { title: string; lede: string; more: string };
  levels: Record<Level, string> & { title: string; lede: string; ages: (from: number, to: number) => string; years: string };
  levelDetail: Record<Level, string>;
  grade: (n: number | "kg") => string;
  station: {
    title: string;
    youAreHere: string;
    grade: string;
    bookVisit: string;
    whatsapp: string;
    whatsappMessage: (grade: string) => string;
    call: string;
    parentName: string;
    phone: string;
    email: string;
    optional: string;
    date: string;
    slot: string;
    morning: string;
    afternoon: string;
    message: string;
    consent: string;
    send: string;
    sending: string;
    sent: (reference: string) => string;
    unavailable: string;
    captcha: string;
    rateLimited: string;
    fix: string;
    errors: Record<string, string>;
  };
  reasons: { title: string; items: { title: string; text: string }[] };
  admissions: { title: string; lede: string; steps: { title: string; text: string }[] };
  campuses: {
    title: string;
    highSchool: string;
    schools: string;
    email: string;
  };
  // Closing call to action. `greeting` is this language's welcome; the band shows all four.
  cta: { greeting: string; title: string; text: string; nextStep: string; figureLabel: string };
  footer: { rights: string; languages: string };
};

const en: Messages = {
  schoolName: "International Maarif Schools of Tunisia",
  skipToContent: "Skip to content",
  nav: { levels: "Levels", admissions: "Admissions", campuses: "Campuses", canteen: "Canteen", contact: "Contact", menu: "Menu", language: "Language", theme: "Dark theme" },
  hero: {
    headline: "Four languages, one caring school.",
    lede: "Kindergarten to Year 13 in Tunis, where English, French, Arabic and Turkish are part of school life.",
    figureLabel: "The Maarif symbol, drawn in lines. Point at an arm to raise it and see one of the school’s four languages.",
    chooseLine: "Choose your child’s line",
  },
  proof: {
    label: "The school in figures",
    countries: "countries in the Maarif network",
    languages: "languages of school life",
    campuses: "campuses in Greater Tunis",
    ages: (from, to) => `${from} to ${to}`,
    agesLabel: "years old, Kindergarten to Year 13",
    accreditationTitle: "Accreditation and network",
    accreditations: {
      cambridge: "Cambridge International School",
      ministry: "Tunisian Ministry of Education",
      maarif: "Türkiye Maarif Foundation",
    },
  },
  head: {
    title: "A word from our head of school",
    play: "Play the video",
    pause: "Pause the video",
    soundOn: "Turn the sound on",
    soundOff: "Turn the sound off",
    videoLabel: (name) => `Video message from ${name}`,
  },
  canteen: {
    title: "Today’s menu",
    lede: "Lunch at the school canteen. The menu is posted every week.",
    today: "Today",
    days: "Days of the week",
    empty: "This week’s menu is not posted yet. It goes up every week, so please check back soon.",
    courses: { starter: "Starter", main: "Main course", side: "Side", dessert: "Dessert", snack: "Snack" },
  },
  map: {
    label: "A globe turning towards Tunis, where the two campuses are, linked to Türkiye.",
    directions: "Directions",
    foundation: "Türkiye Maarif Foundation",
    city: "Tunis",
  },
  route: {
    hint: "Follow the route from age 4 to 18 and choose your child’s station.",
    campusLevels: { schools: "Kindergarten to Year 9", highSchool: "Year 10 to Year 13" },
    places: { schools: "Le Kram", highSchool: "Charguia 2" },
    finderTitle: "Which level is my child in?",
    birthYear: "Year of birth",
    choose: "Choose a year",
    schoolYear: (from) => `School year ${from}/${String(from + 1).slice(2)}`,
    result: "Your child would usually join",
    tooYoung: "Kindergarten starts in the year a child turns 4.",
    tooOld: "Our classes go up to Year 13, the year students turn 17 or 18.",
    note: "Indicative, from the school’s age table. The class is confirmed after a placement test.",
    bookThis: "Book a visit for this year",
  },
  gallery: { title: "Life at Maarif", lede: "Moments from both campuses.", label: "Photos of school life", previous: "Previous photo", next: "Next photo" },
  testimonials: {
    title: "What families say",
    lede: "Parents and students, in their own words.",
    previous: "Previous testimonial",
    next: "Next testimonial",
    kinds: { parent: "Parent", student: "Student", alumni: "Former student" },
  },
  news: { title: "News and events", lede: "What is happening at school.", kinds: { news: "News", event: "Event" } },
  faq: { title: "Questions parents ask", lede: "Short answers to the questions we hear most.", more: "Ask us on WhatsApp" },
  levels: {
    title: "Three lines, one school",
    lede: "Each level is a line. Find your child’s station by age.",
    kindergarten: "Kindergarten",
    primary: "Primary",
    secondary: "Secondary",
    ages: (from, to) => `Ages ${from} to ${to}`,
    years: "Years",
  },
  levelDetail: {
    kindergarten: "A safe, warm first step: language, numbers, movement, science, art and music.",
    primary: "Years 1 to 6, on a curriculum aligned with Cambridge Primary.",
    secondary: "Years 7 to 13, through lower and upper secondary.",
  },
  grade: (n) => (n === "kg" ? "Kindergarten" : `Year ${n}`),
  station: {
    title: "Book a visit",
    youAreHere: "You are here",
    grade: "Your child’s level",
    bookVisit: "Book a visit",
    whatsapp: "WhatsApp",
    whatsappMessage: (grade) => `Hello, I would like to visit the school for my child (${grade}).`,
    call: "Call",
    parentName: "Your name",
    phone: "Phone",
    email: "Email",
    optional: "optional",
    date: "Preferred day",
    slot: "Time",
    morning: "Morning",
    afternoon: "Afternoon",
    message: "Anything we should know?",
    consent: "I agree that the school keeps these details to contact me about this visit.",
    send: "Request the visit",
    sending: "Sending…",
    sent: (reference) => `Thank you. A member of our team will call you to confirm the visit. Reference ${reference}.`,
    unavailable: "Online booking opens soon. Call us or send a WhatsApp message and we will book your visit now.",
    captcha: "The security check did not pass. Please try again.",
    rateLimited: "Too many requests in a short time. Please wait a minute and try again.",
    fix: "Please check the highlighted fields.",
    errors: {
      too_short: "This is too short.",
      too_long: "This is too long.",
      invalid_phone: "Enter a phone number with 8 to 15 digits.",
      invalid_email: "Enter a valid email address.",
      invalid_date: "Choose a day.",
      invalid_slot: "Choose a time.",
      invalid_grade: "Choose a level.",
      consent_required: "Please tick this box so we can contact you.",
    },
  },
  reasons: {
    title: "Why families choose Maarif",
    items: [
      { title: "Four languages, every day", text: "English, French, Arabic and Turkish are part of school life, so children grow at ease in more than one language." },
      { title: "A caring start", text: "Kindergarten and primary are the heart of the school: a safe, warm place to begin." },
      { title: "An international network", text: "Part of the Türkiye Maarif Foundation’s network of schools around the world." },
      { title: "Science and robotics", text: "A science fair, computing and a robotics club give children hands-on projects." },
    ],
  },
  admissions: {
    title: "The admissions route",
    lede: "Four stations from first contact to the first day.",
    steps: [
      { title: "Pre-register", text: "Tell us about your child here or by phone." },
      { title: "We call you", text: "A member of our team contacts you to answer your questions." },
      { title: "Visit and placement", text: "See the campus. Placement depends on age and a placement test." },
      { title: "First day", text: "Your child joins their class." },
    ],
  },
  campuses: {
    title: "Two campuses",
    highSchool: "High school campus",
    schools: "Schools campus",
    email: "Email",
  },
  cta: {
    greeting: "Welcome",
    title: "Come and see the school",
    text: "Choose a day and a time. A member of our team will call you to confirm the visit.",
    nextStep: "Next step",
    figureLabel: "A school with three wings, one for each level: Kindergarten, Primary and Secondary.",
  },
  footer: { rights: "All rights reserved.", languages: "Languages" },
};

const fr: Messages = {
  schoolName: "Écoles Internationales Maarif de Tunisie",
  skipToContent: "Aller au contenu",
  nav: { levels: "Niveaux", admissions: "Admissions", campuses: "Campus", canteen: "Cantine", contact: "Contact", menu: "Menu", language: "Langue", theme: "Thème sombre" },
  hero: {
    headline: "Quatre langues, une école bienveillante.",
    lede: "De la maternelle à l’année 13 à Tunis, avec l’anglais, le français, l’arabe et le turc dans la vie de l’école.",
    figureLabel: "Le symbole Maarif, dessiné au trait. Pointez un bras pour le soulever et voir l’une des quatre langues de l’école.",
    chooseLine: "Choisissez la ligne de votre enfant",
  },
  proof: {
    label: "L’école en chiffres",
    countries: "pays dans le réseau Maarif",
    languages: "langues dans la vie de l’école",
    campuses: "campus dans le Grand Tunis",
    ages: (from, to) => `${from} à ${to}`,
    agesLabel: "ans, de la maternelle à l’année 13",
    accreditationTitle: "Accréditation et réseau",
    accreditations: {
      cambridge: "Cambridge International School",
      ministry: "Ministère tunisien de l’Éducation",
      maarif: "Fondation Maarif de Türkiye",
    },
  },
  head: {
    title: "Le mot de la direction",
    play: "Lire la vidéo",
    pause: "Mettre la vidéo en pause",
    soundOn: "Activer le son",
    soundOff: "Couper le son",
    videoLabel: (name) => `Message vidéo de ${name}`,
  },
  canteen: {
    title: "Le menu du jour",
    lede: "Le déjeuner de la cantine. Le menu est publié chaque semaine.",
    today: "Aujourd’hui",
    days: "Jours de la semaine",
    empty: "Le menu de cette semaine n’est pas encore publié. Il est mis en ligne chaque semaine : revenez bientôt.",
    courses: { starter: "Entrée", main: "Plat principal", side: "Accompagnement", dessert: "Dessert", snack: "Goûter" },
  },
  map: {
    label: "Un globe qui tourne vers Tunis, où se trouvent les deux campus, relié à la Türkiye.",
    directions: "Itinéraire",
    foundation: "Fondation Maarif de Türkiye",
    city: "Tunis",
  },
  route: {
    hint: "Suivez le parcours de 4 à 18 ans et choisissez la station de votre enfant.",
    campusLevels: { schools: "De la maternelle à l’année 9", highSchool: "De l’année 10 à l’année 13" },
    places: { schools: "Le Kram", highSchool: "Charguia 2" },
    finderTitle: "Dans quel niveau sera mon enfant ?",
    birthYear: "Année de naissance",
    choose: "Choisir une année",
    schoolYear: (from) => `Année scolaire ${from}/${String(from + 1).slice(2)}`,
    result: "Votre enfant entrerait en général en",
    tooYoung: "La maternelle commence l’année où l’enfant a 4 ans.",
    tooOld: "Nos classes vont jusqu’à l’année 13, l’année des 17 ou 18 ans.",
    note: "Indicatif, d’après le tableau des âges de l’école. La classe est confirmée après un test de placement.",
    bookThis: "Réserver une visite pour ce niveau",
  },
  gallery: { title: "La vie à Maarif", lede: "Des moments des deux campus.", label: "Photos de la vie de l’école", previous: "Photo précédente", next: "Photo suivante" },
  testimonials: {
    title: "Ce que disent les familles",
    lede: "Parents et élèves, avec leurs propres mots.",
    previous: "Témoignage précédent",
    next: "Témoignage suivant",
    kinds: { parent: "Parent", student: "Élève", alumni: "Ancien élève" },
  },
  news: { title: "Actualités et événements", lede: "Ce qui se passe à l’école.", kinds: { news: "Actualité", event: "Événement" } },
  faq: { title: "Les questions des parents", lede: "Des réponses courtes aux questions les plus fréquentes.", more: "Posez-nous la question sur WhatsApp" },
  levels: {
    title: "Trois lignes, une école",
    lede: "Chaque niveau est une ligne. Trouvez la station de votre enfant selon son âge.",
    kindergarten: "Maternelle",
    primary: "Primaire",
    secondary: "Secondaire",
    ages: (from, to) => `${from} à ${to} ans`,
    years: "Années",
  },
  levelDetail: {
    kindergarten: "Un premier pas sûr et chaleureux : langage, nombres, motricité, sciences, arts et musique.",
    primary: "Années 1 à 6, avec un programme aligné sur Cambridge Primary.",
    secondary: "Années 7 à 13, du collège au lycée.",
  },
  grade: (n) => (n === "kg" ? "Maternelle" : `Année ${n}`),
  station: {
    title: "Réserver une visite",
    youAreHere: "Vous êtes ici",
    grade: "Niveau de votre enfant",
    bookVisit: "Réserver une visite",
    whatsapp: "WhatsApp",
    whatsappMessage: (grade) => `Bonjour, je souhaite visiter l’école pour mon enfant (${grade}).`,
    call: "Appeler",
    parentName: "Votre nom",
    phone: "Téléphone",
    email: "E-mail",
    optional: "facultatif",
    date: "Jour souhaité",
    slot: "Moment",
    morning: "Matin",
    afternoon: "Après-midi",
    message: "Une précision à nous donner ?",
    consent: "J’accepte que l’école conserve ces informations pour me contacter au sujet de cette visite.",
    send: "Demander la visite",
    sending: "Envoi…",
    sent: (reference) => `Merci. Un membre de notre équipe vous appellera pour confirmer la visite. Référence ${reference}.`,
    unavailable: "La réservation en ligne ouvre bientôt. Appelez-nous ou envoyez un message WhatsApp et nous réservons votre visite tout de suite.",
    captcha: "La vérification de sécurité a échoué. Veuillez réessayer.",
    rateLimited: "Trop de demandes en peu de temps. Patientez une minute puis réessayez.",
    fix: "Veuillez vérifier les champs signalés.",
    errors: {
      too_short: "C’est trop court.",
      too_long: "C’est trop long.",
      invalid_phone: "Saisissez un numéro de 8 à 15 chiffres.",
      invalid_email: "Saisissez une adresse e-mail valide.",
      invalid_date: "Choisissez un jour.",
      invalid_slot: "Choisissez un moment.",
      invalid_grade: "Choisissez un niveau.",
      consent_required: "Cochez cette case pour que nous puissions vous contacter.",
    },
  },
  reasons: {
    title: "Pourquoi les familles choisissent Maarif",
    items: [
      { title: "Quatre langues, chaque jour", text: "L’anglais, le français, l’arabe et le turc font partie de la vie de l’école : les enfants grandissent à l’aise dans plusieurs langues." },
      { title: "Un départ bienveillant", text: "La maternelle et le primaire sont le cœur de l’école : un lieu sûr et chaleureux pour commencer." },
      { title: "Un réseau international", text: "Membre du réseau d’écoles de la Fondation Maarif de Türkiye dans le monde." },
      { title: "Sciences et robotique", text: "Une foire scientifique, l’informatique et un club de robotique offrent des projets concrets." },
    ],
  },
  admissions: {
    title: "Le parcours d’admission",
    lede: "Quatre stations, du premier contact au premier jour.",
    steps: [
      { title: "Préinscription", text: "Parlez-nous de votre enfant ici ou par téléphone." },
      { title: "Nous vous appelons", text: "Un membre de notre équipe vous contacte pour répondre à vos questions." },
      { title: "Visite et placement", text: "Découvrez le campus. Le placement dépend de l’âge et d’un test de placement." },
      { title: "Premier jour", text: "Votre enfant rejoint sa classe." },
    ],
  },
  campuses: {
    title: "Deux campus",
    highSchool: "Campus du lycée",
    schools: "Campus des écoles",
    email: "E-mail",
  },
  cta: {
    greeting: "Bienvenue",
    title: "Venez découvrir l’école",
    text: "Choisissez un jour et un moment. Un membre de notre équipe vous appellera pour confirmer la visite.",
    nextStep: "Prochaine étape",
    figureLabel: "Une école à trois ailes, une par niveau : maternelle, primaire et secondaire.",
  },
  footer: { rights: "Tous droits réservés.", languages: "Langues" },
};

const ar: Messages = {
  schoolName: "مدارس المعارف الدولية بتونس",
  skipToContent: "انتقل إلى المحتوى",
  nav: { levels: "المراحل", admissions: "القبول", campuses: "الفروع", canteen: "المطعم", contact: "اتصل بنا", menu: "القائمة", language: "اللغة", theme: "الوضع الداكن" },
  hero: {
    headline: "أربع لغات، ومدرسة واحدة ترعى أطفالكم.",
    lede: "من الروضة إلى سنة 13 في تونس، حيث الإنجليزية والفرنسية والعربية والتركية جزء من الحياة المدرسية.",
    figureLabel: "شعار المعارف مرسومًا بالخطوط. أشيروا إلى ذراع لترفعوه وتروا إحدى لغات المدرسة الأربع.",
    chooseLine: "اختاروا خط طفلكم",
  },
  proof: {
    label: "المدرسة بالأرقام",
    countries: "دولة في شبكة المعارف",
    languages: "لغات في الحياة المدرسية",
    campuses: "فرعان في تونس الكبرى",
    ages: (from, to) => `${from} إلى ${to}`,
    agesLabel: "سنة، من الروضة إلى سنة 13",
    accreditationTitle: "الاعتماد والشبكة",
    accreditations: {
      cambridge: "Cambridge International School",
      ministry: "وزارة التربية التونسية",
      maarif: "وقف المعارف التركي",
    },
  },
  head: {
    title: "كلمة مدير المدرسة",
    play: "تشغيل الفيديو",
    pause: "إيقاف الفيديو مؤقتًا",
    soundOn: "تشغيل الصوت",
    soundOff: "كتم الصوت",
    videoLabel: (name) => `رسالة مصوّرة من ${name}`,
  },
  canteen: {
    title: "قائمة طعام اليوم",
    lede: "غداء مطعم المدرسة. تُنشر القائمة كل أسبوع.",
    today: "اليوم",
    days: "أيام الأسبوع",
    empty: "لم تُنشر قائمة هذا الأسبوع بعد. تُنشر كل أسبوع، فعودوا إلينا قريبًا.",
    courses: { starter: "مقبلات", main: "الطبق الرئيسي", side: "طبق جانبي", dessert: "تحلية", snack: "لمجة" },
  },
  map: {
    label: "كرة أرضية تدور نحو تونس حيث يوجد الفرعان، مرتبطة بتركيا.",
    directions: "الاتجاهات",
    foundation: "وقف المعارف التركي",
    city: "تونس",
  },
  route: {
    hint: "تابعوا المسار من سن 4 إلى 18 واختاروا محطة طفلكم.",
    campusLevels: { schools: "من الروضة إلى سنة 9", highSchool: "من سنة 10 إلى سنة 13" },
    places: { schools: "الكرم", highSchool: "الشرقية 2" },
    finderTitle: "في أي مستوى سيكون طفلي؟",
    birthYear: "سنة الميلاد",
    choose: "اختاروا سنة",
    schoolYear: (from) => `السنة الدراسية ${from}/${String(from + 1).slice(2)}`,
    result: "عادةً ما ينضم طفلكم إلى",
    tooYoung: "تبدأ الروضة في السنة التي يبلغ فيها الطفل 4 سنوات.",
    tooOld: "تمتد أقسامنا حتى سنة 13، وهي السنة التي يبلغ فيها التلاميذ 17 أو 18 عامًا.",
    note: "تقديري، حسب جدول الأعمار في المدرسة. يُحدَّد القسم بعد اختبار تحديد المستوى.",
    bookThis: "احجزوا زيارة لهذا المستوى",
  },
  gallery: { title: "الحياة في المعارف", lede: "لحظات من الفرعين.", label: "صور من الحياة المدرسية", previous: "الصورة السابقة", next: "الصورة التالية" },
  testimonials: {
    title: "ماذا تقول العائلات",
    lede: "أولياء وتلاميذ، بكلماتهم.",
    previous: "الشهادة السابقة",
    next: "الشهادة التالية",
    kinds: { parent: "وليّ أمر", student: "تلميذ", alumni: "تلميذ سابق" },
  },
  news: { title: "الأخبار والفعاليات", lede: "ما يجري في المدرسة.", kinds: { news: "خبر", event: "فعالية" } },
  faq: { title: "أسئلة الأولياء", lede: "أجوبة قصيرة عن الأسئلة الأكثر تكرارًا.", more: "اسألونا عبر واتساب" },
  levels: {
    title: "ثلاثة خطوط، مدرسة واحدة",
    lede: "كل مرحلة خط. جدوا محطة طفلكم حسب عمره.",
    kindergarten: "الروضة",
    primary: "الابتدائي",
    secondary: "الثانوي",
    ages: (from, to) => `من ${from} إلى ${to} سنوات`,
    years: "السنوات",
  },
  levelDetail: {
    kindergarten: "خطوة أولى آمنة ودافئة: اللغة والأعداد والحركة والعلوم والفنون والموسيقى.",
    primary: "من سنة 1 إلى سنة 6، وفق منهاج متوافق مع Cambridge Primary.",
    secondary: "من سنة 7 إلى سنة 13، في المرحلتين الإعدادية والثانوية.",
  },
  grade: (n) => (n === "kg" ? "الروضة" : `سنة ${n}`),
  station: {
    title: "احجزوا زيارة",
    youAreHere: "أنتم هنا",
    grade: "مرحلة طفلكم",
    bookVisit: "احجزوا زيارة",
    whatsapp: "واتساب",
    whatsappMessage: (grade) => `مرحبًا، أودّ زيارة المدرسة من أجل طفلي (${grade}).`,
    call: "اتصال",
    parentName: "اسمكم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    optional: "اختياري",
    date: "اليوم المفضّل",
    slot: "الوقت",
    morning: "صباحًا",
    afternoon: "بعد الظهر",
    message: "هل من معلومة تودّون إضافتها؟",
    consent: "أوافق على أن تحتفظ المدرسة بهذه البيانات للتواصل معي بشأن هذه الزيارة.",
    send: "اطلبوا الزيارة",
    sending: "جارٍ الإرسال…",
    sent: (reference) => `شكرًا لكم. سيتصل بكم أحد أعضاء فريقنا لتأكيد الزيارة. المرجع ${reference}.`,
    unavailable: "الحجز عبر الإنترنت سيفتح قريبًا. اتصلوا بنا أو أرسلوا رسالة واتساب ونحجز زيارتكم الآن.",
    captcha: "لم ينجح التحقق الأمني. يُرجى المحاولة مجددًا.",
    rateLimited: "طلبات كثيرة في وقت قصير. انتظروا دقيقة ثم أعيدوا المحاولة.",
    fix: "يُرجى مراجعة الحقول المشار إليها.",
    errors: {
      too_short: "النص قصير جدًا.",
      too_long: "النص طويل جدًا.",
      invalid_phone: "أدخلوا رقم هاتف من 8 إلى 15 رقمًا.",
      invalid_email: "أدخلوا بريدًا إلكترونيًا صحيحًا.",
      invalid_date: "اختاروا يومًا.",
      invalid_slot: "اختاروا وقتًا.",
      invalid_grade: "اختاروا مرحلة.",
      consent_required: "يُرجى تحديد هذا المربع لنتمكن من التواصل معكم.",
    },
  },
  reasons: {
    title: "لماذا تختار العائلات المعارف",
    items: [
      { title: "أربع لغات كل يوم", text: "الإنجليزية والفرنسية والعربية والتركية جزء من الحياة المدرسية، فينشأ الأطفال مرتاحين في أكثر من لغة." },
      { title: "بداية يملؤها الاهتمام", text: "الروضة والابتدائي قلب المدرسة: مكان آمن ودافئ للبداية." },
      { title: "شبكة دولية", text: "جزء من شبكة مدارس وقف المعارف التركي حول العالم." },
      { title: "العلوم والروبوتيك", text: "معرض علمي وإعلامية ونادٍ للروبوتيك تمنح الأطفال مشاريع عملية." },
    ],
  },
  admissions: {
    title: "مسار القبول",
    lede: "أربع محطات من أول تواصل إلى أول يوم.",
    steps: [
      { title: "التسجيل المسبق", text: "حدّثونا عن طفلكم هنا أو عبر الهاتف." },
      { title: "نتصل بكم", text: "يتواصل معكم أحد أعضاء فريقنا للإجابة عن أسئلتكم." },
      { title: "الزيارة وتحديد المستوى", text: "تعرّفوا على الفرع. يُحدَّد القسم حسب العمر واختبار تحديد المستوى." },
      { title: "اليوم الأول", text: "ينضم طفلكم إلى قسمه." },
    ],
  },
  campuses: {
    title: "فرعان",
    highSchool: "فرع الثانوية",
    schools: "فرع المدارس",
    email: "البريد الإلكتروني",
  },
  cta: {
    greeting: "أهلًا بكم",
    title: "تعالوا لزيارة المدرسة",
    text: "اختاروا يومًا ووقتًا، وسيتصل بكم أحد أعضاء فريقنا لتأكيد الزيارة.",
    nextStep: "الخطوة التالية",
    figureLabel: "مدرسة بثلاثة أجنحة، جناح لكل مرحلة: الروضة والابتدائي والثانوي.",
  },
  footer: { rights: "جميع الحقوق محفوظة.", languages: "اللغات" },
};

const tr: Messages = {
  schoolName: "Tunus Uluslararası Maarif Okulları",
  skipToContent: "İçeriğe geç",
  nav: { levels: "Kademeler", admissions: "Kayıt", campuses: "Kampüsler", canteen: "Yemekhane", contact: "İletişim", menu: "Menü", language: "Dil", theme: "Koyu tema" },
  hero: {
    headline: "Dört dil, sevgiyle büyüten bir okul.",
    lede: "Tunus’ta anaokulundan Yıl 13’e; İngilizce, Fransızca, Arapça ve Türkçe okul hayatının bir parçası.",
    figureLabel: "Çizgilerle çizilmiş Maarif sembolü. Bir kolun üzerine gelin; kol yükselir ve okulun dört dilinden biri görünür.",
    chooseLine: "Çocuğunuzun hattını seçin",
  },
  proof: {
    label: "Rakamlarla okul",
    countries: "ülkede Maarif ağı",
    languages: "dil okul hayatında",
    campuses: "kampüs Büyük Tunus’ta",
    ages: (from, to) => `${from}-${to}`,
    agesLabel: "yaş, anaokulundan Yıl 13’e",
    accreditationTitle: "Akreditasyon ve ağ",
    accreditations: {
      cambridge: "Cambridge International School",
      ministry: "Tunus Eğitim Bakanlığı",
      maarif: "Türkiye Maarif Vakfı",
    },
  },
  head: {
    title: "Okul müdürümüzden",
    play: "Videoyu oynat",
    pause: "Videoyu duraklat",
    soundOn: "Sesi aç",
    soundOff: "Sesi kapat",
    videoLabel: (name) => `${name} tarafından video mesajı`,
  },
  canteen: {
    title: "Bugünün menüsü",
    lede: "Okul yemekhanesinin öğle yemeği. Menü her hafta yayımlanır.",
    today: "Bugün",
    days: "Haftanın günleri",
    empty: "Bu haftanın menüsü henüz yayımlanmadı. Her hafta eklenir; lütfen kısa süre sonra tekrar bakın.",
    courses: { starter: "Başlangıç", main: "Ana yemek", side: "Yan yemek", dessert: "Tatlı", snack: "Ara öğün" },
  },
  map: {
    label: "İki kampüsün bulunduğu Tunus’a dönen ve Türkiye’ye bağlanan bir dünya küresi.",
    directions: "Yol tarifi",
    foundation: "Türkiye Maarif Vakfı",
    city: "Tunus",
  },
  route: {
    hint: "4’ten 18 yaşa kadar yolu izleyin ve çocuğunuzun durağını seçin.",
    campusLevels: { schools: "Anaokulundan Yıl 9’a", highSchool: "Yıl 10’dan Yıl 13’e" },
    places: { schools: "Le Kram", highSchool: "Charguia 2" },
    finderTitle: "Çocuğum hangi kademede olur?",
    birthYear: "Doğum yılı",
    choose: "Bir yıl seçin",
    schoolYear: (from) => `${from}/${String(from + 1).slice(2)} eğitim yılı`,
    result: "Çocuğunuz genellikle şu sınıfa başlar:",
    tooYoung: "Anaokulu, çocuğun 4 yaşına bastığı yıl başlar.",
    tooOld: "Sınıflarımız, öğrencilerin 17 veya 18 yaşına bastığı Yıl 13’e kadar sürer.",
    note: "Okulun yaş tablosuna göre yaklaşık bilgidir. Sınıf, seviye sınavından sonra kesinleşir.",
    bookThis: "Bu kademe için ziyaret planlayın",
  },
  gallery: { title: "Maarif’te hayat", lede: "İki kampüsten anlar.", label: "Okul hayatından fotoğraflar", previous: "Önceki fotoğraf", next: "Sonraki fotoğraf" },
  testimonials: {
    title: "Aileler ne diyor",
    lede: "Veliler ve öğrenciler, kendi sözleriyle.",
    previous: "Önceki görüş",
    next: "Sonraki görüş",
    kinds: { parent: "Veli", student: "Öğrenci", alumni: "Mezun" },
  },
  news: { title: "Haberler ve etkinlikler", lede: "Okulda neler oluyor.", kinds: { news: "Haber", event: "Etkinlik" } },
  faq: { title: "Velilerin sorduğu sorular", lede: "En sık sorulan sorulara kısa yanıtlar.", more: "WhatsApp’tan sorun" },
  levels: {
    title: "Üç hat, tek okul",
    lede: "Her kademe bir hattır. Çocuğunuzun durağını yaşına göre bulun.",
    kindergarten: "Anaokulu",
    primary: "İlkokul",
    secondary: "Ortaokul ve lise",
    ages: (from, to) => `${from}-${to} yaş`,
    years: "Yıllar",
  },
  levelDetail: {
    kindergarten: "Güvenli ve sıcak bir ilk adım: dil, sayılar, hareket, fen, sanat ve müzik.",
    primary: "Yıl 1-6, Cambridge Primary ile uyumlu bir müfredatla.",
    secondary: "Yıl 7-13, ortaokuldan liseye.",
  },
  grade: (n) => (n === "kg" ? "Anaokulu" : `Yıl ${n}`),
  station: {
    title: "Ziyaret planlayın",
    youAreHere: "Buradasınız",
    grade: "Çocuğunuzun kademesi",
    bookVisit: "Ziyaret planlayın",
    whatsapp: "WhatsApp",
    whatsappMessage: (grade) => `Merhaba, çocuğum için (${grade}) okulu ziyaret etmek istiyorum.`,
    call: "Ara",
    parentName: "Adınız",
    phone: "Telefon",
    email: "E-posta",
    optional: "isteğe bağlı",
    date: "Tercih ettiğiniz gün",
    slot: "Saat",
    morning: "Sabah",
    afternoon: "Öğleden sonra",
    message: "Bilmemiz gereken bir şey var mı?",
    consent: "Okulun bu ziyaret için benimle iletişime geçmek üzere bu bilgileri saklamasını kabul ediyorum.",
    send: "Ziyaret talep edin",
    sending: "Gönderiliyor…",
    sent: (reference) => `Teşekkürler. Ekibimizden biri ziyareti onaylamak için sizi arayacak. Referans ${reference}.`,
    unavailable: "Çevrim içi randevu yakında açılıyor. Bizi arayın veya WhatsApp’tan yazın, ziyaretinizi hemen planlayalım.",
    captcha: "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.",
    rateLimited: "Kısa sürede çok fazla istek. Bir dakika bekleyip tekrar deneyin.",
    fix: "Lütfen işaretli alanları kontrol edin.",
    errors: {
      too_short: "Bu çok kısa.",
      too_long: "Bu çok uzun.",
      invalid_phone: "8 ile 15 haneli bir telefon numarası girin.",
      invalid_email: "Geçerli bir e-posta adresi girin.",
      invalid_date: "Bir gün seçin.",
      invalid_slot: "Bir saat seçin.",
      invalid_grade: "Bir kademe seçin.",
      consent_required: "Sizinle iletişime geçebilmemiz için bu kutuyu işaretleyin.",
    },
  },
  reasons: {
    title: "Aileler neden Maarif’i seçiyor",
    items: [
      { title: "Her gün dört dil", text: "İngilizce, Fransızca, Arapça ve Türkçe okul hayatının bir parçası; çocuklar birden fazla dilde rahatça büyür." },
      { title: "Özenli bir başlangıç", text: "Anaokulu ve ilkokul okulun kalbidir: başlamak için güvenli ve sıcak bir yer." },
      { title: "Uluslararası bir ağ", text: "Türkiye Maarif Vakfı’nın dünya genelindeki okul ağının bir parçası." },
      { title: "Fen ve robotik", text: "Bilim fuarı, bilgisayar dersleri ve robotik kulübü çocuklara uygulamalı projeler sunar." },
    ],
  },
  admissions: {
    title: "Kayıt yolu",
    lede: "İlk temastan ilk güne dört durak.",
    steps: [
      { title: "Ön kayıt", text: "Çocuğunuzu buradan veya telefonla bize anlatın." },
      { title: "Sizi arıyoruz", text: "Ekibimizden biri sorularınızı yanıtlamak için sizinle iletişime geçer." },
      { title: "Ziyaret ve seviye", text: "Kampüsü görün. Yerleştirme yaşa ve seviye sınavına göre yapılır." },
      { title: "İlk gün", text: "Çocuğunuz sınıfına katılır." },
    ],
  },
  campuses: {
    title: "İki kampüs",
    highSchool: "Lise kampüsü",
    schools: "Okullar kampüsü",
    email: "E-posta",
  },
  cta: {
    greeting: "Hoş geldiniz",
    title: "Gelin, okulu görün",
    text: "Bir gün ve saat seçin. Ekibimizden biri ziyareti onaylamak için sizi arayacak.",
    nextStep: "Sonraki adım",
    figureLabel: "Her kademe için bir kanadı olan üç kanatlı bir okul: anaokulu, ilkokul, ortaokul ve lise.",
  },
  footer: { rights: "Tüm hakları saklıdır.", languages: "Diller" },
};

export const messages: Record<Locale, Messages> = { en, fr, ar, tr };
