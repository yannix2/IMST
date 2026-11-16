import { ArrowUpRightIcon, MegaphoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { getNotice } from "@/lib/cms";

// The notice bar (wave 6): one short message from the school above the header of every page (a
// closure, a change of hours). Staff write it in maarifcms ("Notice bar"); it is in the page's
// HTML, so nothing moves when the page loads, and it scrolls away with the page. Madder is the
// site's notice colour (DESIGN.md); white on it is 7.6:1.
const label: Record<Locale, string> = { en: "School notice", fr: "Avis de l’école", ar: "إعلان من المدرسة", tr: "Okul duyurusu" };

export async function NoticeBar({ locale }: { locale: Locale }) {
  const notice = await getNotice(locale);
  if (!notice) return null;
  const external = notice.href?.startsWith("https://");
  const body = (
    <>
      <MegaphoneIcon aria-hidden="true" className="size-5 shrink-0 rtl:-scale-x-100" strokeWidth={1.75} />
      <span className="sr-only">{label[locale]}: </span>
      <span className="text-pretty">{notice.text}</span>
      {notice.href ? <ArrowUpRightIcon aria-hidden="true" className="size-4 shrink-0 rtl:-scale-x-100" /> : null}
    </>
  );
  const row = "mx-auto flex min-h-11 max-w-[var(--content-max)] items-center gap-3 px-[var(--gutter)] py-2 font-medium text-white";
  return (
    <aside aria-label={label[locale]} className="bg-notice">
      {notice.href ? (
        <a href={notice.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${row} underline decoration-white/50 underline-offset-4 hover:decoration-white`}>
          {body}
        </a>
      ) : (
        <p className={row}>{body}</p>
      )}
    </aside>
  );
}
