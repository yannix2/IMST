import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { campusOfGrade, isGrade, isLocale, type CampusKey } from '@maarif/contracts'
import { renderMail, senderFor, visitConfirmed, type MailResult } from '@maarif/mail'
import { mailDomain } from './adapter'

// "Your visit is confirmed" (wave 4, B3). On a visit request, admissions staff set the date and
// time and the campus, tick "Send the confirmation email" and save: the parent receives the email
// in the language they used on the site, from noreply@ with replies to contact@. The box clears
// itself and the sending time is kept; a failure stops the save with a clear message.

type Visit = { confirmedFor?: string | null; campus?: CampusKey | null; sendConfirmation?: boolean | null; confirmationSentAt?: string | null }
type Inquiry = { id?: number | string; kind?: string; locale?: string; status?: string; contactName?: string; email?: string | null; grade?: string | null; visit?: Visit | null }

const why: Record<string, string> = {
  no_binding: 'Email is not set up on this server.',
  sender_domain: 'The sending domain is not ready in Cloudflare Email Service.',
  rate_limit: 'Too many emails right now. Try again in a minute.',
  daily_limit: 'The daily email limit is reached. Try again tomorrow.',
  suppressed: 'This address refused earlier emails (bounce or complaint). Call the family instead.',
  invalid: 'The email address is not valid.',
  failed: 'The email service did not accept the message.',
}

export const confirmVisit: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const next = { ...(originalDoc as Inquiry | undefined), ...(data as Inquiry) }
  const visit = next.visit
  if (next.kind !== 'visit-booking' || !visit?.sendConfirmation) return data

  if (!next.email) throw new APIError('This family gave no email address: call them to confirm the visit, then untick "Send the confirmation email".', 400)
  if (!visit.confirmedFor) throw new APIError('Choose the date and time of the visit before sending the confirmation.', 400)
  const campus: CampusKey = visit.campus ?? (next.grade && isGrade(next.grade) ? campusOfGrade(next.grade) : 'schools')
  const locale = next.locale && isLocale(next.locale) ? next.locale : 'en'

  const sender = senderFor('confirmation', mailDomain(), locale)
  const mail = renderMail(visitConfirmed(locale, { reference: String(next.id ?? ''), name: next.contactName, when: visit.confirmedFor, campus }), {
    siteUrl: process.env.SITE_URL || 'https://yassinekhiari.download',
  })
  const result = (await req.payload.sendEmail({
    to: next.email,
    ...(sender ? { from: { address: sender.from.email, name: sender.from.name }, replyTo: sender.replyTo } : {}),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  })) as MailResult | undefined
  if (!result?.ok) throw new APIError(`The confirmation email was not sent. ${why[result?.error ?? 'failed'] ?? why.failed}`, 400)

  // A confirmed visit means the family has been contacted.
  return { ...data, status: next.status === 'new' ? 'contacted' : next.status, visit: { ...visit, campus, sendConfirmation: false, confirmationSentAt: new Date().toISOString() } }
}
