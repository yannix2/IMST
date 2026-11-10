"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import { loadTurnstile, TURNSTILE_SITE_KEY } from "./turnstile";

// The Turnstile check of every public form: renders the widget into `ref` once the form is on
// screen and keeps the latest token. Give the `ref` element `min-h-[65px]` (the widget's height)
// so nothing shifts when it appears.
// `failed` = no check is possible (no site key in this build, or the script could not load): the
// form shows the phone and WhatsApp instead. `reset()` asks for a fresh token: a token is single
// use, so call it after any answer other than "invalid" (the API checks fields first).
// Options: `enabled: false` waits (the footer sign-up starts the check only once someone types);
// `theme` forces the widget's look (dark on the navy footer); by default it follows the site theme.
export function useTurnstile(locale: Locale, { enabled = true, theme }: { enabled?: boolean; theme?: "light" | "dark" } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | undefined>(undefined);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(!TURNSTILE_SITE_KEY);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !enabled) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetRef.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: locale,
          theme: theme ?? (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
          callback: (value: string) => setToken(value),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = undefined;
    };
  }, [locale, enabled, theme]);

  const reset = useCallback(() => {
    setToken("");
    if (widgetRef.current && window.turnstile) window.turnstile.reset(widgetRef.current);
  }, []);

  return { ref, token, failed, reset };
}
