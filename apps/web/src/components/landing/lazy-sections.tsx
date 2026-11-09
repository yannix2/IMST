"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@maarif/contracts/locales";

// The head's message and today's menu read live content, far down the page. Their code is its
// own chunk, fetched only when the visitor comes within a screen or so of them, so the first
// screen never pays for it. The anchor (#canteen) lives here, so the menu link works at once.
const HeadMessage = dynamic(() => import("./head-message").then((m) => m.HeadMessage), { ssr: false });
const TodaysMenu = dynamic(() => import("./todays-menu").then((m) => m.TodaysMenu), { ssr: false });
const GallerySection = dynamic(() => import("./home-sections").then((m) => m.GallerySection), { ssr: false });
const TestimonialsSection = dynamic(() => import("./home-sections").then((m) => m.TestimonialsSection), { ssr: false });
const NewsSection = dynamic(() => import("./home-sections").then((m) => m.NewsSection), { ssr: false });
const FaqSection = dynamic(() => import("./home-sections").then((m) => m.FaqSection), { ssr: false });

export function useNear<T extends HTMLElement>(margin: string) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        watch.disconnect();
        setNear(true);
      },
      { rootMargin: margin },
    );
    watch.observe(el);
    // Arriving by the menu link: load at once.
    const onHash = () => location.hash === `#${el.id}` && setNear(true);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      watch.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [margin]);
  return [ref, near] as const;
}

export function LazyHeadMessage({ locale }: { locale: Locale }) {
  const [ref, near] = useNear<HTMLDivElement>("1000px 0px");
  return <div ref={ref}>{near ? <HeadMessage locale={locale} /> : null}</div>;
}

export function LazyTodaysMenu({ locale }: { locale: Locale }) {
  const [ref, near] = useNear<HTMLDivElement>("900px 0px");
  // The space stays reserved while the code and the menu load (the loaded section is at least
  // this tall), so nothing below it moves.
  return (
    <div ref={ref} id="canteen" className="min-h-[38rem] scroll-mt-6 lg:min-h-[27rem]">
      {near ? <TodaysMenu locale={locale} /> : null}
    </div>
  );
}

// The sections staff fill in maarifcms (gallery, testimonials, news, questions): nothing is
// reserved, because each stays absent until the school publishes something. They load well
// ahead of the screen, so a section that does appear is in place before it is reached.
function lazy(Section: React.ComponentType<{ locale: Locale }>) {
  return function Lazy({ locale }: { locale: Locale }) {
    const [ref, near] = useNear<HTMLDivElement>("1200px 0px");
    return <div ref={ref}>{near ? <Section locale={locale} /> : null}</div>;
  };
}
export const LazyGallery = lazy(GallerySection);
export const LazyTestimonials = lazy(TestimonialsSection);
export const LazyNews = lazy(NewsSection);
export const LazyFaq = lazy(FaqSection);
