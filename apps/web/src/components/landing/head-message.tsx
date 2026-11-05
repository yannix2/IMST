"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import type { HeadMessage as HeadMessageData } from "@maarif/contracts/content";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { loadHomeContent, showPreviews } from "@/lib/home-content";
import { Button } from "@/components/ui/button";

// The head of school's word: a video that plays muted on its own while it is on screen (browsers
// refuse sound without a tap), captions, and the same words beside it. Content comes from
// maarifcms through maarif-api once a reviewer publishes it; until then the section is absent.
// Locally, without maarif-api, a marked preview shows the layout with placeholders, never words.
const preview: HeadMessageData = {
  name: "[Head of school’s name]",
  role: "[Role, from maarifcms]",
  message: "[The head’s message appears here, in each language, once it is published in maarifcms.]",
  video: null,
  poster: null,
  captions: null,
};

type State = { data: HeadMessageData; isPreview: boolean } | null;

export function HeadMessage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const host = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  // Once the visitor pauses, the video no longer starts by itself.
  const held = useRef(false);

  // Load the message when the section comes near the screen.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        near.disconnect();
        void loadHomeContent(locale).then((content) => {
          if (content?.headMessage) setState({ data: content.headMessage, isPreview: false });
          else if (!content && showPreviews) setState({ data: preview, isPreview: true });
        });
      },
      { rootMargin: "800px 0px" },
    );
    near.observe(el);
    return () => near.disconnect();
  }, [locale]);

  // Play while at least half of it is on screen, never under reduced motion.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && !still && !held.current) void el.play().catch(() => setPlaying(false));
        if (!entry.isIntersecting) el.pause();
      },
      { threshold: 0.5 },
    );
    onScreen.observe(el);
    return () => onScreen.disconnect();
  }, [state]);

  const data = state?.data;

  function togglePlay() {
    const el = video.current;
    if (!el) return;
    if (el.paused) {
      held.current = false;
      void el.play();
    } else {
      held.current = true;
      el.pause();
    }
  }

  function toggleSound() {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted && el.paused) void el.play();
  }

  return (
    // Without content the section is an empty marker: it stays in the page so the observer can see it.
    <section ref={host} aria-labelledby={data ? "head-title" : undefined} className={data ? "plate bg-navy py-[var(--section-pad)] text-white" : undefined}>
      {data ? (
        <div className="mx-auto grid max-w-[var(--content-max)] items-center gap-8 px-[var(--gutter)] lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="plate relative aspect-video overflow-hidden rounded-[var(--radius-plate)] bg-night shadow-raised ring-1 ring-white/10">
              {data.video ? (
                <>
                  <video
                    ref={video}
                    className="size-full object-cover"
                    muted
                    playsInline
                    preload="none"
                    poster={data.poster ?? undefined}
                    aria-label={t.head.videoLabel(data.name)}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    // A spoken message plays once; after that it waits for the visitor's play.
                    onEnded={() => {
                      held.current = true;
                      setPlaying(false);
                    }}
                  >
                    <source src={data.video.src} type={data.video.type} />
                    {data.captions ? <track kind="captions" src={data.captions.src} srcLang={data.captions.lang} label={t.head.title} default /> : null}
                  </video>
                  <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 sm:p-4">
                    <Button type="button" size="icon" variant="plate" className="size-11 backdrop-blur-sm" aria-label={playing ? t.head.pause : t.head.play} onClick={togglePlay}>
                      {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
                    </Button>
                    <Button type="button" variant="plate" className="backdrop-blur-sm" aria-pressed={!muted} onClick={toggleSound}>
                      {muted ? <VolumeXIcon data-icon="inline-start" /> : <Volume2Icon data-icon="inline-start" />}
                      {muted ? t.head.soundOn : t.head.soundOff}
                    </Button>
                  </div>
                </>
              ) : (
                // No video yet: the plate keeps its 16:9 place so the layout reads as it will.
                <div aria-hidden="true" className="grid size-full place-items-center">
                  <span className="grid size-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <PlayIcon className="size-7 text-white" />
                  </span>
                </div>
              )}
            </div>
          </div>

          <figure className="m-0 lg:col-span-5">
            {state?.isPreview ? (
              <p className="mb-4 inline-block rounded-full bg-notice px-3 py-1 text-sm font-bold text-white">Preview: content from maarifcms</p>
            ) : null}
            <h2 id="head-title" className="text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance text-white">
              {t.head.title}
            </h2>
            <blockquote className="mt-5 text-xl leading-relaxed text-white">{data.message}</blockquote>
            <figcaption className="mt-6 flex flex-col">
              <span className="text-lg font-bold text-white">{data.name}</span>
              <span className="text-on-plate-muted">{data.role}</span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </section>
  );
}
