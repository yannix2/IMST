"use client";

// The footer's newsletter sign-up (wave 4, B4). This stub is all that ships with every page: the
// form (fields, Turnstile, messages) is its own chunk, fetched when the footer comes within reach.
// The slot keeps the form's height, so nothing moves when it arrives.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";

const NewsletterForm = dynamic(() => import("./newsletter-form"), { ssr: false });

export function NewsletterSlot({ locale, privacyHref, privacyLabel }: { locale: Locale; privacyHref: string; privacyLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[13.5rem] sm:min-h-[10.5rem]">
      {near ? <NewsletterForm locale={locale} privacyHref={privacyHref} privacyLabel={privacyLabel} /> : null}
    </div>
  );
}
