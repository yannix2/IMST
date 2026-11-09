import type { Locale } from "@maarif/contracts/locales";

// Words of the Careers pages (wave 3, D4). Openings come from maarifcms (Jobs). The intro states
// only confirmed facts (curriculum, languages, campuses, network); everything about pay, benefits
// or numbers waits for the school. FR, AR, TR: drafts for review.

export type CareersCopy = {
  lede: string;
  whyTitle: string;
  why: string[];
  openingsTitle: string;
  seeOpenings: string;
  openTitle: string;
  openText: string;
  closesOn: string;
  startsOn: string;
  campus: string;
  contract: string;
  applyTitle: string;
  backToOpenings: string;
  empty: string;
  form: {
    name: string;
    email: string;
    phone: string;
    position: string;
    positionHint: string;
    message: string;
    cv: string;
    cvHint: string;
    consent: string;
    send: string;
    sent: (reference: string) => string;
    errors: Record<string, string>;
  };
};

export const careersCopy: Record<Locale, CareersCopy> = {
  en: {
    lede: "Teach and work in an international school in Tunis, on the Cambridge International curriculum, with English, French, Arabic and Turkish every day.",
    whyTitle: "Working at the school",
    why: [
      "The Cambridge International curriculum, from Early Years to A Level, taught in English.",
      "A school day in four languages: English, French, Arabic and Turkish.",
      "Two campuses in Tunis: Le Kram for Kindergarten to Year 9, Charguia 2 for Years 10 to 13.",
      "Part of the Türkiye Maarif Foundation’s schools in 66 countries.",
    ],
    openingsTitle: "Open positions",
    seeOpenings: "See the open positions",
    openTitle: "Open application",
    openText: "No position for you right now? Send your CV anyway: the school keeps it for six months and contacts you if a suitable role opens.",
    closesOn: "Apply by",
    startsOn: "Starts",
    campus: "Campus",
    contract: "Contract",
    applyTitle: "Apply for this position",
    backToOpenings: "All open positions",
    empty: "There are no open positions at the moment. You can still send an open application.",
    form: {
      name: "Full name",
      email: "Email",
      phone: "Phone",
      position: "Position you are interested in",
      positionHint: "For example: primary teacher, maths teacher, school nurse.",
      message: "A few words about you",
      cv: "Your CV",
      cvHint: "One PDF file, 5 MB at most. Only the school’s administrators can open it.",
      consent: "I agree that the school keeps my application and CV for six months to consider me for a position, then deletes them.",
      send: "Send my application",
      sent: (reference) => `Thank you. Your application has reached the school. Reference ${reference}.`,
      errors: {
        cv_required: "Add your CV as a PDF file.",
        pdf_only: "The CV must be a PDF file.",
        too_large: "The file is larger than 5 MB.",
        invalid_job: "This position is closed. You can send an open application instead.",
      },
    },
  },
  fr: {
    lede: "Enseigner et travailler dans une école internationale à Tunis, sur le programme Cambridge International, avec l’anglais, le français, l’arabe et le turc chaque jour.",
    whyTitle: "Travailler à l’école",
    why: [
      "Le programme Cambridge International, des Early Years aux A Levels, enseigné en anglais.",
      "Une journée d’école en quatre langues : anglais, français, arabe et turc.",
      "Deux campus à Tunis : Le Kram de la maternelle à l’année 9, Charguia 2 pour les années 10 à 13.",
      "Membre des écoles de la Fondation Maarif de Türkiye dans 66 pays.",
    ],
    openingsTitle: "Offres d’emploi",
    seeOpenings: "Voir les offres",
    openTitle: "Candidature spontanée",
    openText: "Pas d’offre pour vous en ce moment ? Envoyez tout de même votre CV : l’école le conserve six mois et vous contacte si un poste adapté s’ouvre.",
    closesOn: "Candidater avant le",
    startsOn: "Début",
    campus: "Campus",
    contract: "Contrat",
    applyTitle: "Postuler à ce poste",
    backToOpenings: "Toutes les offres",
    empty: "Aucun poste n’est ouvert pour le moment. Vous pouvez envoyer une candidature spontanée.",
    form: {
      name: "Nom complet",
      email: "E-mail",
      phone: "Téléphone",
      position: "Poste qui vous intéresse",
      positionHint: "Par exemple : enseignant du primaire, professeur de mathématiques, infirmier scolaire.",
      message: "Quelques mots sur vous",
      cv: "Votre CV",
      cvHint: "Un seul fichier PDF, 5 Mo au maximum. Seuls les administrateurs de l’école peuvent l’ouvrir.",
      consent: "J’accepte que l’école conserve ma candidature et mon CV six mois pour étudier mon profil, puis les supprime.",
      send: "Envoyer ma candidature",
      sent: (reference) => `Merci. Votre candidature est bien parvenue à l’école. Référence ${reference}.`,
      errors: {
        cv_required: "Ajoutez votre CV au format PDF.",
        pdf_only: "Le CV doit être un fichier PDF.",
        too_large: "Le fichier dépasse 5 Mo.",
        invalid_job: "Ce poste est clos. Vous pouvez envoyer une candidature spontanée.",
      },
    },
  },
  ar: {
    lede: "درّسوا واعملوا في مدرسة دولية بتونس، وفق منهاج Cambridge International، مع الإنجليزية والفرنسية والعربية والتركية كل يوم.",
    whyTitle: "العمل في المدرسة",
    why: [
      "منهاج Cambridge International، من Early Years إلى A Level، يُدرَّس بالإنجليزية.",
      "يوم دراسي بأربع لغات: الإنجليزية والفرنسية والعربية والتركية.",
      "فرعان في تونس: الكرم من الروضة إلى سنة 9، والشرقية 2 من سنة 10 إلى سنة 13.",
      "جزء من مدارس وقف المعارف التركي في 66 دولة.",
    ],
    openingsTitle: "الوظائف الشاغرة",
    seeOpenings: "عرض الوظائف الشاغرة",
    openTitle: "ترشّح تلقائي",
    openText: "لا توجد وظيفة تناسبكم الآن؟ أرسلوا سيرتكم الذاتية رغم ذلك: تحتفظ بها المدرسة ستة أشهر وتتصل بكم إذا فُتحت وظيفة مناسبة.",
    closesOn: "آخر أجل للترشّح",
    startsOn: "تاريخ البدء",
    campus: "الفرع",
    contract: "العقد",
    applyTitle: "الترشّح لهذه الوظيفة",
    backToOpenings: "كل الوظائف الشاغرة",
    empty: "لا توجد وظائف شاغرة حاليًا. يمكنكم إرسال ترشّح تلقائي.",
    form: {
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      position: "الوظيفة التي تهمّكم",
      positionHint: "مثلًا: معلّم ابتدائي، أستاذ رياضيات، ممرّض مدرسي.",
      message: "بضع كلمات عنكم",
      cv: "السيرة الذاتية",
      cvHint: "ملف PDF واحد، 5 ميغابايت على الأكثر. لا يفتحه إلا مسؤولو المدرسة.",
      consent: "أوافق على أن تحتفظ المدرسة بترشّحي وسيرتي الذاتية ستة أشهر لدراسة ملفي، ثم تحذفهما.",
      send: "إرسال الترشّح",
      sent: (reference) => `شكرًا. وصل ترشّحكم إلى المدرسة. المرجع ${reference}.`,
      errors: {
        cv_required: "أضيفوا سيرتكم الذاتية بصيغة PDF.",
        pdf_only: "يجب أن تكون السيرة الذاتية ملف PDF.",
        too_large: "حجم الملف أكبر من 5 ميغابايت.",
        invalid_job: "هذه الوظيفة مغلقة. يمكنكم إرسال ترشّح تلقائي.",
      },
    },
  },
  tr: {
    lede: "Tunus’ta, Cambridge International müfredatıyla ve her gün İngilizce, Fransızca, Arapça ve Türkçe ile uluslararası bir okulda öğretin ve çalışın.",
    whyTitle: "Okulda çalışmak",
    why: [
      "Early Years’ten A Level’a, İngilizce öğretilen Cambridge International müfredatı.",
      "Dört dilde bir okul günü: İngilizce, Fransızca, Arapça ve Türkçe.",
      "Tunus’ta iki kampüs: Anaokulu - Yıl 9 için Le Kram, Yıl 10-13 için Charguia 2.",
      "Türkiye Maarif Vakfı’nın 66 ülkedeki okullarından biri.",
    ],
    openingsTitle: "Açık pozisyonlar",
    seeOpenings: "Açık pozisyonları gör",
    openTitle: "Genel başvuru",
    openText: "Şu an size uygun bir pozisyon yok mu? Yine de özgeçmişinizi gönderin: okul onu altı ay saklar ve uygun bir pozisyon açılırsa size ulaşır.",
    closesOn: "Son başvuru",
    startsOn: "Başlangıç",
    campus: "Kampüs",
    contract: "Sözleşme",
    applyTitle: "Bu pozisyona başvurun",
    backToOpenings: "Tüm açık pozisyonlar",
    empty: "Şu anda açık pozisyon yok. Yine de genel başvuru gönderebilirsiniz.",
    form: {
      name: "Ad soyad",
      email: "E-posta",
      phone: "Telefon",
      position: "İlgilendiğiniz pozisyon",
      positionHint: "Örneğin: sınıf öğretmeni, matematik öğretmeni, okul hemşiresi.",
      message: "Kendinizden birkaç söz",
      cv: "Özgeçmişiniz",
      cvHint: "Tek bir PDF dosyası, en fazla 5 MB. Yalnızca okul yöneticileri açabilir.",
      consent: "Okulun başvurumu ve özgeçmişimi değerlendirmek için altı ay saklamasını, ardından silmesini kabul ediyorum.",
      send: "Başvurumu gönder",
      sent: (reference) => `Teşekkürler. Başvurunuz okula ulaştı. Referans ${reference}.`,
      errors: {
        cv_required: "Özgeçmişinizi PDF olarak ekleyin.",
        pdf_only: "Özgeçmiş bir PDF dosyası olmalıdır.",
        too_large: "Dosya 5 MB’tan büyük.",
        invalid_job: "Bu pozisyon kapandı. Genel başvuru gönderebilirsiniz.",
      },
    },
  },
};
