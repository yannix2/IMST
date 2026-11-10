// Sending through Cloudflare Email Service (the `send_email` binding of a Worker, Workers Paid:
// any recipient). The binding is typed here structurally so this package needs no Workers types.
// Errors come back as short codes, never thrown: an email that cannot leave must not break a
// form, a sign-up or an admin save (the entry is stored in maarifcms either way).

export type MailAddress = { email: string; name?: string };

export type MailMessage = {
  from: MailAddress;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
};

export interface MailBinding {
  send(message: {
    from: string | { email: string; name: string };
    to: string;
    replyTo?: string;
    subject: string;
    html?: string;
    text?: string;
    headers?: Record<string, string>;
  }): Promise<{ messageId: string }>;
}

// no_binding: no EMAIL binding (local development). invalid: bad recipient address.
// sender_domain: the domain is not onboarded in Email Sending. rate_limit / daily_limit: try
// later (the newsletter sender stops and resumes on the next run). suppressed: the address
// bounced or complained before; never retry it.
export type MailError = "no_binding" | "invalid" | "sender_domain" | "rate_limit" | "daily_limit" | "suppressed" | "failed";
// Both shapes name both keys so `result.error` reads the same with or without strictNullChecks
// (maarifcms compiles without it).
export type MailResult = { ok: true; id: string; error?: undefined } | { ok: false; error: MailError; id?: undefined };

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/;
export const isEmail = (value: unknown): value is string => typeof value === "string" && value.length <= 254 && EMAIL.test(value);

// The documented Email Service error codes (checked 2026-11-09); anything else is "failed".
const codes: Record<string, MailError> = {
  E_SENDER_DOMAIN_NOT_AVAILABLE: "sender_domain",
  E_RATE_LIMIT_EXCEEDED: "rate_limit",
  E_DAILY_LIMIT_EXCEEDED: "daily_limit",
  E_RECIPIENT_SUPPRESSED: "suppressed",
};

/** Maps an Email Service error (its `code`, or an E_… word in the message) to a MailError. */
export function mailErrorCode(error: unknown): MailError {
  const e = error as { code?: unknown; message?: unknown } | null;
  const raw = [e?.code, e?.message].filter((x): x is string => typeof x === "string").join(" ");
  const word = raw.match(/E_[A-Z_]+/)?.[0];
  return (word && codes[word]) || "failed";
}

// Header values must stay on one line (no header injection through a subject or a name).
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export async function sendMail(binding: MailBinding | undefined, message: MailMessage): Promise<MailResult> {
  if (!binding) return { ok: false, error: "no_binding" };
  if (!isEmail(message.to) || !isEmail(message.from.email) || (message.replyTo && !isEmail(message.replyTo))) {
    return { ok: false, error: "invalid" };
  }
  const headers = message.headers ? Object.fromEntries(Object.entries(message.headers).map(([k, v]) => [k, oneLine(v)])) : undefined;
  try {
    const result = await binding.send({
      from: message.from.name ? { email: message.from.email, name: oneLine(message.from.name) } : message.from.email,
      to: message.to,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      subject: oneLine(message.subject),
      html: message.html,
      text: message.text,
      ...(headers ? { headers } : {}),
    });
    return { ok: true, id: result?.messageId ?? "" };
  } catch (error) {
    return { ok: false, error: mailErrorCode(error) };
  }
}
