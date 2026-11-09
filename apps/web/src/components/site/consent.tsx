"use client";

// Cookie consent and Google Analytics 4 (wave 3, ADR 010; Tunisian law 2004-63). Loaded after the
// page is up (remember-locale.tsx), so it costs nothing on first load. It does nothing at all until
// staff enter a GA4 measurement ID in maarifcms > Site settings: without analytics the site sets no
// tracking cookie, so there is nothing to ask. Then:
//  - first visit: a banner with Accept and Refuse given the same weight, and a link to the cookie
//    notice; nothing from Google loads before Accept (Consent Mode v2, everything denied by default);
//  - the choice is kept in this browser; "Cookie settings" in the footer opens the banner again.
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import { Button } from "@/components/ui/button";

const KEY = "maarif-consent-v1";
type Choice = "granted" | "denied";

const words: Record<Locale, { title: string; text: string; accept: string; refuse: string; notice: string }> = {
  en: {
    title: "Cookies",
    text: "With your permission, the school measures visits to this site with Google Analytics to improve it. Nothing is measured if you refuse.",
    accept: "Accept",
    refuse: "Refuse",
    notice: "Cookie notice",
  },
  fr: {
    title: "Cookies",
    text: "Avec votre accord, l’école mesure les visites de ce site avec Google Analytics pour l’améliorer. Rien n’est mesuré si vous refusez.",
    accept: "Accepter",
    refuse: "Refuser",
    notice: "Politique de cookies",
  },
  ar: {
    title: "ملفات تعريف الارتباط",
    text: "بموافقتكم، تقيس المدرسة زيارات هذا الموقع عبر Google Analytics لتحسينه. لا يُقاس أي شيء إذا رفضتم.",
    accept: "قبول",
    refuse: "رفض",
    notice: "سياسة ملفات تعريف الارتباط",
  },
  tr: {
    title: "Çerezler",
    text: "İzninizle okul, siteyi geliştirmek için ziyaretleri Google Analytics ile ölçer. Reddederseniz hiçbir şey ölçülmez.",
    accept: "Kabul et",
    refuse: "Reddet",
    notice: "Çerez bildirimi",
  },
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // Private mode: the choice holds for this visit only.
  }
}

// gtag.js reads the `arguments` object itself, not an array: Google's snippet, typed.
const gtag = function () {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
} as (...args: unknown[]) => void;

let loaded = false;
function startAnalytics(id: string) {
  if (loaded) return;
  loaded = true;
  window.gtag = gtag;
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export default function Consent({ locale }: { locale: Locale }) {
  const w = words[locale];
  const [id, setId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/content/site-config")
      .then((r) => (r.ok ? (r.json() as Promise<{ gaMeasurementId?: string | null }>) : null))
      .then((config) => {
        const gaId = config?.gaMeasurementId ?? null;
        if (!live || !gaId) return;
        setId(gaId);
        const choice = readChoice();
        if (choice === "granted") startAnalytics(gaId);
        if (choice === null) setOpen(true);
        // The footer's "Cookie settings" button exists in every page's HTML, hidden until now.
        document.querySelectorAll<HTMLElement>("[data-cookie-settings]").forEach((el) => (el.hidden = false));
      })
      .catch(() => {});
    const reopen = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("[data-cookie-settings]")) setOpen(true);
    };
    document.addEventListener("click", reopen);
    return () => {
      live = false;
      document.removeEventListener("click", reopen);
    };
  }, []);

  const decide = useCallback(
    (choice: Choice) => {
      saveChoice(choice);
      setOpen(false);
      if (choice === "granted" && id) startAnalytics(id);
      // Refusing after accepting: stop measuring now; the page reload clears Google's script.
      if (choice === "denied" && loaded) window.gtag?.("consent", "update", { analytics_storage: "denied" });
    },
    [id],
  );

  if (!open || !id) return null;
  return (
    <section
      aria-labelledby="consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-[var(--radius-plate)] bg-surface p-5 shadow-raised ring-1 ring-rule animate-in fade-in slide-in-from-bottom-3 duration-300 sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2 id="consent-title" className="font-heading text-lg font-bold text-heading">
        {w.title}
      </h2>
      <p className="mt-2 text-ink">{w.text}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={() => decide("granted")}>
          {w.accept}
        </Button>
        <Button type="button" variant="outline" onClick={() => decide("denied")}>
          {w.refuse}
        </Button>
        <a href={`/${locale}/cookies`} className="text-turquoise-ink underline underline-offset-2 sm:ms-auto">
          {w.notice}
        </a>
      </div>
    </section>
  );
}
