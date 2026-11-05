"use client";

// The visit booking form. Loaded on demand (visit-station.tsx) so its fields, Turnstile and
// validation messages cost nothing until a family starts booking.
import { useEffect, useRef, useState } from "react";
import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import type { Locale } from "@maarif/contracts/locales";
import type { Grade } from "@maarif/contracts/school";
import type { FormResult } from "@maarif/contracts/forms";
import { messages } from "@/i18n/messages";
import { telHref, whatsappHref } from "@/lib/school";
import { updateRoute } from "@/lib/route-store";
import { loadTurnstile, TURNSTILE_SITE_KEY } from "@/lib/turnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

type Props = {
  id: string;
  locale: Locale;
  grade: Grade | null;
  gradeName: string;
  phone: string;
  // false when opened from a link elsewhere: focus is already on the station, and focusing a
  // field would pop the phone keyboard during the scroll.
  focusFirstField: boolean;
};

export default function VisitForm({ id, locale, grade, gradeName, phone, focusFirstField }: Props) {
  const t = messages[locale];
  const s = t.station;
  const [slot, setSlot] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [token, setToken] = useState("");
  const [minDate, setMinDate] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const focusOnMount = useRef(focusFirstField);

  useEffect(() => {
    const tomorrow = new Date(Date.now() + 86_400_000);
    setMinDate(tomorrow.toISOString().slice(0, 10));
    if (focusOnMount.current) nameRef.current?.focus();

    let widget: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !captchaRef.current || !window.turnstile) return;
        widget = window.turnstile.render(captchaRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: locale,
          theme: "light",
          callback: (value: string) => setToken(value),
          "expired-callback": () => setToken(""),
        });
      })
      .catch(() => setStatus("unavailable"));
    return () => {
      cancelled = true;
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [locale]);

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setFields({});
    const body = {
      locale,
      turnstileToken: token,
      website: String(form.get("website") ?? ""),
      privacyNoticeAccepted: form.get("consent") === "on",
      parentName: String(form.get("parentName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      grade: grade ?? "",
      preferredDate: String(form.get("preferredDate") ?? ""),
      preferredSlot: slot,
    };
    try {
      const response = await fetch("/api/forms/visit-booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => null)) as FormResult | null;
      if (!result) return setStatus("unavailable");
      if (result.ok) {
        setReference(result.reference);
        setStatus("sent");
        updateRoute({ station: 2 });
        return;
      }
      if (result.error === "invalid") {
        setFields(result.fields);
        return setStatus("invalid");
      }
      setStatus(result.error);
    } catch {
      setStatus("unavailable");
    }
  }

  const error = (name: string) => (fields[name] ? s.errors[fields[name]] ?? s.fix : undefined);
  const reachUs = (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <a href={telHref(phone)}>
          <PhoneIcon data-icon="inline-start" />
          <span className="tabular" dir="ltr">{phone}</span>
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={whatsappHref(s.whatsappMessage(gradeName || t.schoolName))} target="_blank" rel="noopener noreferrer">
          <MessageCircleIcon data-icon="inline-start" />
          {s.whatsapp}
        </a>
      </Button>
    </div>
  );

  return (
    <form
      id={id}
      onSubmit={submit}
      noValidate
      className="mt-6 border-t border-rule pt-6 animate-in fade-in slide-in-from-top-2 duration-300 ease-out"
    >
      {status === "sent" ? (
        <Alert>
          <AlertDescription className="text-base text-ink">{s.sent(reference)}</AlertDescription>
        </Alert>
      ) : (
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(error("parentName")) || undefined}>
            <FieldLabel htmlFor={`${id}-name`}>{s.parentName}</FieldLabel>
            <Input ref={nameRef} id={`${id}-name`} name="parentName" autoComplete="name" required aria-invalid={Boolean(error("parentName")) || undefined} />
            <FieldError>{error("parentName")}</FieldError>
          </Field>
          <Field data-invalid={Boolean(error("phone")) || undefined}>
            <FieldLabel htmlFor={`${id}-phone`}>{s.phone}</FieldLabel>
            <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required aria-invalid={Boolean(error("phone")) || undefined} />
            <FieldError>{error("phone")}</FieldError>
          </Field>
          <Field data-invalid={Boolean(error("email")) || undefined}>
            <FieldLabel htmlFor={`${id}-email`}>
              {s.email} <span className="font-normal text-slate">({s.optional})</span>
            </FieldLabel>
            <Input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" aria-invalid={Boolean(error("email")) || undefined} />
            <FieldError>{error("email")}</FieldError>
          </Field>
          <Field data-invalid={Boolean(error("preferredDate")) || undefined}>
            <FieldLabel htmlFor={`${id}-date`}>{s.date}</FieldLabel>
            <Input id={`${id}-date`} name="preferredDate" type="date" min={minDate} required aria-invalid={Boolean(error("preferredDate")) || undefined} />
            <FieldError>{error("preferredDate")}</FieldError>
          </Field>
          <Field data-invalid={Boolean(error("preferredSlot")) || undefined} className="sm:col-span-2">
            <FieldLabel id={`${id}-slot`}>{s.slot}</FieldLabel>
            <ToggleGroup type="single" variant="outline" value={slot} onValueChange={setSlot} aria-labelledby={`${id}-slot`}>
              <ToggleGroupItem value="morning">{s.morning}</ToggleGroupItem>
              <ToggleGroupItem value="afternoon">{s.afternoon}</ToggleGroupItem>
            </ToggleGroup>
            <FieldError>{error("preferredSlot")}</FieldError>
          </Field>
          <Field orientation="horizontal" data-invalid={Boolean(error("privacyNoticeAccepted")) || undefined} className="sm:col-span-2">
            <Checkbox id={`${id}-consent`} name="consent" aria-invalid={Boolean(error("privacyNoticeAccepted")) || undefined} />
            <FieldLabel htmlFor={`${id}-consent`} className="font-normal">
              {s.consent}
            </FieldLabel>
          </Field>
          {error("privacyNoticeAccepted") || error("grade") ? (
            <FieldError className="sm:col-span-2">{error("privacyNoticeAccepted") ?? error("grade")}</FieldError>
          ) : null}

          {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
          <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div ref={captchaRef} className="sm:col-span-2" />

          <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={status === "sending"}>
              {status === "sending" ? <Spinner data-icon="inline-start" /> : null}
              {status === "sending" ? s.sending : s.send}
            </Button>
          </div>

          {status === "invalid" || status === "captcha" || status === "rate_limited" || status === "unavailable" ? (
            <Alert variant={status === "unavailable" ? "default" : "destructive"} className="sm:col-span-2">
              <AlertDescription className="text-base">
                {status === "invalid" ? s.fix : status === "captcha" ? s.captcha : status === "rate_limited" ? s.rateLimited : s.unavailable}
                {status === "unavailable" ? reachUs : null}
              </AlertDescription>
            </Alert>
          ) : null}
        </FieldGroup>
      )}
    </form>
  );
}
