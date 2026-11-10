"use client";

// The pre-registration form (contracts: preRegistrationSchema; maarif-api: /api/forms/
// pre-registration, which checks it again, verifies Turnstile and stores it in maarifcms).
// The same seven fields as the old site's form, with the grade as a list and messages in the
// visitor's language. The year chosen on the route map is pre-selected.
import { useEffect, useId, useState } from "react";
import type { FormResult } from "@maarif/contracts/forms";
import type { Locale } from "@maarif/contracts/locales";
import { gradesOfLevel, levels, type Grade } from "@maarif/contracts/school";
import { messages } from "@/i18n/messages";
import { useRoute, updateRoute } from "@/lib/route-store";
import { useTurnstile } from "@/lib/use-turnstile";
import dynamic from "next/dynamic";
// Shown only when sending fails: fetched then, not with the page (JS budget).
const ReachUs = dynamic(() => import("@/components/site/reach-us").then((m) => m.ReachUs));
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";

type Status = "idle" | "sending" | "sent" | "unavailable" | "captcha" | "rate_limited" | "invalid";

const consent: Record<Locale, string> = {
  en: "I agree that the school keeps this information to contact me about my child’s admission.",
  fr: "J’accepte que l’école conserve ces informations pour me contacter au sujet de l’admission de mon enfant.",
  ar: "أوافق على أن تحتفظ المدرسة بهذه المعلومات للتواصل معي بخصوص قبول طفلي.",
  tr: "Okulun, çocuğumun kaydı hakkında benimle iletişime geçmek için bu bilgileri saklamasını kabul ediyorum.",
};

const words: Record<Locale, { student: string; guardian: string; grade: string; choose: string; city: string; message: string; send: string; sent: (r: string) => string }> = {
  en: { student: "Your child’s name", guardian: "Your name", grade: "Grade for the coming school year", choose: "Choose a grade", city: "City or area", message: "Message", send: "Send the pre-registration", sent: (r) => `Thank you. We received your pre-registration (reference ${r}). A member of our team will call you.` },
  fr: { student: "Nom de votre enfant", guardian: "Votre nom", grade: "Classe pour la prochaine année scolaire", choose: "Choisir une classe", city: "Ville ou quartier", message: "Message", send: "Envoyer la préinscription", sent: (r) => `Merci. Nous avons bien reçu votre préinscription (référence ${r}). Un membre de notre équipe vous appellera.` },
  ar: { student: "اسم طفلكم", guardian: "اسمكم", grade: "القسم للسنة الدراسية القادمة", choose: "اختاروا قسمًا", city: "المدينة أو الحي", message: "رسالة", send: "إرسال التسجيل المسبق", sent: (r) => `شكرًا. وصلنا تسجيلكم المسبق (المرجع ${r}). سيتصل بكم أحد أعضاء فريقنا.` },
  tr: { student: "Çocuğunuzun adı", guardian: "Adınız", grade: "Gelecek öğretim yılı için sınıf", choose: "Bir sınıf seçin", city: "Şehir ya da semt", message: "Mesaj", send: "Ön kaydı gönder", sent: (r) => `Teşekkürler. Ön kaydınızı aldık (referans ${r}). Ekibimizden biri sizi arayacak.` },
};

export function PreRegisterForm({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const s = t.station;
  const w = words[locale];
  const id = useId();
  const route = useRoute();
  const [grade, setGrade] = useState<Grade | "">(route.grade ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const { ref: captchaRef, token, failed, reset } = useTurnstile(locale);

  useEffect(() => {
    if (route.grade) setGrade(route.grade);
  }, [route.grade]);

  async function submit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setFields({});
    const value = (k: string) => String(form.get(k) ?? "");
    const body = {
      locale,
      turnstileToken: token,
      website: value("website"),
      privacyNoticeAccepted: form.get("consent") === "on",
      studentName: value("studentName"),
      guardianName: value("guardianName"),
      grade,
      phone: value("phone"),
      email: value("email"),
      cityArea: value("cityArea"),
      message: value("message"),
    };
    try {
      const response = await fetch("/api/forms/pre-registration", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json().catch(() => null)) as FormResult | null;
      if (!result) return setStatus("unavailable");
      if (result.ok) {
        setReference(result.reference);
        setStatus("sent");
        if (grade) updateRoute({ grade });
        return;
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

  const error = (name: string) => (fields[name] ? s.errors[fields[name]] ?? s.fix : undefined);
  const invalid = (name: string) => Boolean(error(name)) || undefined;

  if (status === "sent") {
    return (
      <Alert>
        <AlertDescription className="text-base text-ink">{w.sent(reference)}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[var(--radius-plate)] bg-surface p-6 shadow-rest ring-1 ring-rule/70 sm:p-8">
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={invalid("studentName")}>
          <FieldLabel htmlFor={`${id}-student`}>{w.student}</FieldLabel>
          <Input id={`${id}-student`} name="studentName" required aria-invalid={invalid("studentName")} />
          <FieldError>{error("studentName")}</FieldError>
        </Field>
        <Field data-invalid={invalid("guardianName")}>
          <FieldLabel htmlFor={`${id}-guardian`}>
            {w.guardian} <span className="font-normal text-slate">({s.optional})</span>
          </FieldLabel>
          <Input id={`${id}-guardian`} name="guardianName" autoComplete="name" aria-invalid={invalid("guardianName")} />
          <FieldError>{error("guardianName")}</FieldError>
        </Field>
        <Field data-invalid={invalid("grade")}>
          <FieldLabel htmlFor={`${id}-grade`}>{w.grade}</FieldLabel>
          <NativeSelect id={`${id}-grade`} value={grade} onChange={(e) => setGrade(e.target.value as Grade)} required aria-invalid={invalid("grade")}>
            <NativeSelectOption value="" disabled>
              {w.choose}
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
          <FieldError>{error("grade")}</FieldError>
        </Field>
        <Field data-invalid={invalid("cityArea")}>
          <FieldLabel htmlFor={`${id}-city`}>{w.city}</FieldLabel>
          <Input id={`${id}-city`} name="cityArea" autoComplete="address-level2" required aria-invalid={invalid("cityArea")} />
          <FieldError>{error("cityArea")}</FieldError>
        </Field>
        <Field data-invalid={invalid("phone")}>
          <FieldLabel htmlFor={`${id}-phone`}>{s.phone}</FieldLabel>
          <Input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required aria-invalid={invalid("phone")} />
          <FieldError>{error("phone")}</FieldError>
        </Field>
        <Field data-invalid={invalid("email")}>
          <FieldLabel htmlFor={`${id}-email`}>
            {s.email} <span className="font-normal text-slate">({s.optional})</span>
          </FieldLabel>
          <Input id={`${id}-email`} name="email" type="email" autoComplete="email" dir="ltr" aria-invalid={invalid("email")} />
          <FieldError>{error("email")}</FieldError>
        </Field>
        <Field data-invalid={invalid("message")} className="sm:col-span-2">
          <FieldLabel htmlFor={`${id}-message`}>
            {w.message} <span className="font-normal text-slate">({s.optional})</span>
          </FieldLabel>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={4}
            maxLength={2000}
            className="min-h-28 w-full rounded-[1.25rem] border border-input bg-transparent px-4 py-3 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <FieldError>{error("message")}</FieldError>
        </Field>
        <Field orientation="horizontal" data-invalid={invalid("privacyNoticeAccepted")} className="sm:col-span-2">
          <Checkbox id={`${id}-consent`} name="consent" aria-invalid={invalid("privacyNoticeAccepted")} />
          <FieldLabel htmlFor={`${id}-consent`} className="font-normal">
            {consent[locale]}
          </FieldLabel>
        </Field>
        {error("privacyNoticeAccepted") ? <FieldError className="sm:col-span-2">{error("privacyNoticeAccepted")}</FieldError> : null}

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
            {status === "sending" ? s.sending : w.send}
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
