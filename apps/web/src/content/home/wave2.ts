import type { Locale } from "@maarif/contracts/locales";

// Home page copy added in wave 2 (docs/plans/2026-11-06-wave-2.md). English is the source; FR, AR
// and TR are drafts for native-speaker review before launch. Facts only from confirmed sources:
// the old site's news (maarif_site_data.json), the Foundation's own pages (lib/facts.ts) and the
// school's photos. Event stories describe what the photos show; [PROPOSAL] until the school
// reviews them.

export const lifeEvents = [
  "back-to-school",
  "teachers-day",
  "archery",
  "kind-words",
  "teeth-brushing",
  "farm-trip",
  "model-oic",
  "traditional-day",
  "maarif-talks",
  "end-of-year",
  "graduation",
  "pink-day",
] as const;
export type LifeEvent = (typeof lifeEvents)[number];

type Story = { title: string; story: string };

export type HomeCopy = {
  heroFilm: { play: string; pause: string };
  levelCards: { lede: string; open: string; close: string; discover: (level: string) => string; ages: (from: number, to: number) => string };
  cambridge: {
    title: string;
    lede: string;
    stagesTitle: string;
    stages: { name: string; when: string }[];
    link: string;
    galleryLabel: string;
    previous: string;
    next: string;
    /** Short captions under the gallery photos, in cambridgePhotos order (cambridge.tsx). */
    captions: [string, string, string, string, string, string, string, string];
    logoAlt: string;
    temporaryLogo: string;
  };
  life: {
    title: string;
    lede: string;
    label: string;
    previous: string;
    next: string;
    position: (current: number, total: number) => string;
    open: string;
    close: string;
    events: Record<LifeEvent, Story>;
  };
  foundation: {
    eyebrow: string;
    title: string;
    text: string;
    figuresLabel: string;
    figures: { countries: string; institutions: string; schools: string; students: string; universities: string; dormitories: string };
    source: (date: string) => string;
    visit: string;
    logoAlt: string;
  };
  world: {
    title: string;
    lede: string;
    globeLabel: string;
    search: string;
    searchPlaceholder: string;
    results: (n: number) => string;
    empty: string;
    places: (n: number) => string;
    office: string;
    here: string;
    mapNote: (shown: number, total: number) => string;
    seeAll: string;
  };
};

const en: HomeCopy = {
  heroFilm: { play: "Play the film", pause: "Pause the film" },
  levelCards: {
    lede: "Four stages on one route, from age 4 to 18. Tap a card to see ages, campus and what children learn.",
    open: "See the details",
    close: "Back to the photo",
    discover: (level) => `Discover ${level}`,
    ages: (from, to) => `Ages ${from} to ${to}`,
  },
  cambridge: {
    title: "A Cambridge pathway, from age 4 to 18",
    lede: "Lessons are taught in English on a curriculum aligned with Cambridge, with international checkpoints and exams along the way.",
    stagesTitle: "Milestones on the way",
    stages: [
      { name: "Cambridge Primary Checkpoint", when: "End of Year 6" },
      { name: "Cambridge Lower Secondary Checkpoint", when: "End of Year 9" },
      { name: "Cambridge IGCSE", when: "Years 10 and 11" },
      { name: "Cambridge AS and A Level", when: "Years 12 and 13" },
    ],
    link: "See the whole Cambridge pathway",
    galleryLabel: "Photos of learning at the school",
    previous: "Previous photo",
    next: "Next photo",
    captions: ["Science", "Experiments", "Kind words", "Together", "Kindergarten", "Healthy habits", "Early years", "Graduation"],
    logoAlt: "Cambridge International Education",
    temporaryLogo: "Temporary logo: replace with the official Cambridge school logo pack before launch",
  },
  life: {
    title: "Life at Maarif",
    lede: "Moments from the school year on both campuses. Tap a card to read its story.",
    label: "School life, one card per moment",
    previous: "Previous moment",
    next: "Next moment",
    position: (current, total) => `Moment ${current} of ${total}`,
    open: "Read the story",
    close: "Back to the photo",
    events: {
      "back-to-school": { title: "Back to school", story: "The first day of the year: balloons at the gate and a warm welcome back for every class." },
      "teachers-day": { title: "Teachers’ Day", story: "Our teachers came together to celebrate World Teachers’ Day." },
      archery: { title: "Traditional archery", story: "The opening of the Traditional Turkish Archery Club, organised by Yunus Emre Enstitüsü, in our sports hall." },
      "kind-words": { title: "Kind words", story: "Pupils traced each other’s outlines and filled them with kind words for one another." },
      "teeth-brushing": { title: "Let’s brush our teeth", story: "Our youngest learners discovered tooth brushing and healthy habits, with a giant smile to practise on." },
      "farm-trip": { title: "A day at the farm", story: "A school trip to a farm: animals to meet, ducks on the pond and olives to pick." },
      "model-oic": { title: "Model OIC in Istanbul", story: "High school students took part in an international Model OIC summit for high school students in Istanbul." },
      "traditional-day": { title: "Traditional Day", story: "Families, guests and pupils shared music, food and crafts such as ebru, Turkish paper marbling." },
      "maarif-talks": { title: "Maarif Talks", story: "Students took the stage of the auditorium to share their own talks with the school community." },
      "end-of-year": { title: "End of year ceremony", story: "Performances by our pupils on stage, with parents and teachers in the audience." },
      graduation: { title: "Year 13 graduation", story: "Each graduating class adds its name to the school’s wooden plaque, one hammer stroke at a time." },
      "pink-day": { title: "Pink Day", story: "Teachers and children came to school dressed in pink for Pink Day." },
    },
  },
  foundation: {
    eyebrow: "Our network",
    title: "Part of the Türkiye Maarif Foundation",
    text: "Our school belongs to the Türkiye Maarif Foundation, which runs schools, education centres and dormitories around the world. Families who move between countries can find Maarif schools in many of them.",
    figuresLabel: "The Foundation in figures",
    figures: {
      countries: "countries",
      institutions: "education institutions",
      schools: "schools",
      students: "students",
      universities: "universities",
      dormitories: "dormitories",
    },
    source: (date) => `Figures published by the Türkiye Maarif Foundation, read on ${date}.`,
    visit: "Visit the Foundation’s website",
    logoAlt: "Türkiye Maarif Foundation",
  },
  world: {
    title: "Maarif schools around the world",
    lede: "Each point is a country where the Foundation lists at least one school or institution. The lines lead to Istanbul, home of the Foundation.",
    globeLabel: "A globe showing the countries of the Maarif network, linked to Istanbul",
    search: "Find a country",
    searchPlaceholder: "Type a country",
    results: (n) => (n === 1 ? "1 country" : `${n} countries`),
    empty: "No country of the network matches.",
    places: (n) => (n === 1 ? "1 place on the Foundation’s map" : `${n} places on the Foundation’s map`),
    office: "Istanbul, the Foundation’s head office",
    here: "Our school",
    mapNote: (shown, total) => `The Foundation works in ${total} countries; its map lists schools or institutions in ${shown} of them.`,
    seeAll: "See every school on the Foundation’s map",
  },
};

const fr: HomeCopy = {
  heroFilm: { play: "Lire le film", pause: "Mettre le film en pause" },
  levelCards: {
    lede: "Quatre étapes sur un même parcours, de 4 à 18 ans. Touchez une carte pour voir les âges, le campus et les apprentissages.",
    open: "Voir le détail",
    close: "Revenir à la photo",
    discover: (level) => `Découvrir : ${level}`,
    ages: (from, to) => `De ${from} à ${to} ans`,
  },
  cambridge: {
    title: "Un parcours Cambridge, de 4 à 18 ans",
    lede: "Les cours ont lieu en anglais, selon un programme aligné sur Cambridge, avec des évaluations et des examens internationaux tout au long du parcours.",
    stagesTitle: "Les étapes du parcours",
    stages: [
      { name: "Cambridge Primary Checkpoint", when: "Fin de l’Année 6" },
      { name: "Cambridge Lower Secondary Checkpoint", when: "Fin de l’Année 9" },
      { name: "Cambridge IGCSE", when: "Années 10 et 11" },
      { name: "Cambridge AS et A Level", when: "Années 12 et 13" },
    ],
    link: "Voir tout le parcours Cambridge",
    galleryLabel: "Photos des apprentissages à l’école",
    previous: "Photo précédente",
    next: "Photo suivante",
    captions: ["Sciences", "Expériences", "Mots gentils", "Ensemble", "Maternelle", "Bonnes habitudes", "Petite enfance", "Diplômes"],
    logoAlt: "Cambridge International Education",
    temporaryLogo: "Logo provisoire : à remplacer par le kit officiel Cambridge avant la mise en ligne",
  },
  life: {
    title: "La vie à Maarif",
    lede: "Des moments de l’année sur nos deux campus. Touchez une carte pour lire son histoire.",
    label: "La vie de l’école, une carte par moment",
    previous: "Moment précédent",
    next: "Moment suivant",
    position: (current, total) => `Moment ${current} sur ${total}`,
    open: "Lire l’histoire",
    close: "Revenir à la photo",
    events: {
      "back-to-school": { title: "La rentrée", story: "Le premier jour de l’année : des ballons à l’entrée et un accueil chaleureux pour chaque classe." },
      "teachers-day": { title: "Journée des enseignants", story: "Nos enseignants se sont retrouvés pour fêter la Journée mondiale des enseignants." },
      archery: { title: "Tir à l’arc traditionnel", story: "L’ouverture du club de tir à l’arc traditionnel turc, organisée par le Yunus Emre Enstitüsü, dans notre gymnase." },
      "kind-words": { title: "Mots gentils", story: "Les élèves ont tracé leurs silhouettes et les ont remplies de mots gentils les uns pour les autres." },
      "teeth-brushing": { title: "Brossons-nous les dents", story: "Nos plus jeunes ont découvert le brossage des dents et les bonnes habitudes, avec un grand sourire pour s’entraîner." },
      "farm-trip": { title: "Une journée à la ferme", story: "Une sortie à la ferme : des animaux à rencontrer, des canards sur l’étang et des olives à cueillir." },
      "model-oic": { title: "Model OIC à Istanbul", story: "Des lycéens ont participé à un sommet international Model OIC pour lycéens à Istanbul." },
      "traditional-day": { title: "Journée traditionnelle", story: "Familles, invités et élèves ont partagé musique, cuisine et artisanat, comme l’ebru, le papier marbré turc." },
      "maarif-talks": { title: "Maarif Talks", story: "Des élèves sont montés sur la scène de l’auditorium pour présenter leurs propres conférences." },
      "end-of-year": { title: "Cérémonie de fin d’année", story: "Des spectacles de nos élèves sur scène, devant les parents et les enseignants." },
      graduation: { title: "Remise des diplômes, Année 13", story: "Chaque promotion ajoute son nom au trophée en bois de l’école, coup de marteau après coup de marteau." },
      "pink-day": { title: "Journée rose", story: "Enseignants et enfants sont venus à l’école habillés en rose pour la Journée rose." },
    },
  },
  foundation: {
    eyebrow: "Notre réseau",
    title: "Membre de la Fondation Maarif de Türkiye",
    text: "Notre école fait partie de la Fondation Maarif de Türkiye, qui gère des écoles, des centres éducatifs et des internats dans le monde entier. Les familles qui changent de pays retrouvent des écoles Maarif dans beaucoup d’entre eux.",
    figuresLabel: "La Fondation en chiffres",
    figures: {
      countries: "pays",
      institutions: "établissements éducatifs",
      schools: "écoles",
      students: "élèves",
      universities: "universités",
      dormitories: "internats",
    },
    source: (date) => `Chiffres publiés par la Fondation Maarif de Türkiye, consultés le ${date}.`,
    visit: "Visiter le site de la Fondation",
    logoAlt: "Fondation Maarif de Türkiye",
  },
  world: {
    title: "Les écoles Maarif dans le monde",
    lede: "Chaque point est un pays où la Fondation compte au moins une école ou un établissement. Les lignes mènent à Istanbul, siège de la Fondation.",
    globeLabel: "Un globe montrant les pays du réseau Maarif, reliés à Istanbul",
    search: "Trouver un pays",
    searchPlaceholder: "Tapez un pays",
    results: (n) => (n <= 1 ? `${n} pays` : `${n} pays`),
    empty: "Aucun pays du réseau ne correspond.",
    places: (n) => (n === 1 ? "1 lieu sur la carte de la Fondation" : `${n} lieux sur la carte de la Fondation`),
    office: "Istanbul, siège de la Fondation",
    here: "Notre école",
    mapNote: (shown, total) => `La Fondation est présente dans ${total} pays ; sa carte indique des écoles ou établissements dans ${shown} d’entre eux.`,
    seeAll: "Voir toutes les écoles sur la carte de la Fondation",
  },
};

const ar: HomeCopy = {
  heroFilm: { play: "تشغيل الفيلم", pause: "إيقاف الفيلم مؤقتًا" },
  levelCards: {
    lede: "أربع مراحل على مسار واحد، من 4 إلى 18 سنة. المس بطاقة لترى الأعمار والفرع وما يتعلّمه الأطفال.",
    open: "عرض التفاصيل",
    close: "العودة إلى الصورة",
    discover: (level) => `اكتشف: ${level}`,
    ages: (from, to) => `من ${from} إلى ${to} سنة`,
  },
  cambridge: {
    title: "مسار كامبريدج، من 4 إلى 18 سنة",
    lede: "تُدرَّس الحصص بالإنجليزية وفق منهاج متوافق مع كامبريدج، مع تقييمات وامتحانات دولية على طول المسار.",
    stagesTitle: "محطات المسار",
    stages: [
      { name: "Cambridge Primary Checkpoint", when: "نهاية سنة 6" },
      { name: "Cambridge Lower Secondary Checkpoint", when: "نهاية سنة 9" },
      { name: "Cambridge IGCSE", when: "سنة 10 وسنة 11" },
      { name: "Cambridge AS & A Level", when: "سنة 12 وسنة 13" },
    ],
    link: "مسار كامبريدج كاملًا",
    galleryLabel: "صور من التعلّم في المدرسة",
    previous: "الصورة السابقة",
    next: "الصورة التالية",
    captions: ["العلوم", "التجارب", "كلمات لطيفة", "معًا", "الروضة", "عادات صحية", "الطفولة المبكرة", "التخرّج"],
    logoAlt: "Cambridge International Education",
    temporaryLogo: "شعار مؤقت: يُستبدل بحزمة شعار كامبريدج الرسمية قبل الإطلاق",
  },
  life: {
    title: "الحياة في المعارف",
    lede: "لحظات من السنة الدراسية في فرعينا. المس بطاقة لتقرأ قصتها.",
    label: "الحياة المدرسية، بطاقة لكل لحظة",
    previous: "اللحظة السابقة",
    next: "اللحظة التالية",
    position: (current, total) => `اللحظة ${current} من ${total}`,
    open: "اقرأ القصة",
    close: "العودة إلى الصورة",
    events: {
      "back-to-school": { title: "العودة إلى المدرسة", story: "اليوم الأول من السنة: بالونات عند المدخل وترحيب دافئ بكل قسم." },
      "teachers-day": { title: "يوم المعلم", story: "اجتمع معلمونا للاحتفال باليوم العالمي للمعلم." },
      archery: { title: "الرماية التقليدية", story: "افتتاح نادي الرماية التركية التقليدية، بتنظيم من معهد يونس إمره، في قاعتنا الرياضية." },
      "kind-words": { title: "كلمات لطيفة", story: "رسم التلاميذ حدود أجساد بعضهم وملؤوها بكلمات لطيفة لبعضهم البعض." },
      "teeth-brushing": { title: "لننظّف أسناننا", story: "اكتشف أصغر تلاميذنا تنظيف الأسنان والعادات الصحية، مع ابتسامة كبيرة للتدرّب عليها." },
      "farm-trip": { title: "يوم في المزرعة", story: "رحلة مدرسية إلى مزرعة: حيوانات للتعرّف عليها، وبطّ في البركة، وزيتون للقطف." },
      "model-oic": { title: "محاكاة منظمة التعاون الإسلامي في إسطنبول", story: "شارك تلاميذ من الثانوي في قمة دولية لمحاكاة منظمة التعاون الإسلامي لتلاميذ الثانوي في إسطنبول." },
      "traditional-day": { title: "اليوم التقليدي", story: "تقاسمت العائلات والضيوف والتلاميذ الموسيقى والطعام والحِرف، مثل الإيبرو، فن الرسم التركي على الماء." },
      "maarif-talks": { title: "Maarif Talks", story: "صعد تلاميذ إلى مسرح القاعة ليقدّموا مداخلاتهم أمام الأسرة المدرسية." },
      "end-of-year": { title: "حفل نهاية السنة", story: "عروض لتلاميذنا على المسرح، بحضور الأولياء والمعلمين." },
      graduation: { title: "تخرّج سنة 13", story: "تضيف كل دفعة متخرّجة اسمها إلى لوحة المدرسة الخشبية، ضربة مطرقة بعد أخرى." },
      "pink-day": { title: "اليوم الوردي", story: "جاء المعلمون والأطفال إلى المدرسة بملابس وردية في اليوم الوردي." },
    },
  },
  foundation: {
    eyebrow: "شبكتنا",
    title: "جزء من وقف المعارف التركي",
    text: "مدرستنا جزء من وقف المعارف التركي، الذي يدير مدارس ومراكز تعليمية ومبيتات في أنحاء العالم. العائلات التي تنتقل بين البلدان تجد مدارس المعارف في كثير منها.",
    figuresLabel: "الوقف بالأرقام",
    figures: {
      countries: "دولة",
      institutions: "مؤسسة تعليمية",
      schools: "مدرسة",
      students: "تلميذ",
      universities: "جامعة",
      dormitories: "مبيت",
    },
    source: (date) => `أرقام نشرها وقف المعارف التركي، اطُّلع عليها في ${date}.`,
    visit: "زيارة موقع الوقف",
    logoAlt: "وقف المعارف التركي",
  },
  world: {
    title: "مدارس المعارف حول العالم",
    lede: "كل نقطة دولةٌ يذكر فيها الوقف مدرسة أو مؤسسة واحدة على الأقل. تقود الخطوط إلى إسطنبول، مقرّ الوقف.",
    globeLabel: "كرة أرضية تُظهر دول شبكة المعارف، مرتبطة بإسطنبول",
    search: "ابحث عن دولة",
    searchPlaceholder: "اكتب اسم دولة",
    results: (n) => `${n} دولة`,
    empty: "لا توجد دولة في الشبكة تطابق البحث.",
    places: (n) => `${n} موقع على خريطة الوقف`,
    office: "إسطنبول، مقرّ الوقف",
    here: "مدرستنا",
    mapNote: (shown, total) => `يعمل الوقف في ${total} دولة؛ وتذكر خريطته مدارس أو مؤسسات في ${shown} منها.`,
    seeAll: "كل المدارس على خريطة الوقف",
  },
};

const tr: HomeCopy = {
  heroFilm: { play: "Filmi oynat", pause: "Filmi duraklat" },
  levelCards: {
    lede: "4 yaşından 18 yaşına tek bir yolda dört aşama. Yaşları, kampüsü ve öğrenilenleri görmek için bir karta dokunun.",
    open: "Ayrıntıları gör",
    close: "Fotoğrafa dön",
    discover: (level) => `Keşfedin: ${level}`,
    ages: (from, to) => `${from}-${to} yaş`,
  },
  cambridge: {
    title: "4 yaşından 18 yaşına bir Cambridge yolu",
    lede: "Dersler, Cambridge ile uyumlu bir müfredatla İngilizce işlenir; yol boyunca uluslararası değerlendirmeler ve sınavlar vardır.",
    stagesTitle: "Yoldaki duraklar",
    stages: [
      { name: "Cambridge Primary Checkpoint", when: "Yıl 6 sonu" },
      { name: "Cambridge Lower Secondary Checkpoint", when: "Yıl 9 sonu" },
      { name: "Cambridge IGCSE", when: "Yıl 10 ve 11" },
      { name: "Cambridge AS ve A Level", when: "Yıl 12 ve 13" },
    ],
    link: "Cambridge yolunun tamamı",
    galleryLabel: "Okulda öğrenmeden fotoğraflar",
    previous: "Önceki fotoğraf",
    next: "Sonraki fotoğraf",
    captions: ["Fen", "Deneyler", "Nazik sözler", "Birlikte", "Anaokulu", "Sağlıklı alışkanlıklar", "Erken yaşlar", "Mezuniyet"],
    logoAlt: "Cambridge International Education",
    temporaryLogo: "Geçici logo: yayından önce resmî Cambridge logo paketiyle değiştirilecek",
  },
  life: {
    title: "Maarif’te yaşam",
    lede: "İki kampüsümüzde okul yılından anlar. Hikâyesini okumak için bir karta dokunun.",
    label: "Okul yaşamı, her an için bir kart",
    previous: "Önceki an",
    next: "Sonraki an",
    position: (current, total) => `${total} andan ${current}.`,
    open: "Hikâyeyi oku",
    close: "Fotoğrafa dön",
    events: {
      "back-to-school": { title: "Okula dönüş", story: "Yılın ilk günü: kapıda balonlar ve her sınıfa sıcak bir hoş geldin." },
      "teachers-day": { title: "Öğretmenler Günü", story: "Öğretmenlerimiz Dünya Öğretmenler Günü’nü birlikte kutladı." },
      archery: { title: "Geleneksel okçuluk", story: "Yunus Emre Enstitüsü’nün düzenlediği Geleneksel Türk Okçuluğu Kulübü’nün açılışı, spor salonumuzda." },
      "kind-words": { title: "Nazik sözler", story: "Öğrenciler birbirlerinin silüetini çizip içini birbirleri için nazik sözlerle doldurdu." },
      "teeth-brushing": { title: "Dişlerimizi fırçalayalım", story: "En küçük öğrencilerimiz, üzerinde alıştırma yaptıkları kocaman bir gülüşle diş fırçalamayı ve sağlıklı alışkanlıkları keşfetti." },
      "farm-trip": { title: "Çiftlikte bir gün", story: "Bir çiftlik gezisi: tanışılacak hayvanlar, gölette ördekler ve toplanacak zeytinler." },
      "model-oic": { title: "İstanbul’da Model İİT", story: "Lise öğrencilerimiz İstanbul’da lise öğrencilerine yönelik uluslararası bir Model İİT zirvesine katıldı." },
      "traditional-day": { title: "Geleneksel Gün", story: "Aileler, konuklar ve öğrenciler müziği, yemekleri ve ebru gibi el sanatlarını paylaştı." },
      "maarif-talks": { title: "Maarif Talks", story: "Öğrenciler kendi konuşmalarını okul topluluğuyla paylaşmak için konferans salonunun sahnesine çıktı." },
      "end-of-year": { title: "Yıl sonu töreni", story: "Veliler ve öğretmenler önünde öğrencilerimizin sahne gösterileri." },
      graduation: { title: "Yıl 13 mezuniyeti", story: "Her mezun sınıf, adını okulun ahşap plaketine çekiç darbeleriyle ekliyor." },
      "pink-day": { title: "Pembe Gün", story: "Öğretmenler ve çocuklar Pembe Gün için okula pembe giyinerek geldi." },
    },
  },
  foundation: {
    eyebrow: "Ağımız",
    title: "Türkiye Maarif Vakfı’nın bir parçası",
    text: "Okulumuz, dünyanın dört bir yanında okullar, eğitim merkezleri ve yurtlar işleten Türkiye Maarif Vakfı’na bağlıdır. Ülke değiştiren aileler, bu ülkelerin birçoğunda Maarif okulları bulabilir.",
    figuresLabel: "Rakamlarla Vakıf",
    figures: {
      countries: "ülke",
      institutions: "eğitim kurumu",
      schools: "okul",
      students: "öğrenci",
      universities: "üniversite",
      dormitories: "yurt",
    },
    source: (date) => `Türkiye Maarif Vakfı’nın yayımladığı rakamlar, ${date} tarihinde okundu.`,
    visit: "Vakfın web sitesini ziyaret edin",
    logoAlt: "Türkiye Maarif Vakfı",
  },
  world: {
    title: "Dünyadaki Maarif okulları",
    lede: "Her nokta, Vakfın en az bir okul veya kurum gösterdiği bir ülke. Çizgiler Vakfın merkezi İstanbul’a uzanıyor.",
    globeLabel: "Maarif ağındaki ülkeleri İstanbul’a bağlı gösteren bir küre",
    search: "Ülke bul",
    searchPlaceholder: "Bir ülke yazın",
    results: (n) => `${n} ülke`,
    empty: "Ağda bu aramaya uyan ülke yok.",
    places: (n) => `Vakfın haritasında ${n} yer`,
    office: "İstanbul, Vakfın genel merkezi",
    here: "Okulumuz",
    mapNote: (shown, total) => `Vakıf ${total} ülkede faaliyet gösteriyor; haritası bunların ${shown} tanesinde okul veya kurum gösteriyor.`,
    seeAll: "Vakfın haritasındaki tüm okullar",
  },
};

export const homeCopy: Record<Locale, HomeCopy> = { en, fr, ar, tr };
