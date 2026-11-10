import type { Application, FormKind as ContractFormKind, Locale } from "@maarif/contracts";
import { formReceived, renderMail, sendMail, senderFor, staffNotification, type FormKind, type FormReceivedData, type MailResult } from "@maarif/mail";
import type { Env } from "./env";
import { cmsGet } from "./content";

// Emails after a form (wave 3 ADR 009, wave 4 ADR 011), through Cloudflare Email Service (the
// EMAIL binding, Workers Paid: any recipient). Senders come from MAIL_DOMAIN (@maarif/mail).
//   - Staff: "a new entry arrived" to the addresses in maarifcms > Site settings; names the kind
//     and links to the admin, never the family's or candidate's details.
//   - The person who sent the form, when they gave an email: a confirmation in their language with
//     the reference and the next step.
// Both are skipped silently without the binding or the domain (local development); the entry is
// already stored in maarifcms either way.

export type NotifyKind = FormKind;

const DEFAULT_SITE_URL = "https://yassinekhiari.download";
export const siteUrlOf = (env: Env) => env.SITE_URL ?? DEFAULT_SITE_URL;

const group: Record<NotifyKind, "admissions" | "general" | "parents" | "careers"> = {
  "pre-registration": "admissions",
  "visit-booking": "admissions",
  contact: "general",
  feedback: "parents",
  application: "careers",
};

const collection: Record<NotifyKind, string> = {
  "pre-registration": "inquiries",
  "visit-booking": "inquiries",
  contact: "inquiries",
  feedback: "inquiries",
  application: "applications",
};

type Settings = { notifications?: Record<string, { email?: string }[] | undefined> };

export async function recipients(env: Env, kind: NotifyKind): Promise<string[]> {
  const settings = await cmsGet<Settings>(env, "/cms-api/globals/site-settings?depth=0");
  return (settings?.notifications?.[group[kind]] ?? []).flatMap((r) => (r.email && /^[^\s@]+@[^\s@]+$/.test(r.email) ? [r.email] : []));
}

export async function notifyStaff(env: Env, kind: NotifyKind, reference: string, adminUrl: string): Promise<number> {
  const sender = senderFor("staff", env.MAIL_DOMAIN);
  if (!env.EMAIL || !sender) return 0;
  const to = await recipients(env, kind);
  if (!to.length) return 0;
  const url = `${adminUrl}/admin/collections/${collection[kind]}/${encodeURIComponent(reference)}`;
  const mail = renderMail(staffNotification(kind, { reference, url }), { siteUrl: siteUrlOf(env) });
  let sent = 0;
  for (const address of to) {
    const result = await sendMail(env.EMAIL, { from: sender.from, replyTo: sender.replyTo, to: address, ...mail });
    if (result.ok) sent++;
  }
  return sent;
}

// What a confirmation needs from a validated form: the address, and the details worth repeating
// (reference, grade, preferred date). Never the message itself.
type Parsed = { locale: Locale; email?: string } & Record<string, unknown>;

export function confirmationData(kind: NotifyKind, data: Parsed, reference: string): { to?: string; details: FormReceivedData } {
  const str = (key: string) => (typeof data[key] === "string" && data[key] ? (data[key] as string) : undefined);
  const details: FormReceivedData = { reference };
  switch (kind) {
    case "visit-booking":
      Object.assign(details, { name: str("parentName"), grade: str("grade"), preferredDate: str("preferredDate"), preferredSlot: str("preferredSlot") });
      break;
    case "pre-registration":
      // Greet the parent, never the child: no name when the parent left theirs empty.
      Object.assign(details, { name: str("guardianName"), grade: str("grade") });
      break;
    case "feedback":
      Object.assign(details, { name: str("name"), feedbackKind: str("feedbackKind") });
      break;
    case "application":
      Object.assign(details, { name: str("name"), position: str("position") });
      break;
    default:
      Object.assign(details, { name: str("name") });
  }
  for (const key of Object.keys(details) as (keyof FormReceivedData)[]) if (details[key] === undefined) delete details[key];
  return { to: str("email"), details };
}

/** The confirmation to the person who sent the form; skipped when they gave no email. */
export async function confirmToSender(env: Env, kind: ContractFormKind | "application", data: Parsed | Application, reference: string): Promise<MailResult | null> {
  const { to, details } = confirmationData(kind, data as Parsed, reference);
  const sender = senderFor("confirmation", env.MAIL_DOMAIN, data.locale);
  if (!to || !sender || !env.EMAIL) return null;
  const mail = renderMail(formReceived(kind, data.locale, details), { siteUrl: siteUrlOf(env) });
  return sendMail(env.EMAIL, { from: sender.from, replyTo: sender.replyTo, to, ...mail });
}
