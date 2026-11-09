import type { Locale } from "@maarif/contracts/locales";
import { getCmsPage } from "@/lib/cms";
import { schoolEmail } from "@/lib/school";
import { PageShell } from "@/components/site/page-shell";
import { PageSection } from "@/components/site/blocks";
import { RichText } from "@/components/site/rich-text";
import { formatDate } from "@/components/site/cms-bits";

// Privacy, Cookies and Terms (wave 3, D5). Their text lives in maarifcms Pages (slug = page key),
// drafted under Tunisian law 2004-63 and published after the lawyer's review. Until then the page
// says so and gives the school's address for any question about personal data.

type LegalKey = "privacy" | "cookies" | "terms";

const words: Record<Locale, { updated: string; pending: (email: string) => string }> = {
  en: { updated: "Last updated", pending: (email) => `This notice is being finalised. For any question about your personal data or this website, write to ${email}.` },
  fr: { updated: "Dernière mise à jour", pending: (email) => `Ce texte est en cours de finalisation. Pour toute question sur vos données personnelles ou sur ce site, écrivez à ${email}.` },
  ar: { updated: "آخر تحديث", pending: (email) => `هذا النص قيد الإعداد النهائي. لأي سؤال حول معطياتكم الشخصية أو هذا الموقع، راسلوا ${email}.` },
  tr: { updated: "Son güncelleme", pending: (email) => `Bu metin son haline getiriliyor. Kişisel verileriniz veya bu site hakkındaki her soru için ${email} adresine yazın.` },
};

async function LegalPage({ locale, page }: { locale: Locale; page: LegalKey }) {
  const w = words[locale];
  const doc = await getCmsPage(locale, page);
  return (
    <PageShell
      locale={locale}
      page={page}
      title={doc?.title || undefined}
      photo={null}
      band={false}
      body={
        <PageSection id="legal-text">
          {doc && doc.body.length ? (
            <>
              <RichText blocks={doc.body} />
              {doc.updatedAt ? (
                <p className="mt-10 text-sm text-slate">
                  {w.updated}: {formatDate(locale, doc.updatedAt)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="max-w-[60ch] text-lg text-ink">{w.pending(schoolEmail)}</p>
          )}
        </PageSection>
      }
    />
  );
}

export const PrivacyPage = ({ locale }: { locale: Locale }) => <LegalPage locale={locale} page="privacy" />;
export const CookiesPage = ({ locale }: { locale: Locale }) => <LegalPage locale={locale} page="cookies" />;
export const TermsPage = ({ locale }: { locale: Locale }) => <LegalPage locale={locale} page="terms" />;
