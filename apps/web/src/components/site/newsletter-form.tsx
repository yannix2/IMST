"use client";

// The footer's newsletter form (wave 4, B4), loaded by newsletter-slot.tsx. Email + consent; the
// Turnstile check starts once someone engages with the form. Posts to maarif-api
// /api/forms/newsletter; maarifcms then emails a confirmation link (double opt-in).
import { useId, useState } from "react";
import type { FormResult } from "@maarif/contracts/forms";
import type { Locale } from "@maarif/contracts/locales";
import { newsletterCopy } from "@/content/newsletter";
import { messages } from "@/i18n/messages";
import { useTurnstile } from "@/lib/use-turnstile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

export default function NewsletterForm({ locale, privacyHref, privacyLabel }: { locale: Locale; privacyHref: string; privacyLabel: string }) {
  const c = newsletterCopy[locale];
  const s = messages[locale].station;
  const id = useId();
  const [engaged, setEngaged] = useState(false);
  const { ref: captchaRef, token, failed, reset } = useTurnstile(locale, { enabled: engaged, theme: "dark" });
  const [status, setStatus] = useState<Status>("idle");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setFields({});
    try {
      const response = await fetch("/api/forms/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, turnstileToken: token, website: String(form.get("website") ?? ""), privacyNoticeAccepted: form.get("consent") === "on", email: String(form.get("email") ?? "").trim() }),
      });
      const result = (await response.json().catch(() => null)) as FormResult | null;
      if (!result) return setStatus("unavailable");
      if (result.ok) return setStatus("sent");
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
      <p role="status" className="max-w-[46ch] text-lg text-white">
        {c.sent}
      </p>
    );
  }

  const error = fields.email ? (s.errors[fields.email] ?? s.fix) : fields.privacyNoticeAccepted ? (s.errors[fields.privacyNoticeAccepted] ?? s.fix) : fields.turnstileToken ? s.captcha : undefined;
  const message =
    status === "invalid" ? (error ?? s.fix) : status === "captcha" ? s.captcha : status === "rate_limited" ? s.rateLimited : status === "unavailable" || failed ? c.unavailable : undefined;

  return (
    <form onSubmit={submit} onFocusCapture={() => setEngaged(true)} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          {c.email}
        </label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          required
          placeholder={c.email}
          aria-invalid={Boolean(fields.email) || undefined}
          className="text-ink sm:max-w-80"
        />
        <Button type="submit" disabled={status === "sending" || failed} className="h-12 shrink-0">
          {status === "sending" ? <Spinner data-icon="inline-start" /> : null}
          {status === "sending" ? c.sending : c.send}
        </Button>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id={`${id}-consent`} name="consent" aria-invalid={Boolean(fields.privacyNoticeAccepted) || undefined} className="mt-0.5 border-white/50" />
        <label htmlFor={`${id}-consent`} className="max-w-[60ch] text-sm text-on-plate-muted">
          {c.consent}{" "}
          <a href={privacyHref} className="text-white underline">
            {privacyLabel}
          </a>
        </label>
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {failed ? null : <div ref={captchaRef} className="min-h-[65px]" />}
      {message ? (
        <p role="alert" className="text-sm font-medium text-white">
          {message}
        </p>
      ) : null}
    </form>
  );
}
