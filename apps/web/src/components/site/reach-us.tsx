// What a form shows when it cannot send online (no Turnstile key in this build, the check could
// not load, or maarif-api is unavailable): the school's phone and WhatsApp, so a family is never
// stuck. Imported by client forms; no state of its own.
import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { campuses, telHref, whatsappHref } from "@/lib/school";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const unavailable: Record<Locale, string> = {
  en: "Online sending is not available right now. Call us or send a WhatsApp message and we will help you straight away.",
  fr: "L’envoi en ligne n’est pas disponible pour le moment. Appelez-nous ou envoyez un message WhatsApp et nous vous aidons tout de suite.",
  ar: "الإرسال عبر الإنترنت غير متاح حاليًا. اتصلوا بنا أو أرسلوا رسالة واتساب وسنساعدكم فورًا.",
  tr: "Çevrim içi gönderim şu anda kullanılamıyor. Bizi arayın veya WhatsApp’tan yazın, size hemen yardımcı olalım.",
};

type Props = {
  locale: Locale;
  // The sentence above the buttons (the visit form says "Online booking opens soon").
  text?: string;
  // The WhatsApp message's subject (a grade name, a position); the school's name by default.
  topic?: string;
  phone?: string;
  className?: string;
};

export function ReachUs({ locale, text, topic, phone = campuses.schools.phones[0], className }: Props) {
  const t = messages[locale];
  return (
    <Alert className={className}>
      <AlertDescription className="text-base">
        {text ?? unavailable[locale]}
        <span className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={telHref(phone)}>
              <PhoneIcon data-icon="inline-start" />
              <span className="tabular" dir="ltr">
                {phone}
              </span>
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={whatsappHref(t.station.whatsappMessage(topic || t.schoolName))} target="_blank" rel="noopener noreferrer">
              <MessageCircleIcon data-icon="inline-start" />
              {t.station.whatsapp}
            </a>
          </Button>
        </span>
      </AlertDescription>
    </Alert>
  );
}
