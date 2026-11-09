import type { Env } from "./env";
import { cmsGet } from "./content";

// Staff notifications (wave 3, ADR 009): a short plain-text email through Cloudflare Email
// (`send_email` binding) to the addresses set in maarifcms > Site settings. The email names the
// kind of request and links to the admin; it never contains the family's or candidate's details,
// so personal data stays in maarifcms. Silently skipped when the binding, the sender or the
// recipients are missing (local development, before Email Routing is set up).

export type NotifyKind = "pre-registration" | "visit-booking" | "contact" | "feedback" | "application";

const group: Record<NotifyKind, "admissions" | "general" | "parents" | "careers"> = {
  "pre-registration": "admissions",
  "visit-booking": "admissions",
  contact: "general",
  feedback: "parents",
  application: "careers",
};

const subject: Record<NotifyKind, string> = {
  "pre-registration": "New pre-registration",
  "visit-booking": "New visit request",
  contact: "New contact message",
  feedback: "New suggestion or complaint from a parent",
  application: "New job application",
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

// A minimal RFC 5322 message, UTF-8, base64 body (no attachments, no personal data).
export function mimeMessage(from: string, to: string, title: string, body: string, date = new Date()): string {
  const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  return [
    `From: maarifcms <${from}>`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${b64(title)}?=`,
    `Date: ${date.toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${from.split("@")[1] ?? "maarif"}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(body).replace(/.{1,76}/g, "$&\r\n").trimEnd(),
  ].join("\r\n");
}

export async function notifyStaff(env: Env, kind: NotifyKind, reference: string, adminUrl: string): Promise<number> {
  if (!env.MAILER || !env.MAIL_FROM) return 0;
  const to = await recipients(env, kind);
  if (!to.length) return 0;
  const body = [
    `${subject[kind]} on the website.`,
    "",
    `Open it in maarifcms: ${adminUrl}/admin/collections/${collection[kind]}/${encodeURIComponent(reference)}`,
    "",
    "This email holds no personal details; they stay in maarifcms.",
  ].join("\n");
  let sent = 0;
  try {
    const { EmailMessage } = (await import(/* @vite-ignore */ "cloudflare:email")) as { EmailMessage: new (from: string, to: string, raw: string) => unknown };
    for (const address of to) {
      try {
        await env.MAILER.send(new EmailMessage(env.MAIL_FROM, address, mimeMessage(env.MAIL_FROM, address, subject[kind], body)) as never);
        sent++;
      } catch {
        // Address not verified in Email Routing, or sending refused: the entry is in maarifcms anyway.
      }
    }
  } catch {
    return 0;
  }
  return sent;
}
