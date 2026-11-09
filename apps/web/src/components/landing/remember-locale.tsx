"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { localeCookie, type Locale } from "@maarif/contracts/locales";

// The cookie banner (wave 3, D5) loads after the visitor's first scroll, tap or key, or after four
// seconds: never during the page's first load (Home's 180 KB budget).
const Consent = dynamic(() => import("@/components/site/consent"), { ssr: false });
const wakeEvents = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

// Remembers the language this visitor reads in, so "/" brings them back to it.
// Set in the browser, never by the server, so static pages carry no Set-Cookie and stay cacheable.
// Also starts the cookie banner, which every page needs and which shows only when GA4 is set up.
export function RememberLocale({ locale }: { locale: Locale }) {
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
    const wake = () => setAwake(true);
    const timer = window.setTimeout(wake, 4000);
    for (const name of wakeEvents) window.addEventListener(name, wake, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const name of wakeEvents) window.removeEventListener(name, wake);
    };
  }, [locale]);
  return awake ? <Consent locale={locale} /> : null;
}
