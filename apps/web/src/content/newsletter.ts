import type { Locale } from "@maarif/contracts/locales";

// Newsletter texts (wave 4, B4): the footer sign-up and the confirm / unsubscribe pages.
// No promised frequency: the school has not decided one.

type Copy = {
  heading: string;
  text: string;
  email: string;
  consent: string;
  privacy: string;
  send: string;
  sending: string;
  sent: string;
  unavailable: string;
  confirmed: { ok: [string, string]; invalid: [string, string]; error: [string, string] };
  unsubscribe: { title: string; text: string; button: string; done: [string, string]; invalid: [string, string]; error: string };
  home: string;
};

export const newsletterCopy: Record<Locale, Copy> = {
  en: {
    heading: "Newsletter",
    text: "News and events from the school, by email. Unsubscribe in one click at any time.",
    email: "Your email",
    consent: "I agree to receive the school’s newsletter by email. My address is used for nothing else.",
    privacy: "Privacy notice",
    send: "Sign up",
    sending: "Sending…",
    sent: "Almost done: we sent you an email. Click the link in it to confirm your subscription.",
    unavailable: "Sign-up is not available right now. Please try again later.",
    confirmed: {
      ok: ["Your subscription is confirmed", "Thank you. You will receive the school’s newsletter at this address. Every email has a link to unsubscribe."],
      invalid: ["This link does not work", "It may be old or already used. You can sign up again at the bottom of any page."],
      error: ["We could not confirm right now", "Please open the link in the email again in a few minutes."],
    },
    unsubscribe: {
      title: "Unsubscribe from the newsletter",
      text: "Press the button to stop receiving the school’s newsletter.",
      button: "Unsubscribe",
      done: ["You are unsubscribed", "You will receive no more newsletters at this address."],
      invalid: ["This link does not work", "Open the unsubscribe link of a recent newsletter, or write to us and we will remove your address."],
      error: "The server did not answer. Please try again in a few minutes.",
    },
    home: "Back to the home page",
  },
  fr: {
    heading: "Lettre d’information",
    text: "Les nouvelles et les événements de l’école, par e-mail. Désinscription en un clic à tout moment.",
    email: "Votre e-mail",
    consent: "J’accepte de recevoir la lettre d’information de l’école par e-mail. Mon adresse ne sert à rien d’autre.",
    privacy: "Politique de confidentialité",
    send: "S’inscrire",
    sending: "Envoi…",
    sent: "C’est presque fini : nous vous avons envoyé un e-mail. Cliquez sur le lien qu’il contient pour confirmer votre inscription.",
    unavailable: "L’inscription n’est pas disponible pour le moment. Merci de réessayer plus tard.",
    confirmed: {
      ok: ["Votre inscription est confirmée", "Merci. Vous recevrez la lettre d’information de l’école à cette adresse. Chaque e-mail contient un lien pour vous désinscrire."],
      invalid: ["Ce lien ne fonctionne pas", "Il est peut-être ancien ou déjà utilisé. Vous pouvez vous réinscrire en bas de chaque page."],
      error: ["Nous n’avons pas pu confirmer pour le moment", "Merci de rouvrir le lien de l’e-mail dans quelques minutes."],
    },
    unsubscribe: {
      title: "Se désinscrire de la lettre d’information",
      text: "Appuyez sur le bouton pour ne plus recevoir la lettre d’information de l’école.",
      button: "Me désinscrire",
      done: ["Vous êtes désinscrit", "Vous ne recevrez plus de lettre d’information à cette adresse."],
      invalid: ["Ce lien ne fonctionne pas", "Ouvrez le lien de désinscription d’une lettre récente, ou écrivez-nous et nous retirerons votre adresse."],
      error: "Le serveur n’a pas répondu. Merci de réessayer dans quelques minutes.",
    },
    home: "Retour à l’accueil",
  },
  ar: {
    heading: "النشرة الإخبارية",
    text: "أخبار المدرسة وفعالياتها عبر البريد الإلكتروني. يمكنكم إلغاء الاشتراك بنقرة واحدة في أي وقت.",
    email: "بريدكم الإلكتروني",
    consent: "أوافق على تلقي النشرة الإخبارية للمدرسة عبر البريد الإلكتروني. لا يُستعمل عنواني لأي غرض آخر.",
    privacy: "سياسة الخصوصية",
    send: "اشتراك",
    sending: "جارٍ الإرسال…",
    sent: "اقتربنا: أرسلنا إليكم رسالة. انقروا على الرابط الذي فيها لتأكيد اشتراككم.",
    unavailable: "الاشتراك غير متاح حاليًا. يرجى المحاولة لاحقًا.",
    confirmed: {
      ok: ["تم تأكيد اشتراككم", "شكرًا. ستصلكم النشرة الإخبارية للمدرسة على هذا العنوان. في كل رسالة رابط لإلغاء الاشتراك."],
      invalid: ["هذا الرابط لا يعمل", "ربما يكون قديمًا أو مستعملًا. يمكنكم الاشتراك من جديد في أسفل أي صفحة."],
      error: ["تعذّر التأكيد حاليًا", "يرجى فتح الرابط الموجود في الرسالة من جديد بعد بضع دقائق."],
    },
    unsubscribe: {
      title: "إلغاء الاشتراك في النشرة الإخبارية",
      text: "اضغطوا على الزر لكي لا تصلكم النشرة الإخبارية للمدرسة بعد الآن.",
      button: "إلغاء الاشتراك",
      done: ["تم إلغاء اشتراككم", "لن تصلكم نشرات أخرى على هذا العنوان."],
      invalid: ["هذا الرابط لا يعمل", "افتحوا رابط إلغاء الاشتراك في نشرة حديثة، أو راسلونا وسنحذف عنوانكم."],
      error: "لم يستجب الخادم. يرجى المحاولة بعد بضع دقائق.",
    },
    home: "العودة إلى الصفحة الرئيسية",
  },
  tr: {
    heading: "Bülten",
    text: "Okulun haberleri ve etkinlikleri e-postanızda. İstediğiniz zaman tek tıkla abonelikten çıkabilirsiniz.",
    email: "E-posta adresiniz",
    consent: "Okulun bültenini e-postayla almayı kabul ediyorum. Adresim başka hiçbir şey için kullanılmaz.",
    privacy: "Gizlilik bildirimi",
    send: "Abone ol",
    sending: "Gönderiliyor…",
    sent: "Neredeyse bitti: size bir e-posta gönderdik. Aboneliğinizi onaylamak için içindeki bağlantıya tıklayın.",
    unavailable: "Abonelik şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
    confirmed: {
      ok: ["Aboneliğiniz onaylandı", "Teşekkürler. Okulun bültenini bu adrese alacaksınız. Her e-postada abonelikten çıkma bağlantısı var."],
      invalid: ["Bu bağlantı çalışmıyor", "Eski ya da daha önce kullanılmış olabilir. Herhangi bir sayfanın altından yeniden abone olabilirsiniz."],
      error: ["Şu anda onaylayamadık", "Lütfen birkaç dakika sonra e-postadaki bağlantıyı yeniden açın."],
    },
    unsubscribe: {
      title: "Bülten aboneliğinden çık",
      text: "Okulun bültenini artık almamak için düğmeye basın.",
      button: "Abonelikten çık",
      done: ["Abonelikten çıktınız", "Bu adrese artık bülten gönderilmeyecek."],
      invalid: ["Bu bağlantı çalışmıyor", "Yakın tarihli bir bültenin abonelikten çıkma bağlantısını açın ya da bize yazın, adresinizi silelim."],
      error: "Sunucu yanıt vermedi. Lütfen birkaç dakika sonra tekrar deneyin.",
    },
    home: "Ana sayfaya dön",
  },
};
