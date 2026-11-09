import type { Locale } from "@maarif/contracts/locales";

// Words of the Parents pages (wave 3, D3). Documents, hours and the menu come from maarifcms.
// FR, AR, TR: drafts for review.

export type ParentsCopy = {
  lede: string;
  quickTitle: string;
  menuTitle: string;
  ledes: { calendar: string; schedules: string; menu: string; handbook: string; feedback: string };
  download: string;
  pdf: (size: string) => string;
  validUntil: string;
  schoolYear: string;
  table: { stage: string; campus: string; days: string; hours: string; note: string };
  empty: { calendar: string; schedules: string; handbook: string };
  askUs: string;
  feedback: {
    intro: string;
    kind: string;
    kinds: { suggestion: string; complaint: string; thanks: string };
    name: string;
    phone: string;
    email: string;
    oneWay: string;
    grade: string;
    gradeNone: string;
    message: string;
    consent: string;
    send: string;
    sent: (reference: string) => string;
    procedureTitle: string;
    procedure: string[];
  };
};

export const parentsCopy: Record<Locale, ParentsCopy> = {
  en: {
    lede: "Everything families need during the school year: the calendar, school hours, the canteen menu, the handbook and a direct line to the school.",
    quickTitle: "For families",
    menuTitle: "This week at the canteen",
    ledes: {
      calendar: "Holidays, exam periods and the key dates of the school year.",
      schedules: "Start and end times for each level and campus.",
      menu: "The canteen menu for the week, published by the school.",
      handbook: "The school rules, policies and the forms families may need.",
      feedback: "A suggestion, a concern or a thank-you: the school reads every message.",
    },
    download: "Download",
    pdf: (size) => `PDF, ${size}`,
    validUntil: "Valid until",
    schoolYear: "School year",
    table: { stage: "Level", campus: "Campus", days: "Days", hours: "Hours", note: "Note" },
    empty: {
      calendar: "The calendar for this school year will be published here. Until then, the school office can answer any question about dates.",
      schedules: "School hours for this year will be published here. Until then, the school office can tell you the times for your child’s level.",
      handbook: "The parent handbook and school policies will be published here.",
    },
    askUs: "Ask the school office",
    feedback: {
      intro: "Write to the school in your own words. A member of the administration reads each message and answers within a few working days.",
      kind: "Your message is",
      kinds: { suggestion: "A suggestion", complaint: "A concern", thanks: "A thank-you" },
      name: "Your name",
      phone: "Phone",
      email: "Email",
      oneWay: "Give a phone number or an email so the school can answer you.",
      grade: "Your child’s level",
      gradeNone: "Not about one level",
      message: "Your message",
      consent: "I agree that the school keeps these details to answer my message.",
      send: "Send",
      sent: (reference) => `Thank you. Your message has reached the school. Reference ${reference}.`,
      procedureTitle: "What happens next",
      procedure: [
        "The administration reads your message and passes it to the right person.",
        "You receive an answer by phone or email.",
        "If a concern needs a meeting, the school offers you a time at the right campus.",
      ],
    },
  },
  fr: {
    lede: "Tout ce dont les familles ont besoin pendant l’année : le calendrier, les horaires, le menu de la cantine, le guide des parents et un lien direct avec l’école.",
    quickTitle: "Pour les familles",
    menuTitle: "Cette semaine à la cantine",
    ledes: {
      calendar: "Les vacances, les périodes d’examens et les dates clés de l’année scolaire.",
      schedules: "Les heures d’entrée et de sortie par niveau et par campus.",
      menu: "Le menu de la cantine pour la semaine, publié par l’école.",
      handbook: "Le règlement de l’école, ses politiques et les formulaires dont les familles peuvent avoir besoin.",
      feedback: "Une suggestion, une préoccupation ou un remerciement : l’école lit chaque message.",
    },
    download: "Télécharger",
    pdf: (size) => `PDF, ${size}`,
    validUntil: "Valable jusqu’au",
    schoolYear: "Année scolaire",
    table: { stage: "Niveau", campus: "Campus", days: "Jours", hours: "Horaires", note: "Remarque" },
    empty: {
      calendar: "Le calendrier de cette année scolaire sera publié ici. D’ici là, le secrétariat répond à toute question sur les dates.",
      schedules: "Les horaires de cette année seront publiés ici. D’ici là, le secrétariat peut vous donner les heures du niveau de votre enfant.",
      handbook: "Le guide des parents et les politiques de l’école seront publiés ici.",
    },
    askUs: "Contacter le secrétariat",
    feedback: {
      intro: "Écrivez à l’école avec vos propres mots. Un membre de la direction lit chaque message et répond sous quelques jours ouvrables.",
      kind: "Votre message est",
      kinds: { suggestion: "Une suggestion", complaint: "Une préoccupation", thanks: "Un remerciement" },
      name: "Votre nom",
      phone: "Téléphone",
      email: "E-mail",
      oneWay: "Indiquez un téléphone ou un e-mail pour que l’école puisse vous répondre.",
      grade: "Le niveau de votre enfant",
      gradeNone: "Pas lié à un niveau",
      message: "Votre message",
      consent: "J’accepte que l’école conserve ces informations pour répondre à mon message.",
      send: "Envoyer",
      sent: (reference) => `Merci. Votre message est bien parvenu à l’école. Référence ${reference}.`,
      procedureTitle: "Et ensuite",
      procedure: [
        "La direction lit votre message et le transmet à la bonne personne.",
        "Vous recevez une réponse par téléphone ou par e-mail.",
        "Si une préoccupation demande un rendez-vous, l’école vous propose un créneau sur le bon campus.",
      ],
    },
  },
  ar: {
    lede: "كل ما تحتاجه العائلات خلال السنة الدراسية: الرزنامة، والتوقيت المدرسي، وقائمة طعام المطعم، ودليل الأولياء، وخط مباشر مع المدرسة.",
    quickTitle: "للعائلات",
    menuTitle: "هذا الأسبوع في المطعم",
    ledes: {
      calendar: "العطل وفترات الامتحانات والمواعيد المهمة في السنة الدراسية.",
      schedules: "مواعيد الدخول والخروج لكل مرحلة وفرع.",
      menu: "قائمة طعام المطعم لهذا الأسبوع، كما تنشرها المدرسة.",
      handbook: "قواعد المدرسة وسياساتها والاستمارات التي قد تحتاجها العائلات.",
      feedback: "اقتراح أو ملاحظة أو شكر: المدرسة تقرأ كل رسالة.",
    },
    download: "تحميل",
    pdf: (size) => `PDF، ${size}`,
    validUntil: "صالح حتى",
    schoolYear: "السنة الدراسية",
    table: { stage: "المرحلة", campus: "الفرع", days: "الأيام", hours: "التوقيت", note: "ملاحظة" },
    empty: {
      calendar: "ستُنشر رزنامة هذه السنة الدراسية هنا. إلى ذلك الحين، تجيب الإدارة عن أي سؤال حول المواعيد.",
      schedules: "سيُنشر التوقيت المدرسي لهذه السنة هنا. إلى ذلك الحين، يمكن للإدارة إعلامكم بمواعيد مرحلة طفلكم.",
      handbook: "سيُنشر دليل الأولياء وسياسات المدرسة هنا.",
    },
    askUs: "اتصلوا بالإدارة",
    feedback: {
      intro: "اكتبوا إلى المدرسة بكلماتكم. يقرأ أحد أعضاء الإدارة كل رسالة ويجيب في غضون أيام عمل قليلة.",
      kind: "رسالتكم",
      kinds: { suggestion: "اقتراح", complaint: "ملاحظة أو شكوى", thanks: "شكر" },
      name: "الاسم",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      oneWay: "أدخلوا رقم هاتف أو بريدًا إلكترونيًا لتتمكن المدرسة من الرد عليكم.",
      grade: "مرحلة طفلكم",
      gradeNone: "لا تخص مرحلة معيّنة",
      message: "رسالتكم",
      consent: "أوافق على أن تحتفظ المدرسة بهذه المعطيات للرد على رسالتي.",
      send: "إرسال",
      sent: (reference) => `شكرًا. وصلت رسالتكم إلى المدرسة. المرجع ${reference}.`,
      procedureTitle: "ماذا يحدث بعد ذلك",
      procedure: [
        "تقرأ الإدارة رسالتكم وتحيلها إلى الشخص المناسب.",
        "تتلقون ردًا بالهاتف أو بالبريد الإلكتروني.",
        "إذا تطلبت الملاحظة لقاءً، تقترح عليكم المدرسة موعدًا في الفرع المعني.",
      ],
    },
  },
  tr: {
    lede: "Ailelerin okul yılı boyunca ihtiyaç duyduğu her şey: takvim, okul saatleri, yemekhane menüsü, veli el kitabı ve okulla doğrudan iletişim.",
    quickTitle: "Aileler için",
    menuTitle: "Bu hafta yemekhanede",
    ledes: {
      calendar: "Tatiller, sınav dönemleri ve okul yılının önemli tarihleri.",
      schedules: "Her düzey ve kampüs için giriş ve çıkış saatleri.",
      menu: "Okulun yayımladığı haftalık yemekhane menüsü.",
      handbook: "Okul kuralları, politikalar ve ailelerin ihtiyaç duyabileceği formlar.",
      feedback: "Bir öneri, bir endişe ya da bir teşekkür: okul her mesajı okur.",
    },
    download: "İndir",
    pdf: (size) => `PDF, ${size}`,
    validUntil: "Geçerlilik",
    schoolYear: "Okul yılı",
    table: { stage: "Düzey", campus: "Kampüs", days: "Günler", hours: "Saatler", note: "Not" },
    empty: {
      calendar: "Bu okul yılının takvimi burada yayımlanacak. O zamana kadar okul sekreterliği tarihlerle ilgili her soruyu yanıtlar.",
      schedules: "Bu yılın okul saatleri burada yayımlanacak. O zamana kadar sekreterlik çocuğunuzun düzeyine ait saatleri söyleyebilir.",
      handbook: "Veli el kitabı ve okul politikaları burada yayımlanacak.",
    },
    askUs: "Okul sekreterliğine sorun",
    feedback: {
      intro: "Okula kendi sözlerinizle yazın. Yönetimden biri her mesajı okur ve birkaç iş günü içinde yanıtlar.",
      kind: "Mesajınız",
      kinds: { suggestion: "Bir öneri", complaint: "Bir endişe", thanks: "Bir teşekkür" },
      name: "Adınız",
      phone: "Telefon",
      email: "E-posta",
      oneWay: "Okulun size yanıt verebilmesi için bir telefon ya da e-posta yazın.",
      grade: "Çocuğunuzun düzeyi",
      gradeNone: "Belirli bir düzeyle ilgili değil",
      message: "Mesajınız",
      consent: "Okulun mesajımı yanıtlamak için bu bilgileri saklamasını kabul ediyorum.",
      send: "Gönder",
      sent: (reference) => `Teşekkürler. Mesajınız okula ulaştı. Referans ${reference}.`,
      procedureTitle: "Sonra ne olur",
      procedure: [
        "Yönetim mesajınızı okur ve doğru kişiye iletir.",
        "Telefon ya da e-postayla yanıt alırsınız.",
        "Bir endişe görüşme gerektirirse, okul size ilgili kampüste bir zaman önerir.",
      ],
    },
  },
};
