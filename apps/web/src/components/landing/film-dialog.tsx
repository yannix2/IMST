"use client";

import { CalendarCheckIcon, CompassIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { HomeHero } from "@maarif/contracts";
import type { Locale } from "@maarif/contracts/locales";
import type { FilmCopy } from "@/content/tour";
import { Button } from "@/components/ui/button";

// The school film with sound (wave 5), opened from "Watch the film". A native <dialog> (focus
// trapped, Escape closes, no extra library), the phone version on narrow screens, the film's own
// English subtitles plus "Read what is said" in the page language, and at the end the two next
// steps. Closing pauses the film and gives the focus back to the button that opened it.
export type FilmDialogProps = {
  locale: Locale;
  film: NonNullable<HomeHero["film"]>;
  transcript: string;
  copy: FilmCopy;
  visitHref: string;
  visitLabel: string;
  discoverHref: string;
  onClose: () => void;
};

export function FilmDialog({ locale, film, transcript, copy, visitHref, visitLabel, discoverHref, onClose }: FilmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const [src] = useState(() => (matchMedia("(max-width: 767px)").matches ? film.small : film.src));
  const paragraphs = transcript.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  useEffect(() => {
    const d = dialog.current;
    const v = video.current;
    if (!d || !v) return;
    d.showModal();
    // Opened by a tap, so the browser lets it start with sound.
    void v.play().catch(() => {});
    const closed = () => {
      v.pause();
      onClose();
    };
    d.addEventListener("close", closed);
    return () => {
      d.removeEventListener("close", closed);
      v.pause();
    };
  }, [onClose]);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="film-title"
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-auto max-h-[calc(100dvh-1rem)] w-[min(100vw-1rem,72rem)] overflow-y-auto rounded-[var(--radius-plate)] bg-night p-0 text-white shadow-raised ring-1 ring-white/10 backdrop:bg-night/85 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <h2 id="film-title" className="font-heading text-lg font-bold sm:text-xl">
          {copy.title}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label={copy.close}
          title={copy.close}
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 ring-1 ring-white/30 transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none"
        >
          <XIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="relative aspect-video w-full bg-black">
        <video
          ref={video}
          src={src}
          controls
          playsInline
          preload="metadata"
          poster={film.poster ? `${film.poster.src}?w=1600&f=webp` : undefined}
          onEnded={() => setEnded(true)}
          onPlay={() => setEnded(false)}
          className="size-full"
        />
        {ended ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-night/85 p-6 text-center">
            <p className="max-w-[28ch] rtl:max-w-[16em] text-[length:var(--text-headline)] leading-[var(--leading-headline)] font-bold text-balance">{copy.endTitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={visitHref} onClick={close}>
                  <CalendarCheckIcon data-icon="inline-start" />
                  {visitLabel}
                </a>
              </Button>
              <Button asChild size="lg" variant="plate">
                <a href={discoverHref}>
                  <CompassIcon data-icon="inline-start" />
                  {copy.discover}
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {paragraphs.length ? (
        <details open={locale !== "en"} className="group px-4 py-4 sm:px-6">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold text-turquoise-plate underline-offset-4 hover:underline">{copy.transcript}</summary>
          <div className="mt-2 flex max-w-[70ch] flex-col gap-3 text-white/90">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ) : null}
    </dialog>
  );
}
