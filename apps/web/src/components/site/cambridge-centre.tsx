"use client";

import { useEffect, useState } from "react";
import { BadgeCheckIcon } from "lucide-react";
import type { CambridgeCentre as Centre } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { loadAboutContent } from "@/lib/about-content";
import { showPreviews } from "@/lib/home-content";

// The Cambridge centre number, shown only once the school enters it in maarifcms (global
// "school-facts"). Until then nothing renders in production; development shows a marked
// placeholder so the owner sees where it will appear.

const words: Record<Locale, { centre: string; since: (y: string) => string }> = {
  en: { centre: "Cambridge centre number", since: (y) => `since ${y}` },
  fr: { centre: "Numéro de centre Cambridge", since: (y) => `depuis ${y}` },
  ar: { centre: "رقم مركز كامبريدج", since: (y) => `منذ ${y}` },
  tr: { centre: "Cambridge merkez numarası", since: (y) => `${y} yılından beri` },
};

export function CambridgeCentre({ locale }: { locale: Locale }) {
  const [centre, setCentre] = useState<Centre | null>(null);

  useEffect(() => {
    let live = true;
    void loadAboutContent(locale).then((content) => {
      if (!live) return;
      if (content?.cambridgeCentre) setCentre(content.cambridgeCentre);
      else if (!content && showPreviews) setCentre({ number: "[centre number]", since: "[year]" });
    });
    return () => {
      live = false;
    };
  }, [locale]);

  if (!centre) return null;
  const w = words[locale];
  return (
    <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm text-ink ring-1 ring-rule/70">
      <BadgeCheckIcon aria-hidden="true" className="size-4 text-turquoise-ink" />
      <span>{w.centre}</span>
      <span dir="ltr" className="tabular font-bold text-heading">
        {centre.number}
      </span>
      {centre.since ? <span className="text-slate">{w.since(centre.since)}</span> : null}
    </p>
  );
}
