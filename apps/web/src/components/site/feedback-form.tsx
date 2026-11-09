"use client";

// Parents' suggestions, concerns and thanks (wave 3, /parents/feedback). Posts to maarif-api
// /api/forms/feedback (contracts feedbackSchema); the entry lands in the maarifcms inbox and the
// staff are notified without personal details in the mail.
import { useId, useState } from "react";
import type { FormResult, feedbackKinds as Kinds } from "@maarif/contracts/forms";

// The contract's list, repeated here so the form does not ship the validation library (zod).
const feedbackKinds = ["suggestion", "complaint", "thanks"] as const satisfies typeof Kinds;
import type { Locale } from "@maarif/contracts/locales";
import { gradesOfLevel, levels } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { useTurnstile } from "@/lib/use-turnstile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { parentsCopy } from "@/site-pages/parents/copy";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

export function FeedbackForm({ locale }: { locale: Locale }) {
  const copy = parentsCopy[locale].feedback;
  const id = useId();
  const t = messages[locale];
  const s = t.station;
  const { ref: captchaRef, token, failed } = useTurnstile(locale);
  const [kind, setKind] = useState<string>("suggestion");
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
      feedbackKind: kind,
      grade: text("grade") || undefined,
      message: text("message"),
    };
    try {
      const response = await fetch("/api/forms/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
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
    if (!code) return undefined;
    if (code === "phone_or_email_required") return copy.oneWay;
    return s.errors[code] ?? s.fix;
  };
  const invalid = (name: string) => Boolean(error(name)) || undefined;

  return (
    <form onSubmit={submit} noValidate className="rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2" data-invalid={invalid("feedbackKind")}>
          <FieldLabel id={`${id}-kind`}>{copy.kind}</FieldLabel>
          <ToggleGroup type="single" variant="outline" value={kind} onValueChange={(v) => v && setKind(v)} aria-labelledby={`${id}-kind`} className="flex-wrap">
            {feedbackKinds.map((k) => (
              <ToggleGroupItem key={k} value={k}>
                {copy.kinds[k]}
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
        <Field className="sm:col-span-2" data-invalid={invalid("grade")}>
          <FieldLabel htmlFor={`${id}-grade`}>
            {copy.grade} <span className="font-normal text-slate">({s.optional})</span>
          </FieldLabel>
          <NativeSelect id={`${id}-grade`} name="grade" defaultValue="">
            <NativeSelectOption value="">{copy.gradeNone}</NativeSelectOption>
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
