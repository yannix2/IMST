import type { Locale } from "@maarif/contracts/locales";

// Words of the Campus life pages (wave 3). Content itself (news, events, albums, clubs, trips)
// comes from maarifcms; these are only the frames around it. FR, AR, TR: drafts for review.

export type CampusCopy = {
  figureLabel: string;
  lede: string;
  latestNews: string;
  upcoming: string;
  albums: string;
  clubs: string;
  trips: string;
  seeAll: string;
  readMore: string;
  photos: (n: number) => string;
  when: string;
  where: string;
  register: string;
  schedule: string;
  partner: string;
  lastVisit: string;
  backToNews: string;
  backToGallery: string;
  previous: string;
  next: string;
  pageOf: (page: number, pages: number) => string;
  empty: { news: string; events: string; albums: string; clubs: string; trips: string };
  social: string;
  ledes: { news: string; events: string; gallery: string; clubs: string; trips: string };
};

export const campusCopy: Record<Locale, CampusCopy> = {
  en: {
    figureLabel: "A network of points joined by lines. Point at one to light up its links.",
    lede: "School life beyond the timetable: news from both campuses, the dates ahead, photo albums, clubs and the places our classes visit.",
    latestNews: "Latest news",
    upcoming: "Coming up",
    albums: "Photo albums",
    clubs: "Clubs and activities",
    trips: "Field trips",
    seeAll: "See all",
    readMore: "Read",
    photos: (n) => (n === 1 ? "1 photo" : `${n} photos`),
    when: "When",
    where: "Where",
    register: "How to take part",
    schedule: "When it meets",
    partner: "With",
    lastVisit: "Last visit",
    backToNews: "All news",
    backToGallery: "All albums",
    previous: "Newer",
    next: "Older",
    pageOf: (page, pages) => `Page ${page} of ${pages}`,
    empty: {
      news: "News appears here as soon as the school publishes it. Meanwhile, the school shares its days on social media.",
      events: "No dates are announced yet. They appear here as soon as the school publishes them.",
      albums: "Albums appear here once the school publishes them, with photos where no child can be recognised.",
      clubs: "The list of clubs for this year is being prepared.",
      trips: "The list of field trips is being prepared.",
    },
    social: "The school on social media",
    ledes: {
      news: "What is happening at school, from both campuses.",
      events: "Dates ahead for families and pupils.",
      gallery: "School days, events and trips in pictures.",
      clubs: "After-class clubs, by level and campus.",
      trips: "Where our classes go to learn outside school.",
    },
  },
  fr: {
    figureLabel: "Un réseau de points reliés par des lignes. Pointez-en un pour allumer ses liens.",
    lede: "La vie de l’école au-delà de l’emploi du temps : les actualités des deux campus, les dates à venir, les albums photos, les clubs et les lieux que visitent nos classes.",
    latestNews: "Dernières actualités",
    upcoming: "À venir",
    albums: "Albums photos",
    clubs: "Clubs et activités",
    trips: "Sorties scolaires",
    seeAll: "Tout voir",
    readMore: "Lire",
    photos: (n) => (n === 1 ? "1 photo" : `${n} photos`),
    when: "Quand",
    where: "Où",
    register: "Comment participer",
    schedule: "Horaires",
    partner: "Avec",
    lastVisit: "Dernière visite",
    backToNews: "Toutes les actualités",
    backToGallery: "Tous les albums",
    previous: "Plus récentes",
    next: "Plus anciennes",
    pageOf: (page, pages) => `Page ${page} sur ${pages}`,
    empty: {
      news: "Les actualités apparaissent ici dès que l’école les publie. En attendant, l’école partage ses journées sur les réseaux sociaux.",
      events: "Aucune date n’est encore annoncée. Elles apparaissent ici dès que l’école les publie.",
      albums: "Les albums apparaissent ici dès que l’école les publie, avec des photos où aucun enfant n’est reconnaissable.",
      clubs: "La liste des clubs de cette année est en préparation.",
      trips: "La liste des sorties scolaires est en préparation.",
    },
    social: "L’école sur les réseaux sociaux",
    ledes: {
      news: "Ce qui se passe à l’école, sur les deux campus.",
      events: "Les prochaines dates pour les familles et les élèves.",
      gallery: "Les journées d’école, les événements et les sorties en images.",
      clubs: "Les clubs après les cours, par niveau et par campus.",
      trips: "Là où nos classes vont apprendre hors de l’école.",
    },
  },
  ar: {
    figureLabel: "شبكة من النقاط تربط بينها خطوط. أشيروا إلى نقطة لتضيء روابطها.",
    lede: "الحياة المدرسية أبعد من جدول الدروس: أخبار الفرعين، والمواعيد القادمة، وألبومات الصور، والنوادي، والأماكن التي تزورها أقسامنا.",
    latestNews: "آخر الأخبار",
    upcoming: "قريبًا",
    albums: "ألبومات الصور",
    clubs: "النوادي والأنشطة",
    trips: "الرحلات المدرسية",
    seeAll: "عرض الكل",
    readMore: "اقرأ",
    photos: (n) => (n === 1 ? "صورة واحدة" : `${n} صور`),
    when: "متى",
    where: "أين",
    register: "كيفية المشاركة",
    schedule: "المواعيد",
    partner: "بالتعاون مع",
    lastVisit: "آخر زيارة",
    backToNews: "كل الأخبار",
    backToGallery: "كل الألبومات",
    previous: "الأحدث",
    next: "الأقدم",
    pageOf: (page, pages) => `الصفحة ${page} من ${pages}`,
    empty: {
      news: "تظهر الأخبار هنا بمجرد أن تنشرها المدرسة. في الأثناء، تشارك المدرسة أيامها على وسائل التواصل الاجتماعي.",
      events: "لم يُعلن عن أي موعد بعد. تظهر المواعيد هنا بمجرد أن تنشرها المدرسة.",
      albums: "تظهر الألبومات هنا بمجرد أن تنشرها المدرسة، بصور لا يمكن فيها التعرّف على أي طفل.",
      clubs: "قائمة نوادي هذه السنة قيد الإعداد.",
      trips: "قائمة الرحلات المدرسية قيد الإعداد.",
    },
    social: "المدرسة على وسائل التواصل الاجتماعي",
    ledes: {
      news: "ما يحدث في المدرسة، في الفرعين.",
      events: "المواعيد القادمة للعائلات والتلاميذ.",
      gallery: "الأيام المدرسية والفعاليات والرحلات بالصور.",
      clubs: "النوادي بعد الدروس، حسب المرحلة والفرع.",
      trips: "الأماكن التي تزورها أقسامنا للتعلّم خارج المدرسة.",
    },
  },
  tr: {
    figureLabel: "Çizgilerle birbirine bağlı noktalardan bir ağ. Bağlantılarını yakmak için bir noktanın üzerine gelin.",
    lede: "Ders programının ötesinde okul yaşamı: iki kampüsten haberler, yaklaşan tarihler, fotoğraf albümleri, kulüpler ve sınıflarımızın ziyaret ettiği yerler.",
    latestNews: "Son haberler",
    upcoming: "Yaklaşanlar",
    albums: "Fotoğraf albümleri",
    clubs: "Kulüpler ve etkinlikler",
    trips: "Okul gezileri",
    seeAll: "Tümünü gör",
    readMore: "Oku",
    photos: (n) => `${n} fotoğraf`,
    when: "Ne zaman",
    where: "Nerede",
    register: "Nasıl katılınır",
    schedule: "Toplanma zamanı",
    partner: "Birlikte",
    lastVisit: "Son ziyaret",
    backToNews: "Tüm haberler",
    backToGallery: "Tüm albümler",
    previous: "Daha yeni",
    next: "Daha eski",
    pageOf: (page, pages) => `Sayfa ${page} / ${pages}`,
    empty: {
      news: "Haberler, okul yayımlar yayımlamaz burada görünür. Bu arada okul günlerini sosyal medyada paylaşıyor.",
      events: "Henüz duyurulmuş bir tarih yok. Okul yayımladığında burada görünecek.",
      albums: "Albümler, okul yayımladığında burada görünür; hiçbir çocuğun tanınmadığı fotoğraflarla.",
      clubs: "Bu yılın kulüp listesi hazırlanıyor.",
      trips: "Okul gezileri listesi hazırlanıyor.",
    },
    social: "Sosyal medyada okul",
    ledes: {
      news: "Okulda neler oluyor, iki kampüsten.",
      events: "Aileler ve öğrenciler için yaklaşan tarihler.",
      gallery: "Okul günleri, etkinlikler ve geziler fotoğraflarla.",
      clubs: "Ders sonrası kulüpler, düzeye ve kampüse göre.",
      trips: "Sınıflarımızın okul dışında öğrenmeye gittiği yerler.",
    },
  },
};

export const campusFigure = (locale: Locale) => ({ name: "network" as const, label: campusCopy[locale].figureLabel });
