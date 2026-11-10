import type { Locale } from "@maarif/contracts/locales";
import type { RichBlock } from "@maarif/contracts/rich-text";
import { campusOfGrade, type CampusKey, type Grade } from "@maarif/contracts/school";
import { isolate, type MailContent } from "./layout";
import { campuses, formatDate, formatTime, gradeName, mainPhone, schoolName } from "./school";

// Every email the website sends, in the reader's language. Texts make no promise the school has
// not confirmed (no delays, no numbers): "we will contact you", never "within 48 hours".

export type FormKind = "visit-booking" | "pre-registration" | "contact" | "feedback" | "application";

type Labels = {
  hello: (name?: string) => string;
  reference: string;
  preferredDate: string;
  slot: string;
  slots: { morning: string; afternoon: string };
  grade: string;
  campus: string;
  address: string;
  date: string;
  time: string;
  position: string;
  formFooter: string;
  changeOrCall: (phone: string) => string;
  cannotCome: (phone: string) => string;
};

const labels: Record<Locale, Labels> = {
  en: {
    hello: (n) => (n ? `Hello ${n},` : "Hello,"),
    reference: "Reference",
    preferredDate: "Preferred date",
    slot: "Time of day",
    slots: { morning: "Morning", afternoon: "Afternoon" },
    grade: "Grade",
    campus: "Campus",
    address: "Address",
    date: "Date",
    time: "Time",
    position: "Position",
    formFooter: "You receive this email because you sent a form on our website.",
    changeOrCall: (p) => `Need to change something? Reply to this email or call us on ${p}.`,
    cannotCome: (p) => `Cannot come? Reply to this email or call us on ${p}.`,
  },
  fr: {
    hello: (n) => (n ? `Bonjour ${n},` : "Bonjour,"),
    reference: "Référence",
    preferredDate: "Date souhaitée",
    slot: "Moment de la journée",
    slots: { morning: "Matin", afternoon: "Après-midi" },
    grade: "Classe",
    campus: "Campus",
    address: "Adresse",
    date: "Date",
    time: "Heure",
    position: "Poste",
    formFooter: "Vous recevez cet e-mail parce que vous avez envoyé un formulaire sur notre site.",
    changeOrCall: (p) => `Un changement ? Répondez à cet e-mail ou appelez-nous au ${p}.`,
    cannotCome: (p) => `Vous ne pouvez pas venir ? Répondez à cet e-mail ou appelez-nous au ${p}.`,
  },
  ar: {
    hello: (n) => (n ? `مرحبًا ${n}،` : "مرحبًا،"),
    reference: "المرجع",
    preferredDate: "التاريخ المفضّل",
    slot: "الفترة",
    slots: { morning: "صباحًا", afternoon: "بعد الظهر" },
    grade: "القسم",
    campus: "الفرع",
    address: "العنوان",
    date: "التاريخ",
    time: "الساعة",
    position: "الوظيفة",
    formFooter: "تصلكم هذه الرسالة لأنكم أرسلتم استمارة عبر موقعنا.",
    changeOrCall: (p) => `هل تريدون تغيير شيء؟ ردّوا على هذه الرسالة أو اتصلوا بنا على ${p}.`,
    cannotCome: (p) => `لا تستطيعون الحضور؟ ردّوا على هذه الرسالة أو اتصلوا بنا على ${p}.`,
  },
  tr: {
    hello: (n) => (n ? `Merhaba ${n},` : "Merhaba,"),
    reference: "Referans",
    preferredDate: "Tercih edilen tarih",
    slot: "Zaman dilimi",
    slots: { morning: "Sabah", afternoon: "Öğleden sonra" },
    grade: "Sınıf",
    campus: "Kampüs",
    address: "Adres",
    date: "Tarih",
    time: "Saat",
    position: "Pozisyon",
    formFooter: "Bu e-postayı web sitemizde bir form gönderdiğiniz için alıyorsunuz.",
    changeOrCall: (p) => `Bir değişiklik mi var? Bu e-postayı yanıtlayın ya da bizi ${p} numarasından arayın.`,
    cannotCome: (p) => `Gelemeyecek misiniz? Bu e-postayı yanıtlayın ya da bizi ${p} numarasından arayın.`,
  },
};

type Received = { subject: (ref: string) => string; heading: string; body: string[] };
type FeedbackKind = "suggestion" | "complaint" | "thanks";

const received: Record<Locale, Record<Exclude<FormKind, "feedback">, Received> & { feedback: Record<FeedbackKind, Received> }> = {
  en: {
    "visit-booking": {
      subject: (r) => `We received your visit request (${r})`,
      heading: "Thank you for your visit request",
      body: [`We have received your request to visit ${schoolName.en}. Our admissions team will contact you to confirm the day and time.`],
    },
    "pre-registration": {
      subject: (r) => `We received your pre-registration (${r})`,
      heading: "Thank you for your pre-registration",
      body: ["We have received your pre-registration. A member of our admissions team will call you about the next steps."],
    },
    contact: {
      subject: (r) => `We received your message (${r})`,
      heading: "Thank you for your message",
      body: ["We have received your message. The right person at the school will answer you as soon as possible."],
    },
    feedback: {
      suggestion: { subject: (r) => `We received your suggestion (${r})`, heading: "Thank you for your suggestion", body: ["Your suggestion has reached the school team. We read every message."] },
      complaint: { subject: (r) => `We received your message (${r})`, heading: "We received your concern", body: ["Your message has reached the school team. A person in charge will look into it and contact you."] },
      thanks: { subject: (r) => `We received your message (${r})`, heading: "Thank you for your kind words", body: ["Your message has reached the school team. We will share it with the people concerned."] },
    },
    application: {
      subject: (r) => `We received your application (${r})`,
      heading: "Thank you for your application",
      body: [
        "We have received your application and your CV. Our team reviews every application; if your profile matches an opening, we will contact you.",
        "We keep your CV only for the time stated in our privacy notice.",
      ],
    },
  },
  fr: {
    "visit-booking": {
      subject: (r) => `Nous avons bien reçu votre demande de visite (${r})`,
      heading: "Merci pour votre demande de visite",
      body: [`Nous avons bien reçu votre demande de visite des ${schoolName.fr}. Notre équipe des admissions vous contactera pour confirmer le jour et l’heure.`],
    },
    "pre-registration": {
      subject: (r) => `Nous avons bien reçu votre préinscription (${r})`,
      heading: "Merci pour votre préinscription",
      body: ["Nous avons bien reçu votre préinscription. Un membre de notre équipe des admissions vous appellera pour les prochaines étapes."],
    },
    contact: {
      subject: (r) => `Nous avons bien reçu votre message (${r})`,
      heading: "Merci pour votre message",
      body: ["Nous avons bien reçu votre message. La bonne personne à l’école vous répondra dès que possible."],
    },
    feedback: {
      suggestion: { subject: (r) => `Nous avons bien reçu votre suggestion (${r})`, heading: "Merci pour votre suggestion", body: ["Votre suggestion est bien parvenue à l’équipe de l’école. Nous lisons chaque message."] },
      complaint: { subject: (r) => `Nous avons bien reçu votre message (${r})`, heading: "Nous avons bien reçu votre préoccupation", body: ["Votre message est bien parvenu à l’équipe de l’école. Une personne responsable va l’examiner et vous contacter."] },
      thanks: { subject: (r) => `Nous avons bien reçu votre message (${r})`, heading: "Merci pour vos mots aimables", body: ["Votre message est bien parvenu à l’équipe de l’école. Nous le transmettrons aux personnes concernées."] },
    },
    application: {
      subject: (r) => `Nous avons bien reçu votre candidature (${r})`,
      heading: "Merci pour votre candidature",
      body: [
        "Nous avons bien reçu votre candidature et votre CV. Notre équipe étudie chaque candidature ; si votre profil correspond à un poste, nous vous contacterons.",
        "Nous ne conservons votre CV que pendant la durée indiquée dans notre politique de confidentialité.",
      ],
    },
  },
  ar: {
    "visit-booking": {
      subject: (r) => `وصلنا طلب زيارتكم (${r})`,
      heading: "شكرًا على طلب الزيارة",
      body: [`وصلنا طلبكم لزيارة ${schoolName.ar}. سيتواصل معكم فريق القبول لتأكيد اليوم والساعة.`],
    },
    "pre-registration": {
      subject: (r) => `وصلنا تسجيلكم المسبق (${r})`,
      heading: "شكرًا على التسجيل المسبق",
      body: ["وصلنا تسجيلكم المسبق. سيتصل بكم أحد أعضاء فريق القبول بخصوص الخطوات القادمة."],
    },
    contact: {
      subject: (r) => `وصلتنا رسالتكم (${r})`,
      heading: "شكرًا على رسالتكم",
      body: ["وصلتنا رسالتكم. سيجيبكم الشخص المعني في المدرسة في أقرب وقت ممكن."],
    },
    feedback: {
      suggestion: { subject: (r) => `وصلنا اقتراحكم (${r})`, heading: "شكرًا على اقتراحكم", body: ["وصل اقتراحكم إلى فريق المدرسة. نقرأ كل رسالة."] },
      complaint: { subject: (r) => `وصلتنا رسالتكم (${r})`, heading: "وصلنا انشغالكم", body: ["وصلت رسالتكم إلى فريق المدرسة. سيدرسها شخص مسؤول ويتواصل معكم."] },
      thanks: { subject: (r) => `وصلتنا رسالتكم (${r})`, heading: "شكرًا على كلماتكم الطيبة", body: ["وصلت رسالتكم إلى فريق المدرسة. سننقلها إلى الأشخاص المعنيين."] },
    },
    application: {
      subject: (r) => `وصلنا طلب التوظيف (${r})`,
      heading: "شكرًا على ترشحكم",
      body: ["وصلنا طلبكم وسيرتكم الذاتية. يدرس فريقنا كل طلب، وإذا كان ملفكم يناسب وظيفة متاحة فسنتواصل معكم.", "نحتفظ بسيرتكم الذاتية فقط للمدة المذكورة في سياسة الخصوصية."],
    },
  },
  tr: {
    "visit-booking": {
      subject: (r) => `Ziyaret talebinizi aldık (${r})`,
      heading: "Ziyaret talebiniz için teşekkürler",
      body: [`${schoolName.tr}’nı ziyaret talebinizi aldık. Kabul ekibimiz gün ve saati onaylamak için sizinle iletişime geçecek.`],
    },
    "pre-registration": {
      subject: (r) => `Ön kaydınızı aldık (${r})`,
      heading: "Ön kaydınız için teşekkürler",
      body: ["Ön kaydınızı aldık. Kabul ekibimizden biri sonraki adımlar için sizi arayacak."],
    },
    contact: {
      subject: (r) => `Mesajınızı aldık (${r})`,
      heading: "Mesajınız için teşekkürler",
      body: ["Mesajınızı aldık. Okulda ilgili kişi size en kısa sürede yanıt verecek."],
    },
    feedback: {
      suggestion: { subject: (r) => `Önerinizi aldık (${r})`, heading: "Öneriniz için teşekkürler", body: ["Öneriniz okul ekibine ulaştı. Her mesajı okuyoruz."] },
      complaint: { subject: (r) => `Mesajınızı aldık (${r})`, heading: "Endişenizi aldık", body: ["Mesajınız okul ekibine ulaştı. Sorumlu bir kişi konuyu inceleyip sizinle iletişime geçecek."] },
      thanks: { subject: (r) => `Mesajınızı aldık (${r})`, heading: "Güzel sözleriniz için teşekkürler", body: ["Mesajınız okul ekibine ulaştı. İlgili kişilerle paylaşacağız."] },
    },
    application: {
      subject: (r) => `Başvurunuzu aldık (${r})`,
      heading: "Başvurunuz için teşekkürler",
      body: [
        "Başvurunuzu ve özgeçmişinizi aldık. Ekibimiz her başvuruyu inceliyor; profiliniz açık bir pozisyona uyarsa sizinle iletişime geçeceğiz.",
        "Özgeçmişinizi yalnızca gizlilik bildirimimizde belirtilen süre boyunca saklıyoruz.",
      ],
    },
  },
};

export type FormReceivedData = {
  reference: string;
  name?: string;
  grade?: Grade;
  preferredDate?: string;
  preferredSlot?: "morning" | "afternoon";
  position?: string;
  feedbackKind?: FeedbackKind;
};

/** The automatic answer to a family or a candidate after a form (wave 4, B2). */
export function formReceived(kind: FormKind, locale: Locale, data: FormReceivedData): MailContent {
  const l = labels[locale];
  const r = kind === "feedback" ? received[locale].feedback[data.feedbackKind ?? "suggestion"] : received[locale][kind];
  const details = [{ label: l.reference, value: data.reference }];
  if (data.grade) {
    details.push({ label: l.grade, value: gradeName(data.grade, locale) });
    if (kind === "pre-registration" || kind === "visit-booking") details.push({ label: l.campus, value: campuses[campusOfGrade(data.grade)].name[locale] });
  }
  if (data.preferredDate) details.push({ label: l.preferredDate, value: formatDate(data.preferredDate, locale) });
  if (data.preferredSlot) details.push({ label: l.slot, value: l.slots[data.preferredSlot] });
  if (data.position) details.push({ label: l.position, value: data.position });
  const phone = data.grade ? campuses[campusOfGrade(data.grade)].phone : mainPhone;
  return {
    locale,
    subject: r.subject(data.reference),
    preheader: r.body[0],
    heading: r.heading,
    greeting: l.hello(data.name),
    paragraphs: r.body,
    details,
    after: kind === "application" ? [] : [l.changeOrCall(isolate(phone))],
    footerNote: l.formFooter,
  };
}

// ---- Visit confirmed by the admissions team (maarifcms, wave 4 B3) ----------------------------

const confirmed: Record<Locale, { subject: (d: string) => string; heading: string; body: (campus: string) => string }> = {
  en: { subject: (d) => `Your visit is confirmed: ${d}`, heading: "Your visit is confirmed", body: (c) => `We look forward to welcoming you at our ${c} campus.` },
  fr: { subject: (d) => `Votre visite est confirmée : ${d}`, heading: "Votre visite est confirmée", body: (c) => `Nous serons heureux de vous accueillir sur notre campus de ${c}.` },
  ar: { subject: (d) => `تم تأكيد زيارتكم: ${d}`, heading: "تم تأكيد زيارتكم", body: (c) => `يسعدنا استقبالكم في فرعنا في ${c}.` },
  tr: { subject: (d) => `Ziyaretiniz onaylandı: ${d}`, heading: "Ziyaretiniz onaylandı", body: (c) => `Sizi ${c} kampüsümüzde ağırlamaktan mutluluk duyacağız.` },
};

export function visitConfirmed(locale: Locale, data: { reference: string; name?: string; when: string; campus: CampusKey }): MailContent {
  const l = labels[locale];
  const c = confirmed[locale];
  const campus = campuses[data.campus];
  const date = formatDate(data.when, locale);
  return {
    locale,
    subject: c.subject(date),
    preheader: c.body(campus.name[locale]),
    heading: c.heading,
    greeting: l.hello(data.name),
    paragraphs: [c.body(campus.name[locale])],
    details: [
      { label: l.date, value: date },
      { label: l.time, value: formatTime(data.when, locale) },
      { label: l.campus, value: campus.name[locale] },
      { label: l.address, value: campus.address },
      { label: l.reference, value: data.reference },
    ],
    after: [l.cannotCome(isolate(campus.phone))],
    footerNote: l.formFooter,
  };
}

// ---- maarifcms accounts (wave 4 B3) ------------------------------------------------------------

const account: Record<
  Locale,
  {
    invite: { subject: string; heading: string; body: (email: string, hours: number) => string[]; button: string; after: string };
    reset: { subject: string; heading: string; body: (hours: number) => string[]; button: string; after: string };
  }
> = {
  en: {
    invite: {
      subject: "Your maarifcms account is ready",
      heading: "You have a maarifcms account",
      body: (e, h) => [`The school created a maarifcms account for you (${e}). maarifcms is where the team updates the school website.`, `Choose your password to sign in. The link works for ${h} hours.`],
      button: "Set your password",
      after: "If you did not expect this email, you can ignore it.",
    },
    reset: {
      subject: "Reset your maarifcms password",
      heading: "Reset your password",
      body: (h) => [`Someone asked to reset the password of your maarifcms account. If it was you, choose a new password with the button below. The link works for ${h} ${h === 1 ? "hour" : "hours"}.`],
      button: "Choose a new password",
      after: "If you did not ask for this, ignore this email: your password stays the same.",
    },
  },
  fr: {
    invite: {
      subject: "Votre compte maarifcms est prêt",
      heading: "Vous avez un compte maarifcms",
      body: (e, h) => [`L’école a créé pour vous un compte maarifcms (${e}). maarifcms est l’outil où l’équipe met à jour le site de l’école.`, `Choisissez votre mot de passe pour vous connecter. Le lien est valable ${h} heures.`],
      button: "Choisir mon mot de passe",
      after: "Si vous n’attendiez pas cet e-mail, vous pouvez l’ignorer.",
    },
    reset: {
      subject: "Réinitialiser votre mot de passe maarifcms",
      heading: "Réinitialiser votre mot de passe",
      body: (h) => [`Quelqu’un a demandé à réinitialiser le mot de passe de votre compte maarifcms. Si c’est vous, choisissez un nouveau mot de passe avec le bouton ci-dessous. Le lien est valable ${h} h.`],
      button: "Choisir un nouveau mot de passe",
      after: "Si vous n’avez rien demandé, ignorez cet e-mail : votre mot de passe ne change pas.",
    },
  },
  ar: {
    invite: {
      subject: "حسابكم في maarifcms جاهز",
      heading: "لديكم حساب في maarifcms",
      body: (e, h) => [`أنشأت المدرسة لكم حسابًا في maarifcms (${isolate(e)}). maarifcms هو المكان الذي يحدّث فيه الفريق موقع المدرسة.`, `اختاروا كلمة المرور لتسجيل الدخول. الرابط صالح لمدة ${h} ساعة.`],
      button: "اختيار كلمة المرور",
      after: "إذا لم تكونوا تنتظرون هذه الرسالة، يمكنكم تجاهلها.",
    },
    reset: {
      subject: "إعادة تعيين كلمة المرور في maarifcms",
      heading: "إعادة تعيين كلمة المرور",
      body: (h) => [`طلب شخص ما إعادة تعيين كلمة مرور حسابكم في maarifcms. إذا كنتم أنتم، اختاروا كلمة مرور جديدة بالزر أدناه. الرابط صالح لمدة ${h} ساعة.`],
      button: "اختيار كلمة مرور جديدة",
      after: "إذا لم تطلبوا ذلك، تجاهلوا هذه الرسالة: تبقى كلمة المرور كما هي.",
    },
  },
  tr: {
    invite: {
      subject: "maarifcms hesabınız hazır",
      heading: "Bir maarifcms hesabınız var",
      body: (e, h) => [`Okul sizin için bir maarifcms hesabı oluşturdu (${e}). maarifcms, ekibin okulun web sitesini güncellediği yerdir.`, `Giriş yapmak için şifrenizi belirleyin. Bağlantı ${h} saat geçerlidir.`],
      button: "Şifremi belirle",
      after: "Bu e-postayı beklemiyorsanız dikkate almayabilirsiniz.",
    },
    reset: {
      subject: "maarifcms şifrenizi sıfırlayın",
      heading: "Şifrenizi sıfırlayın",
      body: (h) => [`Biri maarifcms hesabınızın şifresini sıfırlamak istedi. Siz istediyseniz aşağıdaki düğmeyle yeni bir şifre belirleyin. Bağlantı ${h} saat geçerlidir.`],
      button: "Yeni şifre belirle",
      after: "Bunu siz istemediyseniz bu e-postayı dikkate almayın: şifreniz değişmez.",
    },
  },
};

export function accountInvite(locale: Locale, data: { email: string; name?: string; url: string; hours: number }): MailContent {
  const a = account[locale].invite;
  const body = a.body(data.email, data.hours);
  return { locale, subject: a.subject, preheader: body[1], heading: a.heading, greeting: labels[locale].hello(data.name), paragraphs: body, button: { label: a.button, url: data.url }, after: [a.after] };
}

export function passwordReset(locale: Locale, data: { name?: string; url: string; hours: number }): MailContent {
  const a = account[locale].reset;
  return { locale, subject: a.subject, heading: a.heading, greeting: labels[locale].hello(data.name), paragraphs: a.body(data.hours), button: { label: a.button, url: data.url }, after: [a.after] };
}

// ---- Newsletter (wave 4 B4) --------------------------------------------------------------------

const newsletter: Record<Locale, { subject: string; heading: string; body: string; button: string; after: string; footer: string }> = {
  en: {
    subject: "Please confirm your subscription",
    heading: "One more step",
    body: `Thank you for signing up for the newsletter of ${schoolName.en}. Please confirm your email address:`,
    button: "Confirm my subscription",
    after: "If you did not sign up, ignore this email: you will not receive anything.",
    footer: "You receive this newsletter because you subscribed on our website.",
  },
  fr: {
    subject: "Confirmez votre inscription",
    heading: "Encore une étape",
    body: `Merci pour votre inscription à la lettre d’information des ${schoolName.fr}. Confirmez votre adresse e-mail :`,
    button: "Confirmer mon inscription",
    after: "Si cette inscription ne vient pas de vous, ignorez cet e-mail : vous ne recevrez rien.",
    footer: "Vous recevez cette lettre suite à votre inscription sur notre site.",
  },
  ar: {
    subject: "يرجى تأكيد اشتراككم",
    heading: "خطوة أخيرة",
    body: `شكرًا على اشتراككم في النشرة الإخبارية ل${schoolName.ar}. يرجى تأكيد بريدكم الإلكتروني:`,
    button: "تأكيد الاشتراك",
    after: "إذا لم تشتركوا، تجاهلوا هذه الرسالة: لن يصلكم شيء.",
    footer: "تصلكم هذه النشرة لأنكم اشتركتم عبر موقعنا.",
  },
  tr: {
    subject: "Lütfen aboneliğinizi onaylayın",
    heading: "Son bir adım",
    body: `${schoolName.tr} bültenine kaydolduğunuz için teşekkürler. Lütfen e-posta adresinizi onaylayın:`,
    button: "Aboneliğimi onayla",
    after: "Kaydolmadıysanız bu e-postayı dikkate almayın: hiçbir şey almayacaksınız.",
    footer: "Bu bülteni web sitemizden abone olduğunuz için alıyorsunuz.",
  },
};

export function newsletterConfirm(locale: Locale, data: { url: string }): MailContent {
  const n = newsletter[locale];
  return { locale, subject: n.subject, preheader: n.body, heading: n.heading, paragraphs: [n.body], button: { label: n.button, url: data.url }, after: [n.after] };
}

export function newsletterIssue(locale: Locale, data: { subject: string; preheader?: string; blocks: RichBlock[]; unsubscribeUrl: string }): MailContent {
  return {
    locale,
    subject: data.subject,
    preheader: data.preheader,
    heading: data.subject,
    paragraphs: [],
    blocks: data.blocks,
    footerNote: newsletter[locale].footer,
    unsubscribeUrl: data.unsubscribeUrl,
  };
}

// ---- Staff (English: the admin's working language for notifications) ---------------------------

const staffWhat: Record<FormKind, string> = {
  "pre-registration": "New pre-registration",
  "visit-booking": "New visit request",
  contact: "New contact message",
  feedback: "New suggestion or concern from a parent",
  application: "New job application",
};

/** "A new entry arrived": names the kind and links to maarifcms; never any personal detail. */
export function staffNotification(kind: FormKind, data: { reference: string; url: string }): MailContent {
  return {
    locale: "en",
    subject: `${staffWhat[kind]} (#${data.reference})`,
    heading: staffWhat[kind],
    paragraphs: [`${staffWhat[kind]} arrived on the website (reference ${data.reference}).`],
    button: { label: "Open it in maarifcms", url: data.url },
    footerNote: "This email holds no personal details; they stay in maarifcms.",
  };
}

export function newsletterSent(data: { subject: string; sent: number; failed: number; url: string }): MailContent {
  return {
    locale: "en",
    subject: `Newsletter sent: ${data.subject}`,
    heading: "The newsletter has been sent",
    paragraphs: [`“${data.subject}” went to ${data.sent} subscriber${data.sent === 1 ? "" : "s"}.${data.failed ? ` ${data.failed} could not be delivered (those addresses are now unsubscribed).` : ""}`],
    button: { label: "Open it in maarifcms", url: data.url },
  };
}
