// Client code: rendered only inside RouteBoard (a client component), so no entry directive here.
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import { CalendarCheckIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import { gradesOfLevel, levels, type Grade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { campuses, telHref, whatsappHref } from "@/lib/school";
import { isVisitLink, visitHash } from "@/lib/visit";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { CtaSpark } from "./cta-spark";

// The form (fields, Turnstile, messages) is its own chunk. It starts loading as soon as a
// visitor points at, focuses or presses "Book a visit", so it is ready by the time it opens.
const loadForm = () => import("./visit-form");
const VisitForm = dynamic(loadForm, { ssr: false });

type Props = { locale: Locale; grade: Grade | null; onGradeChange: (grade: Grade) => void };

export function VisitStation({ locale, grade, onGradeChange }: Props) {
  const t = messages[locale];
  const s = t.station;
  const ids = useId();
  const [open, setOpen] = useState(false);
  // Opened from a link elsewhere: the jump to #visit already moves focus to the station
  // (it is focusable for that), so the first field is not focused and no phone keyboard pops up.
  const [fromLink, setFromLink] = useState(false);
  const warmed = useRef(false);

  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    void loadForm();
  };

  useEffect(() => {
    const openFromLink = () => {
      warm();
      setFromLink(true);
      setOpen(true);
    };
    if (window.location.hash === visitHash) openFromLink();
    const onClick = (event: MouseEvent) => {
      if (isVisitLink(event.target)) openFromLink();
    };
    const onIntent = (event: Event) => {
      if (isVisitLink(event.target)) warm();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
    };
  }, []);

  const gradeName = grade ? t.grade(grade === "kg" ? "kg" : Number(grade.slice(5))) : "";
  const phone = campuses.schools.phones[0];

  return (
    <section
      id="visit"
      tabIndex={-1}
      aria-labelledby={`${ids}-title`}
      className="scroll-mt-6 rounded-[var(--radius-plate)] bg-surface p-5 text-ink shadow-raised outline-none sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-[var(--line-thickness)] w-10 rounded-full bg-turquoise" />
        <h2 id={`${ids}-title`} className="text-xl font-bold text-heading">
          {s.title}
        </h2>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* A native picker: the phone's own wheel or list, and no positioning library. */}
        <Field className="sm:w-60">
          <FieldLabel htmlFor={`${ids}-grade`}>{s.grade}</FieldLabel>
          <NativeSelect
            id={`${ids}-grade`}
            className="w-full"
            value={grade ?? ""}
            onChange={(event) => event.target.value && onGradeChange(event.target.value as Grade)}
          >
            <NativeSelectOption value="" disabled>
              {t.hero.chooseLine}
            </NativeSelectOption>
            {levels.map((level) => (
              <NativeSelectOptGroup key={level} label={t.levels[level]}>
                {gradesOfLevel[level].map((g) => (
                  <NativeSelectOption key={g} value={g}>
                    {t.grade(g === "kg" ? "kg" : Number(g.slice(5)))}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
        </Field>

        <CtaSpark>
          <Button
            size="lg"
            aria-expanded={open}
            aria-controls={`${ids}-form`}
            onPointerEnter={warm}
            onFocus={warm}
            onClick={() => {
              setFromLink(false);
              setOpen(true);
            }}
          >
            <CalendarCheckIcon data-icon="inline-start" />
            {s.bookVisit}
          </Button>
        </CtaSpark>
        <Button asChild size="lg" variant="outline">
          <a href={whatsappHref(s.whatsappMessage(gradeName || t.schoolName))} target="_blank" rel="noopener noreferrer">
            <MessageCircleIcon data-icon="inline-start" />
            {s.whatsapp}
          </a>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <a href={telHref(phone)}>
            <PhoneIcon data-icon="inline-start" />
            {s.call}
          </a>
        </Button>
      </div>

      {open ? (
        <VisitForm id={`${ids}-form`} locale={locale} grade={grade} gradeName={gradeName} phone={phone} focusFirstField={!fromLink} />
      ) : null}
    </section>
  );
}
