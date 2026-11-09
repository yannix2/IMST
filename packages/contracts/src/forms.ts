import { z } from "zod";
import { locales } from "./locales";
import { grades } from "./school";

// Shared by apps/web (client hints) and apps/api (the authoritative check).
// Error messages are keys; apps/web translates them per locale.

const name = z.string().trim().min(2, "too_short").max(120, "too_long");

const optionalName = z
  .union([z.literal(""), name])
  .optional()
  .transform((value) => (value ? value : undefined));

// Tunisian numbers (+216 and 8 digits) and international numbers, spaces and dashes allowed.
const phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .pipe(z.string().regex(/^\+?[0-9]{8,15}$/, "invalid_phone"));

const optionalEmail = z
  .union([z.literal(""), z.email("invalid_email").max(254, "too_long")])
  .optional()
  .transform((value) => (value ? value : undefined));

const message = z.string().trim().max(2000, "too_long").optional();

// Fields every public form carries.
const formBase = {
  locale: z.enum(locales),
  // Cloudflare Turnstile token, verified server-side by apps/api.
  turnstileToken: z.string().min(1, "captcha_required").max(2048),
  // Honeypot: a hidden field people never fill. Anything here means a bot.
  website: z.string().max(0, "bot_detected").optional(),
  // Information notice about processing of personal data (required by the current form too).
  privacyNoticeAccepted: z.literal(true, { error: "consent_required" }),
};

export const preRegistrationSchema = z.object({
  ...formBase,
  studentName: name,
  guardianName: optionalName,
  grade: z.enum(grades, { error: "invalid_grade" }),
  phone,
  email: optionalEmail,
  cityArea: z.string().trim().min(2, "too_short").max(120, "too_long"),
  message,
});
export type PreRegistration = z.infer<typeof preRegistrationSchema>;

export const visitSlots = ["morning", "afternoon"] as const;

export const visitBookingSchema = z.object({
  ...formBase,
  parentName: name,
  phone,
  email: optionalEmail,
  grade: z.enum(grades, { error: "invalid_grade" }),
  preferredDate: z.iso.date("invalid_date"),
  preferredSlot: z.enum(visitSlots, { error: "invalid_slot" }),
  message,
});
export type VisitBooking = z.infer<typeof visitBookingSchema>;

export const contactTopics = ["admissions", "parents", "careers", "other"] as const;

export const contactSchema = z
  .object({
    ...formBase,
    name,
    phone: phone.optional(),
    email: optionalEmail,
    topic: z.enum(contactTopics, { error: "invalid_topic" }),
    message: z.string().trim().min(10, "too_short").max(2000, "too_long"),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "phone_or_email_required",
    path: ["email"],
  });
export type ContactMessage = z.infer<typeof contactSchema>;

// Parents' suggestions and complaints (wave 3, /parents/feedback). One way to answer is required.
export const feedbackKinds = ["suggestion", "complaint", "thanks"] as const;
export const feedbackSchema = z
  .object({
    ...formBase,
    name,
    phone: phone.optional(),
    email: optionalEmail,
    feedbackKind: z.enum(feedbackKinds, { error: "invalid_topic" }),
    grade: z.enum(grades, { error: "invalid_grade" }).optional(),
    message: z.string().trim().min(10, "too_short").max(2000, "too_long"),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "phone_or_email_required",
    path: ["email"],
  });
export type Feedback = z.infer<typeof feedbackSchema>;

export const formKinds = ["pre-registration", "visit-booking", "contact", "feedback"] as const;
export type FormKind = (typeof formKinds)[number];

export const formSchemas = {
  "pre-registration": preRegistrationSchema,
  "visit-booking": visitBookingSchema,
  contact: contactSchema,
  feedback: feedbackSchema,
} as const satisfies Record<FormKind, z.ZodType>;

// Job applications (wave 3, owner decision 2026-11-09): a short form plus one CV as a PDF,
// sent as multipart/form-data to POST /api/forms/application. The CV is stored privately
// (administrators only) and deleted after the retention period. `job` is the opening's slug,
// or "open" for a spontaneous application.
export const cvRules = { mimeType: "application/pdf", maxBytes: 5 * 1024 * 1024 } as const;
export const applicationSchema = z.object({
  ...formBase,
  job: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "invalid_job"),
  name,
  email: z.email("invalid_email").max(254, "too_long"),
  phone,
  position: z.string().trim().min(2, "too_short").max(120, "too_long"),
  message,
});
export type Application = z.infer<typeof applicationSchema>;

// What apps/api answers to every form submission.
export type FormResult =
  | { ok: true; reference: string }
  | { ok: false; error: "invalid"; fields: Record<string, string> }
  | { ok: false; error: "captcha" | "rate_limited" | "unavailable" };
