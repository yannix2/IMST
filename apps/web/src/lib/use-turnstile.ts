"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import { loadTurnstile, TURNSTILE_SITE_KEY } from "./turnstile";

// The Turnstile check of a public form (wave 3 forms): renders the widget into `ref` once the
// form is on screen and keeps the latest token. `failed` = the script could not load.
export function useTurnstile(locale: Locale) {
  const ref = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let widget: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widget = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: locale,
          theme: "light",
          callback: (value: string) => setToken(value),
          "expired-callback": () => setToken(""),
        });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [locale]);

  return { ref, token, failed };
}
