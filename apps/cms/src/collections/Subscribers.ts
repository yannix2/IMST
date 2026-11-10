import type { CollectionConfig, Endpoint, PayloadRequest } from 'payload'
import { isLocale, locales } from '@maarif/contracts'
import { isEmail, newsletterConfirm, renderMail, senderFor } from '@maarif/mail'
import { adminOnly, hasRole, isGateway } from '../access/roles'
import { mailDomain } from '../email/adapter'
import { exportCsv } from '../endpoints/exportCsv'
import { confirmToken, tokenId, verifyToken } from '../newsletter/tokens'

// Newsletter subscribers (wave 4, B4; owner decision 2026-11-09): only people who sign up on the
// website, with double opt-in. The site's footer form goes through maarif-api (Turnstile, rate
// limit), which calls the endpoints below with its gateway key:
//   POST /cms-api/subscribers/subscribe    { email, locale }  creates or refreshes a pending
//                                          subscriber and emails the confirmation link
//   POST /cms-api/subscribers/confirm      { t }  pending -> confirmed
//   POST /cms-api/subscribers/unsubscribe  { t }  -> unsubscribed (one click)
// Every answer is the same whether the address was known or not (nothing to learn by probing).
// Personal data: administrators only; the audit log records "#id", never the address.

const siteUrl = () => (process.env.SITE_URL || 'https://yassinekhiari.download').replace(/\/$/, '')
// A pending address gets at most one confirmation email per 10 minutes.
const RESEND_AFTER_MS = 10 * 60_000

type Sub = { id: number; email: string; locale?: string; status?: string; updatedAt?: string }

async function body(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return ((await req.json?.()) ?? {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

const ok = (extra: Record<string, unknown> = {}) => Response.json({ ok: true, ...extra })
const forbidden = () => Response.json({ ok: false, error: 'forbidden' }, { status: 403 })
const invalid = () => Response.json({ ok: false, error: 'invalid' }, { status: 400 })

async function findByEmail(req: PayloadRequest, email: string): Promise<Sub | undefined> {
  const { docs } = await req.payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1, depth: 0, overrideAccess: true, req })
  return docs[0] as Sub | undefined
}

async function sendConfirmation(req: PayloadRequest, sub: Sub) {
  const locale = sub.locale && isLocale(sub.locale) ? sub.locale : 'en'
  const sender = senderFor('newsletter', mailDomain(), locale)
  const url = `${siteUrl()}/api/newsletter/confirm?t=${confirmToken(sub.id, sub.email)}`
  const mail = renderMail(newsletterConfirm(locale, { url }), { siteUrl: siteUrl() })
  await req.payload.sendEmail({
    to: sub.email,
    ...(sender ? { from: { address: sender.from.email, name: sender.from.name }, replyTo: sender.replyTo } : {}),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  })
}

const subscribe: Endpoint = {
  path: '/subscribe',
  method: 'post',
  handler: async (req) => {
    if (!isGateway(req)) return forbidden()
    const data = await body(req)
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
    const locale = typeof data.locale === 'string' && isLocale(data.locale) ? data.locale : 'en'
    if (!isEmail(email)) return invalid()
    const now = new Date().toISOString()
    const existing = await findByEmail(req, email)
    if (existing?.status === 'confirmed') return ok()
    if (existing?.status === 'pending' && existing.updatedAt && Date.now() - Date.parse(existing.updatedAt) < RESEND_AFTER_MS) return ok()
    const sub = (existing
      ? await req.payload.update({ collection: 'subscribers', id: existing.id, data: { status: 'pending', locale, consentAt: now }, overrideAccess: true, req, context: { skipAudit: true } })
      : await req.payload.create({ collection: 'subscribers', data: { email, locale, status: 'pending', consentAt: now }, overrideAccess: true, req, context: { skipAudit: true } })) as unknown as Sub
    await sendConfirmation(req, sub).catch(() => {})
    return ok()
  },
}

function tokenEndpoint(path: string, purpose: 'confirm' | 'unsubscribe'): Endpoint {
  return {
    path,
    method: 'post',
    handler: async (req) => {
      if (!isGateway(req)) return forbidden()
      const { t } = await body(req)
      const id = tokenId(t)
      if (id == null) return invalid()
      const sub = (await req.payload.findByID({ collection: 'subscribers', id, depth: 0, overrideAccess: true, req, disableErrors: true })) as Sub | null
      if (!sub || !verifyToken(String(t), purpose, sub.id, sub.email)) return invalid()
      const locale = sub.locale && isLocale(sub.locale) ? sub.locale : 'en'
      const now = new Date().toISOString()
      if (purpose === 'confirm') {
        // Only a pending sign-up can be confirmed: an old link never re-subscribes someone who left.
        if (sub.status === 'unsubscribed') return invalid()
        if (sub.status !== 'confirmed') await req.payload.update({ collection: 'subscribers', id: sub.id, data: { status: 'confirmed', confirmedAt: now }, overrideAccess: true, req, context: { skipAudit: true } })
      } else if (sub.status !== 'unsubscribed') {
        await req.payload.update({ collection: 'subscribers', id: sub.id, data: { status: 'unsubscribed', unsubscribedAt: now, unsubscribeReason: 'request' }, overrideAccess: true, req, context: { skipAudit: true } })
      }
      return ok({ locale })
    },
  }
}

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Newsletter subscriber', plural: 'Newsletter subscribers' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'locale', 'status', 'confirmedAt'],
    group: 'Newsletter',
    description: 'People who signed up on the website. Only confirmed addresses receive the newsletter; nobody can be added by hand.',
    components: { beforeListTable: [{ path: '/components/admin/ExportButton#ExportButton', clientProps: { collection: 'subscribers' } }] },
  },
  endpoints: [
    subscribe,
    tokenEndpoint('/confirm', 'confirm'),
    tokenEndpoint('/unsubscribe', 'unsubscribe'),
    exportCsv('subscribers', ['admin'], [
      { label: 'Email', value: (d) => d.email },
      { label: 'Language', value: (d) => d.locale },
      { label: 'Status', value: (d) => d.status },
      { label: 'Signed up', value: (d) => d.consentAt },
      { label: 'Confirmed', value: (d) => d.confirmedAt },
      { label: 'Unsubscribed', value: (d) => d.unsubscribedAt },
    ]),
  ],
  access: {
    read: ({ req }) => hasRole(req, 'admin'),
    // Sign-ups only through the website (double opt-in): no hand-made subscribers.
    create: () => false,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'locale', label: 'Language', type: 'select', required: true, defaultValue: 'en', options: [...locales] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Waiting for confirmation', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
    },
    { name: 'consentAt', label: 'Signed up (consent given)', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'confirmedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'unsubscribedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'unsubscribeReason',
      type: 'select',
      admin: { readOnly: true },
      options: [
        { label: 'Asked to stop', value: 'request' },
        { label: 'Address bounced or complained', value: 'bounced' },
      ],
    },
  ],
  timestamps: true,
}
