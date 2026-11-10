import type { Locale } from "@maarif/contracts/locales";
import type { MailAddress } from "./send";
import { schoolName } from "./school";

// Who sends what (owner, 2026-11-09). Only the domain is configured (Worker var MAIL_DOMAIN), so
// moving from the demo domain to the school's own domain is one variable per Worker.
//
//   case          from        reply-to
//   confirmation  noreply@    contact@    automatic answers to families and candidates
//   staff         noreply@    contact@    "new entry" notifications to staff
//   account       noreply@    support@    maarifcms invitations and password reset
//   newsletter    info@       info@       the newsletter and its sign-up confirmation

export type MailCase = "confirmation" | "staff" | "account" | "newsletter";

const parts: Record<MailCase, { from: string; replyTo: string }> = {
  confirmation: { from: "noreply", replyTo: "contact" },
  staff: { from: "noreply", replyTo: "contact" },
  account: { from: "noreply", replyTo: "support" },
  newsletter: { from: "info", replyTo: "info" },
};

const DOMAIN = /^(?=.{3,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function senderFor(kind: MailCase, domain: string | undefined, locale: Locale = "en"): { from: MailAddress; replyTo: string } | null {
  if (!domain || !DOMAIN.test(domain)) return null;
  const p = parts[kind];
  const name = kind === "account" ? "maarifcms" : kind === "staff" ? "Maarif website" : schoolName[locale];
  return { from: { email: `${p.from}@${domain}`, name }, replyTo: `${p.replyTo}@${domain}` };
}
