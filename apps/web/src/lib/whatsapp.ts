import type { Locale } from "@maarif/contracts/locales";
import { pageNames } from "@/i18n/pages";
import { messages } from "@/i18n/messages";
import type { PageKey } from "./navigation";
import { whatsappHref } from "./school";

// A WhatsApp link whose first message already says what the parent is asking about, in their
// language: the page they were reading, or the grade they chose. Staff answer with context,
// and the parent does not have to type it on a phone.

export function whatsappForPage(locale: Locale, key: PageKey): string {
  return whatsappHref(pageNames[locale].ui.whatsappAbout(pageNames[locale].pages[key].title));
}

export function whatsappForGrade(locale: Locale, gradeName: string): string {
  return whatsappHref(messages[locale].station.whatsappMessage(gradeName));
}
