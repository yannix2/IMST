"use client";

import { useEffect } from "react";
import { localeCookie, type Locale } from "@maarif/contracts/locales";

// Remembers the language this visitor reads in, so "/" brings them back to it.
// Set in the browser, never by the server, so static pages carry no Set-Cookie and stay cacheable.
export function RememberLocale({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  }, [locale]);
  return null;
}
