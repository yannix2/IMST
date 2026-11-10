import type { Locale } from "@maarif/contracts/locales";

// Wave 5 (owner 2026-11-10): the Home film ("Watch the film") and the guided tour started by
// "Discover our school". Kept apart from the Home copy so inner pages carry only these few words.

export type FilmCopy = {
  discover: string;
  watch: string;
  length: string;
  title: string;
  close: string;
  transcript: string;
  endTitle: string;
};

export type TourCopy = {
  label: string;
  /** "Stop {n} of {total}": a template, because client components cannot receive functions. */
  stop: string;
  next: string;
  previous: string;
  leave: string;
  end: string;
  endHint: string;
};

export const filmCopy: Record<Locale, FilmCopy> = {
  en: {
    discover: "Discover our school",
    watch: "Watch the film",
    length: "3 min",
    title: "Our school in 3 minutes",
    close: "Close the film",
    transcript: "Read what is said",
    endTitle: "Would you like to see it for yourself?",
  },
  fr: {
    discover: "Découvrir notre école",
    watch: "Voir le film",
    length: "3 min",
    title: "Notre école en 3 minutes",
    close: "Fermer le film",
    transcript: "Lire ce qui est dit",
    endTitle: "Envie de la découvrir par vous-même ?",
  },
  ar: {
    discover: "اكتشفوا مدرستنا",
    watch: "شاهدوا الفيلم",
    length: "3 دقائق",
    title: "مدرستنا في 3 دقائق",
    close: "إغلاق الفيلم",
    transcript: "اقرأوا ما يُقال",
    endTitle: "هل تودّون رؤيتها بأنفسكم؟",
  },
  tr: {
    discover: "Okulumuzu keşfedin",
    watch: "Filmi izleyin",
    length: "3 dk",
    title: "3 dakikada okulumuz",
    close: "Filmi kapat",
    transcript: "Söylenenleri okuyun",
    endTitle: "Okulumuzu yerinde görmek ister misiniz?",
  },
};

export const tourCopy: Record<Locale, TourCopy> = {
  en: {
    label: "School tour",
    stop: "Stop {n} of {total}",
    next: "Next stop",
    previous: "Previous stop",
    leave: "Leave the tour",
    end: "End of the tour",
    endHint: "Book a visit to see it all in person.",
  },
  fr: {
    label: "Visite de l’école",
    stop: "Étape {n} sur {total}",
    next: "Étape suivante",
    previous: "Étape précédente",
    leave: "Quitter la visite",
    end: "Fin de la visite",
    endHint: "Réservez une visite pour tout voir sur place.",
  },
  ar: {
    label: "جولة في المدرسة",
    stop: "المحطة {n} من {total}",
    next: "المحطة التالية",
    previous: "المحطة السابقة",
    leave: "إنهاء الجولة",
    end: "نهاية الجولة",
    endHint: "احجزوا زيارة لتروا كل شيء عن قرب.",
  },
  tr: {
    label: "Okul turu",
    stop: "Durak {n} / {total}",
    next: "Sonraki durak",
    previous: "Önceki durak",
    leave: "Turdan çık",
    end: "Turun sonu",
    endHint: "Her şeyi yerinde görmek için bir ziyaret ayarlayın.",
  },
};
