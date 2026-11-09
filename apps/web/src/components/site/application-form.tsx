"use client";

// Job application (wave 3, owner decision 2026-11-09): a short form and one CV as a PDF, sent as
// multipart/form-data to maarif-api /api/forms/application. The API checks the file really is a
// PDF, stores it privately in maarifcms (administrators only) and deletes it after the retention
// period. `job` is the opening's slug, or "open" for an open application.
import { useId, useState } from "react";
import type { FormResult, cvRules as Rules } from "@maarif/contracts/forms";

// The contract's CV rules, repeated here so the form does not ship the validation library (zod).
const cvRules = { mimeType: "application/pdf", maxBytes: 5 * 1024 * 1024 } as const satisfies typeof Rules;
import type { Locale } from "@maarif/contracts/locales";
import { messages } from "@/i18n/messages";
import { useTurnstile } from "@/lib/use-turnstile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { careersCopy } from "@/site-pages/careers/copy";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

export function ApplicationForm({ locale, job, position }: { locale: Locale; job: string; position?: string }) {
  const copy = careersCopy[locale].form;
  const id = useId();
  const s = messages[locale].station;
  const { ref: captchaRef, token, failed } = useTurnstile(locale);
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cv = form.get("cv");
    // Same checks as the API, before sending 5 MB for nothing.
    if (!(cv instanceof File) || cv.size === 0) return (setFields({ cv: "cv_required" }), setStatus("invalid"));
    if (cv.size > cvRules.maxBytes) return (setFields({ cv: "too_large" }), setStatus("invalid"));
    if (cv.type && cv.type !== cvRules.mimeType) return (setFields({ cv: "pdf_only" }), setStatus("invalid"));

    form.set("locale", locale);
    form.set("job", job);
    form.set("turnstileToken", token);
    form.set("privacyNoticeAccepted", form.get("consent") === "on" ? "true" : "false");
    form.delete("consent");
    setStatus("sending");
    setFields({});
    try {
      const response = await fetch("/api/forms/application", { method: "POST", body: form });
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
      setStatus(result.error);
    } catch {
      setStatus("unavailable");
    }
  }

  if (status === "sent") {
    return (
      <Alert role="status">
        <AlertDescription className="text-base text-ink">{copy.sent(reference)}</AlertDescription>
      </Alert>
    );
  }

  const error = (name: string) => {
    const code = fields[name];
    return code ? (copy.errors[code] ?? s.errors[code] ?? s.fix) : undefined;
  };
  const invalid = (name: string) => Boolean(error(name)) || undefined;

  return (
    <form onSubmit={submit} noValidate encType="multipart/form-data" className="rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2" data-invalid={invalid("name")}>
          <FieldLabel htmlFor={`${id}-name`}>{copy.name}</FieldLabel>
          <Input id={`${id}-name`} name="name" autoComplete="name" required aria-invalid={invalid("name")} />
          <FieldError>{error("name")}</FieldError>
        </Field>
        <Field data-invalid={invalid("email")}>
          <FieldLabel htmlFor={`${id}-email`}>{copy.email}</FieldLabel>
          <Input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" required aria-invalid={invalid("email")} />
          <FieldError>{error("email")}</FieldError>
        </Field>
        <Field data-invalid={invalid("phone")}>
          <FieldLabel htmlFor={`${id}-phone`}>{copy.phone}</FieldLabel>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required aria-invalid={invalid("phone")} />
          <FieldError>{error("phone")}</FieldError>
        </Field>
        <Field className="sm:col-span-2" data-invalid={invalid("position")}>
          <FieldLabel htmlFor={`${id}-position`}>{copy.position}</FieldLabel>
          <Input id={`${id}-position`} name="position" defaultValue={position} required aria-invalid={invalid("position")} />
          {position ? null : <FieldDescription>{copy.positionHint}</FieldDescription>}
          <FieldError>{error("position")}</FieldError>
        </Field>
        <Field className="sm:col-span-2" data-invalid={invalid("message")}>
          <FieldLabel htmlFor={`${id}-message`}>
            {copy.message} <span className="font-normal text-slate">({s.optional})</span>
          </FieldLabel>
          <Textarea id={`${id}-message`} name="message" rows={5} maxLength={2000} aria-invalid={invalid("message")} />
          <FieldError>{error("message")}</FieldError>
        </Field>
        <Field className="sm:col-span-2" data-invalid={invalid("cv")}>
          <FieldLabel htmlFor={`${id}-cv`}>{copy.cv}</FieldLabel>
          <Input id={`${id}-cv`} name="cv" type="file" accept="application/pdf,.pdf" required aria-invalid={invalid("cv")} className="h-auto rounded-[var(--radius-tile)] py-2.5 file:me-3" />
          <FieldDescription>{copy.cvHint}</FieldDescription>
          <FieldError>{error("cv")}</FieldError>
        </Field>
        <Field orientation="horizontal" className="sm:col-span-2" data-invalid={invalid("privacyNoticeAccepted")}>
          <Checkbox id={`${id}-consent`} name="consent" aria-invalid={invalid("privacyNoticeAccepted")} />
          <FieldLabel htmlFor={`${id}-consent`} className="font-normal">
            {copy.consent}
          </FieldLabel>
        </Field>
        {error("privacyNoticeAccepted") || error("job") ? (
          <FieldError className="sm:col-span-2">{error("privacyNoticeAccepted") ?? error("job")}</FieldError>
        ) : null}

        {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
        <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div ref={captchaRef} className="min-h-[65px] sm:col-span-2" />

        <div className="sm:col-span-2">
          <Button type="submit" size="lg" disabled={status === "sending"}>
            {status === "sending" ? <Spinner data-icon="inline-start" /> : null}
            {status === "sending" ? s.sending : copy.send}
          </Button>
        </div>

        {status === "invalid" || status === "captcha" || status === "rate_limited" || status === "unavailable" || failed ? (
          <Alert variant={status === "unavailable" || failed ? "default" : "destructive"} className="sm:col-span-2">
            <AlertDescription className="text-base">
              {status === "invalid" ? s.fix : status === "captcha" ? s.captcha : status === "rate_limited" ? s.rateLimited : s.unavailable}
            </AlertDescription>
          </Alert>
        ) : null}
      </FieldGroup>
    </form>
  );
}
