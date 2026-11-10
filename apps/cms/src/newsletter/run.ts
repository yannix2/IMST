import type { PayloadRequest } from 'payload'
import { isLocale, toRichBlocks, type Locale } from '@maarif/contracts'
import { newsletterIssue, newsletterSent, renderMail, senderFor, type MailResult } from '@maarif/mail'
import { mailDomain } from '../email/adapter'
import { unsubscribeToken } from './tokens'

// The newsletter sender (wave 4, B4). maarif-api's cron calls POST /cms-api/newsletters/run every
// five minutes (shared MAINTENANCE_SECRET). Each run takes the oldest newsletter in "sending" and
// emails the next BATCH confirmed subscribers, one email each (their own unsubscribe link), in
// their language, English when the newsletter has no version in it. Progress (cursor, counts) is
// saved after every run, so a stopped run resumes where it left off.
//  - rate or daily limit, missing binding or domain: stop now, retry on the next run;
//  - address suppressed (bounce, complaint) or invalid: counted as failed, subscriber unsubscribed;
//  - other failure: counted as failed, moves on.
// When every subscriber is done: status "sent", the date, and staff (Site settings > general) get
// a short report.

export const BATCH = 200

type Localized<T> = Partial<Record<Locale, T>> | T | undefined
export type NewsletterDoc = {
  id: number
  subject?: Localized<string>
  preheader?: Localized<string>
  body?: Localized<unknown>
  status?: string
  stats?: { total?: number; sent?: number; failed?: number; cursor?: number } | null
}
type SubscriberDoc = { id: number; email: string; locale?: string }

const siteUrl = () => (process.env.SITE_URL || 'https://yassinekhiari.download').replace(/\/$/, '')
const adminUrl = () => (process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms.yassinekhiari.download').replace(/\/$/, '')

const pick = <T>(value: Localized<T>, locale: Locale): T | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'fr' in value || 'ar' in value || 'tr' in value) ? (value as Partial<Record<Locale, T>>)[locale] : undefined

/** The language a subscriber reads this newsletter in: theirs when it exists, else English. */
export function versionFor(doc: NewsletterDoc, locale: string | undefined): Locale | null {
  const has = (l: Locale) => Boolean(pick(doc.subject, l)?.trim()) && toRichBlocks(pick(doc.body, l)).length > 0
  if (locale && isLocale(locale) && has(locale)) return locale
  return has('en') ? 'en' : null
}

/** One subscriber's email (subject, html, text, unsubscribe headers). */
export function issueFor(doc: NewsletterDoc, sub: { id: number | string; locale?: string }) {
  const locale = versionFor(doc, sub.locale)
  if (!locale) return null
  const token = unsubscribeToken(sub.id)
  const page = `${siteUrl()}/${locale}/newsletter/unsubscribe?t=${token}`
  const oneClick = `${siteUrl()}/api/newsletter/unsubscribe?t=${token}`
  const mail = renderMail(
    newsletterIssue(locale, { subject: pick(doc.subject, locale)!.trim(), preheader: pick(doc.preheader, locale)?.trim() || undefined, blocks: toRichBlocks(pick(doc.body, locale)), unsubscribeUrl: page }),
    { siteUrl: siteUrl() },
  )
  return { ...mail, headers: { 'List-Unsubscribe': `<${oneClick}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }
}

export async function sendIssue(req: PayloadRequest, doc: NewsletterDoc, sub: SubscriberDoc, to = sub.email): Promise<MailResult> {
  const issue = issueFor(doc, sub)
  if (!issue) return { ok: false, error: 'invalid' }
  const sender = senderFor('newsletter', mailDomain(), isLocale(sub.locale ?? '') ? (sub.locale as Locale) : 'en')
  const result = (await req.payload.sendEmail({
    to,
    ...(sender ? { from: { address: sender.from.email, name: sender.from.name }, replyTo: sender.replyTo } : {}),
    subject: issue.subject,
    html: issue.html,
    text: issue.text,
    headers: issue.headers,
  })) as MailResult | undefined
  return result ?? { ok: false, error: 'failed' }
}

const STOP = new Set(['rate_limit', 'daily_limit', 'no_binding', 'sender_domain'])
const DROP = new Set(['suppressed', 'invalid'])

export async function runNewsletter(req: PayloadRequest): Promise<{ newsletter: number | null; sent: number; failed: number; done: boolean; stopped?: string }> {
  const { docs } = await req.payload.find({ collection: 'newsletters', where: { status: { equals: 'sending' } }, sort: 'stats.sendRequestedAt', limit: 1, depth: 0, locale: 'all', overrideAccess: true, req })
  const doc = docs[0] as unknown as NewsletterDoc | undefined
  if (!doc) return { newsletter: null, sent: 0, failed: 0, done: true }

  const stats = { total: doc.stats?.total ?? 0, sent: doc.stats?.sent ?? 0, failed: doc.stats?.failed ?? 0, cursor: doc.stats?.cursor ?? 0 }
  const { docs: subs } = await req.payload.find({
    collection: 'subscribers',
    where: { and: [{ status: { equals: 'confirmed' } }, { id: { greater_than: stats.cursor } }] },
    sort: 'id',
    limit: BATCH,
    depth: 0,
    overrideAccess: true,
    req,
  })

  let sent = 0
  let failed = 0
  let stopped: string | undefined
  for (const s of subs as unknown as SubscriberDoc[]) {
    const result = await sendIssue(req, doc, s)
    if (!result.ok && STOP.has(result.error)) {
      stopped = result.error
      break
    }
    if (result.ok) sent++
    else {
      failed++
      if (DROP.has(result.error)) {
        await req.payload.update({ collection: 'subscribers', id: s.id, data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString(), unsubscribeReason: 'bounced' }, overrideAccess: true, req, context: { skipAudit: true } })
      }
    }
    stats.cursor = s.id
  }
  stats.sent += sent
  stats.failed += failed
  const done = !stopped && subs.length < BATCH
  await req.payload.update({
    collection: 'newsletters',
    id: doc.id,
    data: { stats: { ...stats, ...(done ? { sentAt: new Date().toISOString() } : {}) }, ...(done ? { status: 'sent' } : {}) },
    overrideAccess: true,
    req,
    context: { newsletterSystem: true, skipAudit: true },
  })
  if (done) await reportToStaff(req, doc, stats).catch(() => {})
  return { newsletter: doc.id, sent, failed, done, stopped }
}

async function reportToStaff(req: PayloadRequest, doc: NewsletterDoc, stats: { sent: number; failed: number }) {
  const settings = (await req.payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true, req })) as { notifications?: { general?: { email?: string }[] } }
  const to = (settings.notifications?.general ?? []).map((r) => r.email).filter((e): e is string => Boolean(e))
  if (!to.length) return
  const sender = senderFor('staff', mailDomain())
  const mail = renderMail(newsletterSent({ subject: pick(doc.subject, 'en') ?? `#${doc.id}`, sent: stats.sent, failed: stats.failed, url: `${adminUrl()}/admin/collections/newsletters/${doc.id}` }), { siteUrl: siteUrl() })
  for (const address of to) {
    await req.payload.sendEmail({ to: address, ...(sender ? { from: { address: sender.from.email, name: sender.from.name }, replyTo: sender.replyTo } : {}), subject: mail.subject, html: mail.html, text: mail.text })
  }
}
