"use client";

// The Contact page's "Write to us" form (wave 6). Only this stub ships with the page: the form
// (fields, Turnstile, messages) is its own chunk, fetched when the section comes within reach.
// The slot keeps the form's height, so nothing moves when it arrives (same idea as
// newsletter-slot.tsx). The reserved heights are the form measured on 2026-11-16 (999 px at 390,
// 830 at 640, 778 at 768 and wider). Once the form is there the slot takes the form's own height,
// so a narrower phone (up to 1071 px at 320) or a later change of fields leaves no gap.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";
import type { ContactFormCopy } from "./contact-form";

const ContactForm = dynamic(() => import("./contact-form"), { ssr: false });

export function ContactFormSlot({ locale, copy }: { locale: Locale; copy: ContactFormCopy }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), { rootMargin: "800px 0px" });
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  return (
    <div ref={ref} className={ready ? undefined : "min-h-[62.5rem] sm:min-h-[52rem] md:min-h-[49rem]"}>
      {near ? <ContactForm locale={locale} copy={copy} onReady={() => setReady(true)} /> : null}
    </div>
  );
}
