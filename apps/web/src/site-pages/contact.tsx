import { MailIcon, MessageCircleIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { pageNames } from "@/i18n/pages";
import { schoolEmail } from "@/lib/school";
import { socialAccounts } from "@/lib/social";
import { whatsappForPage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Campuses } from "@/components/landing/campuses";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { SocialMark } from "@/components/site/social-links";
import { contactFigure } from "./figures";

// Contact: the Home page's globe and campus cards (phones, directions, email), then WhatsApp,
// email and every social account with its handle.

const copy: Record<Locale, { lede: string; reachTitle: string; whatsappText: string; emailText: string }> = {
  en: { lede: "Two campuses in Greater Tunis. Call, write on WhatsApp or come and see us.", reachTitle: "Other ways to reach us", whatsappText: "The quickest answer, in your language.", emailText: "For documents and longer questions." },
  fr: { lede: "Deux campus dans le Grand Tunis. Appelez, écrivez-nous sur WhatsApp ou venez nous voir.", reachTitle: "Autres moyens de nous joindre", whatsappText: "La réponse la plus rapide, dans votre langue.", emailText: "Pour les documents et les questions plus longues." },
  ar: { lede: "فرعان في تونس الكبرى. اتصلوا بنا، أو راسلونا على واتساب، أو تعالوا لزيارتنا.", reachTitle: "طرق أخرى للتواصل معنا", whatsappText: "أسرع جواب، بلغتكم.", emailText: "للوثائق والأسئلة المطوّلة." },
  tr: { lede: "Büyük Tunus’ta iki kampüs. Arayın, WhatsApp’tan yazın ya da bizi görmeye gelin.", reachTitle: "Bize ulaşmanın diğer yolları", whatsappText: "Kendi dilinizde en hızlı yanıt.", emailText: "Belgeler ve uzun sorular için." },
};

export function ContactPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const t = messages[locale];
  const p = pageNames[locale];
  return (
    <PageShell
      locale={locale}
      page="contact"
      lede={c.lede}
      figure={contactFigure(locale)}
      body={
        <>
          <Campuses locale={locale} />
          <PageSection id="reach" title={c.reachTitle}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <article className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70">
                <MessageCircleIcon aria-hidden="true" className="size-8 text-turquoise-ink" strokeWidth={1.75} />
                <h3 className="text-xl font-bold text-heading">{t.station.whatsapp}</h3>
                <p className="text-slate">{c.whatsappText}</p>
                <Button asChild size="lg" className="mt-auto w-fit">
                  <a href={whatsappForPage(locale, "contact")} target="_blank" rel="noopener noreferrer">
                    <MessageCircleIcon data-icon="inline-start" />
                    {t.station.whatsapp}
                  </a>
                </Button>
              </article>
              <article className="flex flex-col gap-4 rounded-[var(--radius-plate)] bg-surface p-7 shadow-rest ring-1 ring-rule/70">
                <MailIcon aria-hidden="true" className="size-8 text-turquoise-ink" strokeWidth={1.75} />
                <h3 className="text-xl font-bold text-heading">{t.campuses.email}</h3>
                <p className="text-slate">{c.emailText}</p>
                <a href={`mailto:${schoolEmail}`} className="mt-auto break-all text-lg font-medium text-turquoise-ink">
                  {schoolEmail}
                </a>
              </article>
              <article className="flex min-w-0 flex-col gap-4 rounded-[var(--radius-plate)] bg-mist p-7">
                <h3 className="text-xl font-bold text-heading">{p.ui.followUs}</h3>
                <ul aria-label={p.ui.social} className="flex flex-col gap-1">
                  {socialAccounts.map((a) => (
                    <li key={a.key}>
                      <a
                        href={a.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-3 rounded-full px-2 text-ink no-underline transition-colors hover:bg-surface"
                      >
                        <SocialMark name={a.key} className="text-heading" />
                        <span className="font-medium text-heading">{a.name}</span>
                        <span dir="ltr" className="min-w-0 truncate text-sm text-slate">
                          {a.handle}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </PageSection>
        </>
      }
    />
  );
}

export const description = (locale: Locale) => copy[locale].lede;
