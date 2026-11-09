import { InboxIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { stages } from "@maarif/contracts/school";
import { cn } from "@/lib/utils";
import { SocialLinks } from "./social-links";

// Small pieces the wave 3 CMS pages share: dates in the page language (Western digits in Arabic,
// DESIGN.md), stage names, and the honest empty state shown while staff have published nothing.

const dateTag: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };

export function formatDate(locale: Locale, iso: string | null | undefined, withTime = false): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(dateTag[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Tunis",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

const stageNames: Record<Locale, Record<(typeof stages)[number], string>> = {
  en: { kindergarten: "Kindergarten", primary: "Primary", "lower-secondary": "Lower secondary", "upper-secondary": "Upper secondary" },
  fr: { kindergarten: "Maternelle", primary: "Primaire", "lower-secondary": "Collège", "upper-secondary": "Lycée" },
  ar: { kindergarten: "الروضة", primary: "الابتدائي", "lower-secondary": "الإعدادي", "upper-secondary": "الثانوي" },
  tr: { kindergarten: "Anaokulu", primary: "İlkokul", "lower-secondary": "Ortaokul", "upper-secondary": "Lise" },
};

export function stageName(locale: Locale, stage: string): string {
  return (stageNames[locale] as Record<string, string>)[stage] ?? stage;
}

export function StageTags({ locale, list, className }: { locale: Locale; list: string[]; className?: string }) {
  if (list.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {list.map((s) => (
        <li key={s} className="rounded-full bg-turquoise-wash px-3 py-0.5 text-sm font-medium text-heading">
          {stageName(locale, s)}
        </li>
      ))}
    </ul>
  );
}

// Nothing published yet: say so plainly, and point to the school's social accounts where news
// already appears. Never a placeholder that looks like real content.
export function EmptyState({ text, socialLabel, className }: { text: string; socialLabel?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-5 rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8", className)}>
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-[var(--radius-tile)] bg-turquoise-wash text-heading">
        <InboxIcon className="size-6" strokeWidth={1.75} />
      </span>
      <p className="max-w-[56ch] text-lg text-ink">{text}</p>
      {socialLabel ? <SocialLinks label={socialLabel} tone="ground" /> : null}
    </div>
  );
}
