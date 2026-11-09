"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, MessageCircleIcon, NewspaperIcon, PlusIcon } from "lucide-react";
import type { FaqItem, GalleryImage, HomeContent, NewsItem, Testimonial } from "@maarif/contracts/content";
import { localeDirection, type Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { loadHomeContent, showPreviews } from "@/lib/home-content";
import { whatsappHref } from "@/lib/school";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CoverflowCarousel } from "@/components/twentyfirst/coverflow-carousel";

// The Home sections staff fill in maarifcms: gallery, testimonials, news and questions. This
// file is its own chunk (lazy-sections.tsx). Each section renders nothing until maarif-api
// returns published items; in development, without maarif-api, each shows a marked preview
// made only of placeholders, never of invented content.

type Pick<T> = (content: HomeContent) => T[];

function useHomeList<T>(locale: Locale, pick: Pick<T>, preview: () => T[]) {
  const [state, setState] = useState<{ items: T[]; isPreview: boolean }>({ items: [], isPreview: false });
  useEffect(() => {
    let live = true;
    void loadHomeContent(locale).then((content) => {
      if (!live) return;
      if (content) setState({ items: pick(content), isPreview: false });
      else if (showPreviews) setState({ items: preview(), isPreview: true });
    });
    return () => {
      live = false;
    };
    // pick and preview are module-level functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);
  return state;
}

function PreviewChip({ text }: { text: string }) {
  return <p className="mb-4 inline-block rounded-full bg-notice px-3 py-1 text-sm font-bold text-white">{text}</p>;
}

const dateTag: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-TN-u-nu-latn", tr: "tr-TR" };
const formatDate = (locale: Locale, iso: string) =>
  new Intl.DateTimeFormat(dateTag[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

function Heading({ id, title, lede, tone = "ground" }: { id: string; title: string; lede: string; tone?: "ground" | "plate" }) {
  return (
    <>
      <h2 id={id} className={cn("text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance", tone === "plate" ? "text-white" : "text-heading")}>
        {title}
      </h2>
      <p className={cn("mt-2 max-w-[56ch] text-lg", tone === "plate" ? "text-on-plate-muted" : "text-slate")}>{lede}</p>
    </>
  );
}

// ---- Gallery -----------------------------------------------------------------------------

// Development placeholders: flat tiles in the level colours, no text, no faces.
const tile = (fill: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="${fill}"/><circle cx="5" cy="5" r="2" fill="#ffffff" opacity=".35"/></svg>`)}`;
const galleryPreview = (): GalleryImage[] =>
  ["#103b65", "#f2b705", "#5baa3c", "#e8684a", "#00adbb", "#0b2a47"].map((c, i) => ({ id: String(i), src: tile(c), alt: "[Photo from maarifcms]", caption: "[Caption]" }));

export function GallerySection({ locale }: { locale: Locale }) {
  const t = messages[locale].gallery;
  const { items, isPreview } = useHomeList(locale, (c) => c.gallery, galleryPreview);
  if (items.length < 3) return null;
  return (
    <section aria-labelledby="gallery-title" className="overflow-hidden bg-mist py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        {isPreview ? <PreviewChip text="Preview: photos from maarifcms" /> : null}
        <Heading id="gallery-title" title={t.title} lede={t.lede} />
      </div>
      <CoverflowCarousel
        className="mt-4"
        slides={items.map((p) => ({ src: p.src, alt: p.alt, title: p.caption || undefined }))}
        label={t.label}
        previousLabel={t.previous}
        nextLabel={t.next}
        slideLabel={(n, of) => `${n} / ${of}`}
      />
    </section>
  );
}

// ---- Testimonials ------------------------------------------------------------------------

const testimonialPreview = (): Testimonial[] =>
  [1, 2, 3].map((n) => ({ id: String(n), quote: `[A parent's or student's own words, published with written permission, number ${n}.]`, name: "[Name]", role: "[Role]", kind: n === 2 ? "student" : "parent" }));

/** The quote rises word by word when it changes (words, not letters, so Arabic keeps its joins). */
function RisingQuote({ text, lang }: { text: string; lang: Locale }) {
  return (
    <blockquote key={text} lang={lang} className="text-[clamp(1.35rem,1.1rem+1vw,2rem)] leading-snug font-medium text-white">
      {text.split(/(\s+)/).map((word, i) =>
        /\s+/.test(word) ? (
          word
        ) : (
          <span key={i} className="word-rise inline-block" style={{ animationDelay: `${Math.min(i, 40) * 18}ms` }}>
            {word}
          </span>
        ),
      )}
    </blockquote>
  );
}

export function TestimonialsSection({ locale }: { locale: Locale }) {
  const t = messages[locale].testimonials;
  const rtl = localeDirection[locale] === "rtl";
  const { items, isPreview } = useHomeList(locale, (c) => c.testimonials, testimonialPreview);
  const [index, setIndex] = useState(0);
  const host = useRef<HTMLElement>(null);
  const hold = useRef(false);

  useEffect(() => {
    const el = host.current;
    if (!el || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const watch = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry?.isIntersecting) timer = window.setInterval(() => !hold.current && setIndex((i) => (i + 1) % items.length), 8000);
    });
    watch.observe(el);
    return () => {
      watch.disconnect();
      window.clearInterval(timer);
    };
  }, [items.length]);

  if (!items.length) return null;
  const current = items[index % items.length]!;
  // The reel beside the quote: the others, twice, so the columns can loop.
  const reel = items.length > 1 ? [...items, ...items] : [];
  const step = (by: number) => setIndex((i) => (i + by + items.length) % items.length);

  return (
    <section
      ref={host}
      aria-labelledby="testimonials-title"
      className="plate bg-navy py-[var(--section-pad)] text-white"
      onPointerEnter={() => (hold.current = true)}
      onPointerLeave={() => (hold.current = false)}
      onFocusCapture={() => (hold.current = true)}
    >
      <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-[var(--gutter)] lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-7">
          <div>
            {isPreview ? <PreviewChip text="Preview: testimonials from maarifcms" /> : null}
            <Heading id="testimonials-title" title={t.title} lede={t.lede} tone="plate" />
          </div>
          <figure className="m-0 flex flex-col gap-6" aria-live="polite">
            <RisingQuote text={current.quote} lang={locale} />
            <figcaption className="flex flex-col">
              <span className="text-lg font-bold">{current.name}</span>
              <span className="text-on-plate-muted">{[t.kinds[current.kind], current.role].filter(Boolean).join(" · ")}</span>
            </figcaption>
          </figure>
          {items.length > 1 ? (
            <div className="flex items-center gap-3">
              <Button type="button" size="icon" variant="plate" className="size-11" aria-label={t.previous} onClick={() => step(-1)}>
                {rtl ? <ChevronRightIcon className="size-5" /> : <ChevronLeftIcon className="size-5" />}
              </Button>
              <span className="tabular text-on-plate-muted">
                {(index % items.length) + 1} / {items.length}
              </span>
              <Button type="button" size="icon" variant="plate" className="size-11" aria-label={t.next} onClick={() => step(1)}>
                {rtl ? <ChevronLeftIcon className="size-5" /> : <ChevronRightIcon className="size-5" />}
              </Button>
            </div>
          ) : null}
        </div>
        {reel.length ? (
          // Two columns of the other voices drifting in opposite directions; decorative, so hidden from
          // assistive tech (the quote on the left carries each one in turn).
          <div aria-hidden="true" className="relative hidden h-[30rem] grid-cols-2 gap-4 overflow-hidden lg:col-span-5 lg:grid [mask-image:linear-gradient(transparent,black_15%,black_85%,transparent)]">
            {[0, 1].map((col) => (
              <div key={col} className={cn("reel flex flex-col gap-4", col === 1 && "reel-reverse")}>
                {[...reel, ...reel].map((item, i) => (
                  <div key={`${item.id}-${i}`} className="rounded-[var(--radius-tile)] bg-white/[0.06] p-4 ring-1 ring-white/10">
                    <p className="line-clamp-4 text-sm text-white">{item.quote}</p>
                    <p className="mt-2 text-xs font-bold text-on-plate-muted">{item.name}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ---- News and events ---------------------------------------------------------------------

const newsPreview = (): NewsItem[] =>
  [1, 2, 3].map((n) => ({ id: String(n), slug: null, kind: n === 2 ? "event" : "news", title: `[News title ${n}]`, date: new Date().toISOString().slice(0, 10), summary: "[A short summary, published in maarifcms.]", image: null }));

export function NewsSection({ locale }: { locale: Locale }) {
  const t = messages[locale].news;
  const { items, isPreview } = useHomeList(locale, (c) => c.news, newsPreview);
  if (!items.length) return null;
  return (
    <section aria-labelledby="news-title" className="py-[var(--section-pad)]">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        {isPreview ? <PreviewChip text="Preview: news from maarifcms" /> : null}
        <Heading id="news-title" title={t.title} lede={t.lede} />
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="relative flex flex-col overflow-hidden rounded-[var(--radius-plate)] bg-surface shadow-rest ring-1 ring-rule/60 transition-shadow has-[a:hover]:shadow-rest-hover">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image.src} alt={item.image.alt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
              ) : (
                <div aria-hidden="true" className="grid aspect-[16/10] place-items-center bg-mist text-heading">
                  {item.kind === "event" ? <CalendarDaysIcon className="size-8" strokeWidth={1.75} /> : <NewspaperIcon className="size-8" strokeWidth={1.75} />}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-6">
                <p className="flex items-center gap-2 text-sm">
                  <span className={cn("rounded-full px-2.5 py-0.5 font-bold", item.kind === "event" ? "bg-navy text-white" : "bg-mist text-heading")}>{t.kinds[item.kind]}</span>
                  <time dateTime={item.date} className="text-slate">
                    {formatDate(locale, item.date)}
                  </time>
                </p>
                <h3 className="text-xl font-bold text-heading">
                  {item.slug ? (
                    // The whole card opens the article (wave 3); the link text stays the title.
                    <a href={`/${locale}/campus-life/news/${item.slug}`} className="no-underline after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-[var(--radius-plate)] focus-visible:after:ring-3 focus-visible:after:ring-turquoise">
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="text-slate">{item.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ---- Questions parents ask ---------------------------------------------------------------

const faqPreview = (): FaqItem[] => [1, 2, 3, 4].map((n) => ({ id: String(n), question: `[Question ${n} from maarifcms]`, answer: "[The school's answer, published by a reviewer.]" }));

export function FaqSection({ locale }: { locale: Locale }) {
  const m = messages[locale];
  const t = m.faq;
  const { items, isPreview } = useHomeList(locale, (c) => c.faqs, faqPreview);
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq-title" className="py-[var(--section-pad)]">
      <div className="mx-auto grid max-w-[var(--content-max)] gap-8 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          {isPreview ? <PreviewChip text="Preview: answers from maarifcms" /> : null}
          <Heading id="faq-title" title={t.title} lede={t.lede} />
          <Button asChild variant="outline" className="mt-6">
            <a href={whatsappHref(m.station.whatsappMessage(m.schoolName))} target="_blank" rel="noopener noreferrer">
              <MessageCircleIcon data-icon="inline-start" />
              {t.more}
            </a>
          </Button>
        </div>
        {/* Native disclosure: works without script, opens with Enter or Space, and animates where supported. */}
        <div className="flex flex-col gap-3 lg:col-span-8">
          {items.map((item) => (
            <details key={item.id} className="faq group rounded-[var(--radius-tile)] bg-surface shadow-rest ring-1 ring-rule/60">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-bold text-heading [&::-webkit-details-marker]:hidden">
                {item.question}
                <PlusIcon aria-hidden="true" className="size-5 shrink-0 text-turquoise-ink transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-ink">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
