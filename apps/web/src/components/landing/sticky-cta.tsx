"use client";

import { useEffect, useState } from "react";
import { CalendarCheckIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { useRoute } from "@/lib/route-store";
import { campuses, telHref, whatsappHref } from "@/lib/school";
import { visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CtaSpark } from "./cta-spark";

// The next step stays in reach whenever the visit station is off screen: on phones as soon as
// the hero's own buttons scroll away (the station sits further down there), on large screens once the visitor has
// scrolled past it (until then the header carries "Book a visit"). It leaves when the closing
// band, which carries the same actions, arrives, so it never covers the footer.
export function StickyCta({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const s = t.station;
  const { grade } = useRoute();
  const [station, setStation] = useState<"above" | "visible" | "past">("visible");
  const [atClose, setAtClose] = useState(false);
  const [wide, setWide] = useState(true);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const stationEl = document.getElementById("visit");
    const close = document.getElementById("come-and-see");
    const heroActions = document.getElementById("hero-actions");
    if (!stationEl || !close) return;
    // The hero carries the same two actions: while they are on screen the bar would only repeat them.
    const heroWatch = new IntersectionObserver(([entry]) => {
      if (entry) setHeroInView(entry.isIntersecting);
    });
    if (heroActions) heroWatch.observe(heroActions);
    const large = window.matchMedia("(min-width: 1024px)");
    const onWidth = () => setWide(large.matches);
    onWidth();
    large.addEventListener("change", onWidth);
    const stationWatch = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      setStation(entry.isIntersecting ? "visible" : entry.boundingClientRect.top < 0 ? "past" : "above");
    });
    const closeWatch = new IntersectionObserver(([entry]) => {
      if (entry) setAtClose(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    stationWatch.observe(stationEl);
    closeWatch.observe(close);
    return () => {
      large.removeEventListener("change", onWidth);
      stationWatch.disconnect();
      closeWatch.disconnect();
      heroWatch.disconnect();
    };
  }, []);

  const shown = !atClose && !heroInView && (station === "past" || (!wide && station === "above"));
  const gradeName = grade ? t.grade(grade === "kg" ? "kg" : Number(grade.slice(5))) : t.schoolName;
  const phone = campuses.schools.phones[0];

  return (
    <nav
      aria-label={t.cta.nextStep}
      inert={!shown}
      data-shown={shown || undefined}
      className={cn(
        // A floating pill: on phones it spans the screen above the home indicator, on large
        // screens it sits in the corner.
        "plate fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-full bg-navy p-2 text-white shadow-raised ring-1 ring-white/10",
        "lg:inset-x-auto lg:end-6 lg:bottom-6",
        "translate-y-[calc(100%+2rem)] opacity-0 transition-[translate,opacity] duration-200 ease-in",
        "data-[shown]:translate-y-0 data-[shown]:opacity-100 data-[shown]:duration-300 data-[shown]:ease-[cubic-bezier(0.16,1,0.3,1)]",
      )}
    >
      <div className="flex items-center gap-2">
        <CtaSpark tone="plate" className="max-sm:flex-1">
          <Button asChild size="lg" className="w-full">
            <a href={visitHash}>
              <CalendarCheckIcon data-icon="inline-start" />
              {s.bookVisit}
            </a>
          </Button>
        </CtaSpark>
        {/* Phones: icon plates (48px) so the booking label never wraps; labels from sm up. */}
        <Button asChild size="lg" variant="plate" className="max-sm:size-12 max-sm:px-0">
          <a href={whatsappHref(s.whatsappMessage(gradeName))} target="_blank" rel="noopener noreferrer" aria-label={s.whatsapp}>
            <MessageCircleIcon className="size-5" />
            <span className="max-sm:sr-only">{s.whatsapp}</span>
          </a>
        </Button>
        <Button asChild size="icon" variant="plate" className="size-12 lg:hidden">
          <a href={telHref(phone)} aria-label={`${s.call} ${phone}`}>
            <PhoneIcon className="size-5" />
          </a>
        </Button>
      </div>
    </nav>
  );
}
