"use client";

// "Write to us" on the Contact page (wave 6). Posts to maarif-api /api/forms/contact (contracts
// contactSchema); the entry lands in the maarifcms inbox, the staff are notified without personal
// details, and the sender gets a confirmation when an email was given.
import { useEffect, useId, useRef, useState } from "react";
import type { FormResult, contactTopics as Topics } from "@maarif/contracts/forms";

// The contract's list, repeated here so the form does not ship the validation library (zod).
const contactTopics = ["admissions", "parents", "careers", "other"] as const satisfies typeof Topics;
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { useTurnstile } from "@/lib/use-turnstile";
import dynamic from "next/dynamic";
// Shown only when sending fails: fetched then, not with the form (JS budget).
const ReachUs = dynamic(() => import("@/components/site/reach-us").then((m) => m.ReachUs));
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

// The texts come from the page (site-pages/contact.tsx, this language only). `sent` holds "{ref}".
export type ContactFormCopy = {
  topic: string;
  topics: Record<(typeof contactTopics)[number], string>;
  name: string;
  phone: string;
  email: string;
  oneWay: string;
  message: string;
  consent: string;
  send: string;
  sent: string;
};

// `onReady` tells the slot the form is on the page, so it can stop reserving a fixed height.
export default function ContactForm({ locale, copy, onReady }: { locale: Locale; copy: ContactFormCopy; onReady?: () => void }) {
  const id = useId();
  const arrived = useRef(onReady);
  useEffect(() => arrived.current?.(), []);
  const s = messages[locale].station;
  const { ref: captchaRef, token, failed, reset } = useTurnstile(locale);
  const [topic, setTopic] = useState<string>("admissions");
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setFields({});
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const body = {
      locale,
      turnstileToken: token,
      website: text("website"),
      privacyNoticeAccepted: form.get("consent") === "on",
      name: text("name"),
      phone: text("phone") || undefined,
      email: text("email"),
      topic,
      message: text("message"),
    };
    try {
      const response = await fetch("/api/forms/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json().catch(() => null)) as FormResult | null;
      if (!result) return setStatus("unavailable");
      if (result.ok) {
        setReference(result.reference);
        return setStatus("sent");
      }
      if (result.error === "invalid") {
        setFields(result.fields);
        return setStatus("invalid");
      }
      reset();
      setStatus(result.error);
    } catch {
      reset();
      setStatus("unavailable");
    }
  }

  if (status === "sent") {
    return (
      <Alert role="status">
        <AlertDescription className="text-base text-ink">{copy.sent.replace("{ref}", reference)}</AlertDescription>
      </Alert>
    );
  }

  const error = (name: string) => {
    const code = fields[name];
    if (!code) return undefined;
    if (code === "phone_or_email_required") return copy.oneWay;
    return s.errors[code] ?? s.fix;
  };
  const invalid = (name: string) => Boolean(error(name)) || undefined;

  return (
    <form onSubmit={submit} noValidate className="rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2" data-invalid={invalid("topic")}>
          <FieldLabel id={`${id}-topic`}>{copy.topic}</FieldLabel>
          <ToggleGroup type="single" variant="outline" value={topic} onValueChange={(v) => v && setTopic(v)} aria-labelledby={`${id}-topic`} className="flex-wrap">
            {contactTopics.map((k) => (
              <ToggleGroupItem key={k} value={k}>
                {copy.topics[k]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field className="sm:col-span-2" data-invalid={invalid("name")}>
          <FieldLabel htmlFor={`${id}-name`}>{copy.name}</FieldLabel>
          <Input id={`${id}-name`} name="name" autoComplete="name" required aria-invalid={invalid("name")} />
          <FieldError>{error("name")}</FieldError>
        </Field>
        <Field data-invalid={invalid("phone")}>
          <FieldLabel htmlFor={`${id}-phone`}>{copy.phone}</FieldLabel>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" aria-invalid={invalid("phone")} />
          <FieldError>{error("phone")}</FieldError>
        </Field>
        <Field data-invalid={invalid("email")}>
          <FieldLabel htmlFor={`${id}-email`}>{copy.email}</FieldLabel>
          <Input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" aria-invalid={invalid("email")} />
          <FieldError>{error("email")}</FieldError>
        </Field>
        <FieldDescription className="-mt-2 sm:col-span-2">{copy.oneWay}</FieldDescription>
        <Field className="sm:col-span-2" data-invalid={invalid("message")}>
          <FieldLabel htmlFor={`${id}-message`}>{copy.message}</FieldLabel>
          <Textarea id={`${id}-message`} name="message" rows={6} required maxLength={2000} aria-invalid={invalid("message")} />
          <FieldError>{error("message")}</FieldError>
        </Field>
        <Field orientation="horizontal" className="sm:col-span-2" data-invalid={invalid("privacyNoticeAccepted")}>
          <Checkbox id={`${id}-consent`} name="consent" aria-invalid={invalid("privacyNoticeAccepted")} />
          <FieldLabel htmlFor={`${id}-consent`} className="font-normal">
            {copy.consent}
          </FieldLabel>
        </Field>
        {error("privacyNoticeAccepted") ? <FieldError className="sm:col-span-2">{error("privacyNoticeAccepted")}</FieldError> : null}

        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {failed ? null : <div ref={captchaRef} className="min-h-[65px] sm:col-span-2" />}

        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={status === "sending" || failed}>
            {status === "sending" ? <Spinner data-icon="inline-start" /> : null}
            {status === "sending" ? s.sending : copy.send}
          </Button>
        </div>

        {status === "unavailable" || failed ? (
          <ReachUs locale={locale} className="sm:col-span-2" />
        ) : status === "invalid" || status === "captcha" || status === "rate_limited" ? (
          <Alert variant="destructive" className="sm:col-span-2">
            <AlertDescription className="text-base">{status === "invalid" ? s.fix : status === "captcha" ? s.captcha : s.rateLimited}</AlertDescription>
          </Alert>
        ) : null}
      </FieldGroup>
    </form>
  );
}
