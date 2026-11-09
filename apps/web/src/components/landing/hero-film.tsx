"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The hero's photo motion film (tools/media/hero-film.mjs) over its poster. The poster is the
// first paint (LCP) and stays for reduced motion and Save-Data; the film is fetched only after
// the page has loaded, in the orientation of the screen, fades in once it really plays, and pauses
// off screen or in a hidden tab. A visible pause button (WCAG 2.2.2); the choice lasts the visit.

// Built-in film (wave 2); the hero passes maarifcms's "Home film" instead once it is published.
const builtIn = { landscape: "/media/hero/hero-landscape.mp4", portrait: "/media/hero/hero-portrait.mp4" };
const remember = "maarif-hero-film";

export function HeroFilm({ playLabel, pauseLabel, sources = builtIn }: { playLabel: string; pauseLabel: string; sources?: { landscape: string; portrait: string } }) {
  const video = useRef<HTMLVideoElement>(null);
  const wanted = useRef(false); // what the visitor wants: film on or off
  const [ready, setReady] = useState(false); // button shown once we know what happens
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const quiet = matchMedia("(prefers-reduced-motion: reduce)").matches || Boolean((navigator as { connection?: { saveData?: boolean } }).connection?.saveData);
    let paused = false;
    try {
      paused = sessionStorage.getItem(remember) === "paused";
    } catch {}
    wanted.current = !quiet && !paused;
    setReady(true);

    const load = () => {
      if (!v.currentSrc) {
        v.src = matchMedia("(orientation: portrait)").matches ? sources.portrait : sources.landscape;
        v.load();
      }
    };
    const play = () => {
      if (!wanted.current || document.hidden) return;
      load();
      void v.play().catch(() => setPlaying(false));
    };
    const onPlaying = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);

    const seen = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? play() : v.pause()), { threshold: 0.2 });
    const onVisibility = () => (document.hidden ? v.pause() : play());
    const start = () => {
      seen.observe(v);
      document.addEventListener("visibilitychange", onVisibility);
    };
    // After the load event, so the film never competes with the poster and the page's own files.
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      seen.disconnect();
      window.removeEventListener("load", start);
      document.removeEventListener("visibilitychange", onVisibility);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
    };
  }, [sources]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    wanted.current = !wanted.current;
    try {
      sessionStorage.setItem(remember, wanted.current ? "playing" : "paused");
    } catch {}
    if (wanted.current) {
      if (!v.currentSrc) {
        v.src = matchMedia("(orientation: portrait)").matches ? sources.portrait : sources.landscape;
        v.load();
      }
      void v.play().catch(() => setPlaying(false));
    } else v.pause();
  };

  return (
    <>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", playing ? "opacity-100" : "opacity-0")}
      />
      {ready ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? pauseLabel : playLabel}
          title={playing ? pauseLabel : playLabel}
          className="absolute end-[var(--gutter)] bottom-5 z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-night/55 text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors hover:bg-night/80 focus-visible:ring-3 focus-visible:ring-turquoise focus-visible:outline-none"
        >
          {playing ? <PauseIcon aria-hidden="true" className="size-5" /> : <PlayIcon aria-hidden="true" className="size-5" />}
        </button>
      ) : null}
    </>
  );
}
