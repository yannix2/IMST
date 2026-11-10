import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cloudflareEmailAdapter, htmlToText } from '@/email/adapter'
import { INVITE_HOURS } from '@/email/accounts'
import { confirmToken, unsubscribeToken, verifyToken } from '@/newsletter/tokens'
import { runNewsletter } from '@/newsletter/run'
import { Subscribers } from '@/collections/Subscribers'

// Wave 4 emails (docs/plans/2026-11-10-wave-4.md, B3 and B4), against the local D1 database.
// Emails are captured by replacing payload.sendEmail; the Cloudflare binding is tested on its own.

let payload: Payload
const run = `w4${Date.now()}`
type AuthAs = Record<string, unknown> & { collection: string }
const as: Record<'admin' | 'admissions' | 'reviewer' | 'editor' | 'gateway', AuthAs> = {} as never
const created: { collection: string; id: number | string }[] = []
const keep = (collection: string, id: number | string) => created.push({ collection, id })
type Sent = { to: string; subject: string; html: string; text: string; from?: { address: string }; replyTo?: string; headers?: Record<string, string> }
let sent: Sent[] = []
let nextResult: (to: string) => { ok: boolean; error?: string } = () => ({ ok: true })

const lexical = (text: string) => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] }] },
})

beforeAll(async () => {
  const env = process.env as Record<string, string | undefined>
  env.MAIL_DOMAIN = 'school.test'
  env.SITE_URL = 'https://site.test'
  env.PAYLOAD_PUBLIC_SERVER_URL = 'https://cms.site.test'
  payload = await getPayload({ config: await config })
  const capture = (async (message: Sent) => {
    sent.push(message)
    return nextResult(message.to)
  }) as never
  // Our hooks call payload.sendEmail; Payload's own forgot-password calls payload.email.sendEmail.
  payload.sendEmail = capture
  payload.email = { ...payload.email, sendEmail: capture }
  for (const role of ['admin', 'admissions', 'reviewer', 'editor'] as const) {
    const user = await payload.create({ collection: 'users', data: { email: `${role}.${run}@example.test`, password: `Long-${run}-password`, name: role, roles: [role] } })
    keep('users', user.id)
    as[role] = { ...user, collection: 'users' }
  }
  const client = await payload.create({ collection: 'api-clients', data: { name: `gateway ${run}` } })
  keep('api-clients', client.id)
  as.gateway = { ...client, collection: 'api-clients' }
})

beforeEach(() => {
  sent = []
  nextResult = () => ({ ok: true })
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) {
    try {
      await payload.delete({ collection: collection as never, id, overrideAccess: true, context: { skipRefresh: true, newsletterSystem: true } })
    } catch {
      // already gone
    }
  }
})

describe('email adapter (Cloudflare Email Service binding)', () => {
  it('sends as maarifcms account mail by default, with a text version', async () => {
    const send = vi.fn(async () => ({ messageId: 'm1' }))
    const adapter = cloudflareEmailAdapter(() => ({ send }))({ payload: { logger: { warn: vi.fn() } } as never })
    const result = await adapter.sendEmail({ to: 'person@example.test', subject: 'Reset', html: '<p>Hello <a href="https://x.test/r">Choose</a></p>' })
    expect(result).toEqual({ ok: true, id: 'm1' })
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ from: { email: 'noreply@school.test', name: 'maarifcms' }, replyTo: 'support@school.test', to: 'person@example.test', text: 'Hello Choose (https://x.test/r)' }))
  })

  it('reports a missing binding instead of throwing', async () => {
    const warn = vi.fn()
    const adapter = cloudflareEmailAdapter(() => undefined)({ payload: { logger: { warn } } as never })
    expect(await adapter.sendEmail({ to: 'a@example.test', subject: 's', html: '<p>x</p>' })).toEqual({ ok: false, error: 'no_binding' })
    expect(JSON.stringify(warn.mock.calls)).not.toContain('a@example.test')
    expect(htmlToText('<h1>A</h1><p>B &amp; C</p>')).toBe('A\n\nB & C')
  })
})

describe('staff accounts: invitation and reset', () => {
  it('emails a new account a 72-hour "set your password" link in its language', async () => {
    const before = Date.now()
    const user = await payload.create({ collection: 'users', data: { email: `new.${run}@example.test`, password: `Temporary-${run}`, name: 'Amel', roles: ['editor'], language: 'fr' }, user: as.admin, overrideAccess: false })
    keep('users', user.id)
    expect(sent).toHaveLength(1)
    expect(sent[0]!.to).toBe(`new.${run}@example.test`)
    expect(sent[0]!.subject).toBe('Votre compte maarifcms est prêt')
    expect(sent[0]!.text).toMatch(/https:\/\/cms\.site\.test\/admin\/reset\/[0-9a-f]{40}/)
    expect(sent[0]!.from?.address).toBe('noreply@school.test')
    expect(sent[0]!.replyTo).toBe('support@school.test')
    const stored = (await payload.find({ collection: 'users', where: { id: { equals: user.id } }, showHiddenFields: true, overrideAccess: true })).docs[0] as { resetPasswordExpiration?: string }
    const hours = (Date.parse(stored.resetPasswordExpiration!) - before) / 3_600_000
    expect(hours).toBeGreaterThan(INVITE_HOURS - 1)
    expect(hours).toBeLessThan(INVITE_HOURS + 1)
  })

  it('sends no invitation for an account created without a logged-in administrator (first account, scripts)', async () => {
    const user = await payload.create({ collection: 'users', data: { email: `script.${run}@example.test`, password: `Long-${run}-password`, name: 'Script', roles: ['editor'] } })
    keep('users', user.id)
    expect(sent).toHaveLength(0)
  })

  it('restyles the forgot-password email (1 hour)', async () => {
    await payload.forgotPassword({ collection: 'users', data: { email: `editor.${run}@example.test` } })
    expect(sent).toHaveLength(1)
    expect(sent[0]!.subject).toBe('Reset your maarifcms password')
    expect(sent[0]!.html).toContain('background:#00adbb')
    expect(sent[0]!.html).toContain('The link works for 1 hour.')
  })
})

describe('visit confirmation', () => {
  const visit = (email?: string) =>
    payload.create({
      collection: 'inquiries',
      data: { kind: 'visit-booking', locale: 'ar', status: 'new', contactName: 'ليلى', phone: '+21622123456', email, grade: 'year-11', details: { preferredDate: '2026-12-03', preferredSlot: 'morning' }, privacyNoticeAcceptedAt: new Date().toISOString() },
      user: as.gateway,
      overrideAccess: false,
    })

  it('emails the parent in their language when staff tick the box, then clears it', async () => {
    const inquiry = await visit('parent@example.test')
    keep('inquiries', inquiry.id)
    const updated = (await payload.update({ collection: 'inquiries', id: inquiry.id, data: { visit: { confirmedFor: '2026-12-03T08:30:00.000Z', sendConfirmation: true } }, user: as.admissions, overrideAccess: false })) as { status: string; visit: { sendConfirmation: boolean; confirmationSentAt?: string; campus?: string } }
    expect(sent).toHaveLength(1)
    expect(sent[0]!.to).toBe('parent@example.test')
    expect(sent[0]!.subject).toMatch(/^تم تأكيد زيارتكم/)
    expect(sent[0]!.text).toContain('09:30')
    expect(sent[0]!.text).toContain('Charguia 2')
    expect(sent[0]!.replyTo).toBe('contact@school.test')
    expect(updated.visit.sendConfirmation).toBe(false)
    expect(updated.visit.confirmationSentAt).toBeTruthy()
    expect(updated.visit.campus).toBe('highSchool')
    expect(updated.status).toBe('contacted')
  })

  it('refuses without an email address or a date, and when the email fails', async () => {
    const noEmail = await visit()
    keep('inquiries', noEmail.id)
    await expect(payload.update({ collection: 'inquiries', id: noEmail.id, data: { visit: { confirmedFor: '2026-12-03T08:30:00.000Z', sendConfirmation: true } }, user: as.admissions, overrideAccess: false })).rejects.toThrow(/no email address/)
    const noDate = await visit('parent2@example.test')
    keep('inquiries', noDate.id)
    await expect(payload.update({ collection: 'inquiries', id: noDate.id, data: { visit: { sendConfirmation: true } }, user: as.admissions, overrideAccess: false })).rejects.toThrow(/date and time/)
    nextResult = () => ({ ok: false, error: 'daily_limit' })
    await expect(payload.update({ collection: 'inquiries', id: noDate.id, data: { visit: { confirmedFor: '2026-12-03T08:30:00.000Z', sendConfirmation: true } }, user: as.admissions, overrideAccess: false })).rejects.toThrow(/daily email limit/)
  })
})

describe('newsletter subscribers (double opt-in)', () => {
  const endpoint = (path: string) => Subscribers.endpoints && (Subscribers.endpoints as { path: string; handler: (req: PayloadRequest) => Promise<Response> }[]).find((e) => e.path === path)!
  async function call(path: string, user: AuthAs | null, body: Record<string, unknown>) {
    const req = await createLocalReq({ user: user as never }, payload)
    req.json = async () => body
    const response = await endpoint(path).handler(req)
    return { status: response.status, body: (await response.json()) as Record<string, unknown> }
  }

  it('signs up, confirms and unsubscribes with signed links, through the gateway only', async () => {
    const email = `fan.${run}@example.test`
    expect((await call('/subscribe', as.editor, { email, locale: 'tr' })).status).toBe(403)
    expect((await call('/subscribe', as.gateway, { email: email.toUpperCase(), locale: 'tr' })).status).toBe(200)
    const sub = (await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, overrideAccess: true })).docs[0] as { id: number; status: string }
    keep('subscribers', sub.id)
    expect(sub.status).toBe('pending')
    expect(sent).toHaveLength(1)
    expect(sent[0]!.subject).toBe('Lütfen aboneliğinizi onaylayın')
    expect(sent[0]!.from?.address).toBe('info@school.test')
    const token = /\/api\/newsletter\/confirm\?t=([\w.-]+)/.exec(sent[0]!.text)![1]!
    expect(token).toBe(confirmToken(sub.id, email))

    // A second sign-up within 10 minutes sends nothing more and says the same.
    expect((await call('/subscribe', as.gateway, { email, locale: 'tr' })).body).toEqual({ ok: true })
    expect(sent).toHaveLength(1)

    expect((await call('/confirm', as.gateway, { t: `${sub.id}.${'x'.repeat(32)}` })).status).toBe(400)
    expect((await call('/confirm', as.gateway, { t: token })).body).toEqual({ ok: true, locale: 'tr' })
    expect(((await payload.findByID({ collection: 'subscribers', id: sub.id, overrideAccess: true })) as { status: string }).status).toBe('confirmed')

    expect((await call('/unsubscribe', as.gateway, { t: token })).status).toBe(400)
    expect((await call('/unsubscribe', as.gateway, { t: unsubscribeToken(sub.id) })).body).toEqual({ ok: true, locale: 'tr' })
    expect(((await payload.findByID({ collection: 'subscribers', id: sub.id, overrideAccess: true })) as { status: string }).status).toBe('unsubscribed')
    // The old confirmation link never re-subscribes someone who left.
    expect((await call('/confirm', as.gateway, { t: token })).status).toBe(400)
  })

  it('keeps subscribers away from everyone but administrators, and refuses hand-made ones', async () => {
    await expect(payload.find({ collection: 'subscribers', user: as.reviewer, overrideAccess: false })).rejects.toThrow()
    await expect(payload.create({ collection: 'subscribers', data: { email: `hand.${run}@example.test`, locale: 'en', status: 'confirmed' }, user: as.admin, overrideAccess: false })).rejects.toThrow()
    expect(verifyToken(unsubscribeToken(5), 'unsubscribe', 6)).toBe(false)
  })
})

describe('newsletter sending', () => {
  it('sends each confirmed subscriber their language (English fallback), drops bounced addresses, then marks it sent', async () => {
    const subs: { id: number; email: string }[] = []
    for (const [name, locale] of [['fr', 'fr'], ['ar', 'ar'], ['bounce', 'en']] as const) {
      const s = (await payload.create({ collection: 'subscribers', data: { email: `${name}.${run}@example.test`, locale, status: 'confirmed', consentAt: new Date().toISOString() }, overrideAccess: true })) as unknown as { id: number; email: string }
      keep('subscribers', s.id)
      subs.push(s)
    }
    const doc = (await payload.create({ collection: 'newsletters', locale: 'en', data: { subject: `November ${run}`, body: lexical('Hello families'), status: 'ready' } as never, user: as.editor, overrideAccess: false })) as unknown as { id: number }
    keep('newsletters', doc.id)
    await payload.update({ collection: 'newsletters', id: doc.id, locale: 'fr', data: { subject: `Novembre ${run}`, body: lexical('Bonjour les familles') } as never, user: as.editor, overrideAccess: false })

    // Staff cannot set "sending" themselves.
    await expect(payload.update({ collection: 'newsletters', id: doc.id, data: { status: 'sending' } as never, user: as.reviewer, overrideAccess: false })).rejects.toThrow(/Send/)
    await payload.update({ collection: 'newsletters', id: doc.id, data: { status: 'sending', stats: { total: 3, sent: 0, failed: 0, cursor: Math.min(...subs.map((s) => s.id)) - 1 } } as never, overrideAccess: true, context: { newsletterSystem: true } })

    nextResult = (to) => (to.startsWith('bounce.') ? { ok: false, error: 'suppressed' } : { ok: true })
    const req = await createLocalReq({}, payload)
    const result = await runNewsletter(req)
    expect(result).toMatchObject({ newsletter: doc.id, done: true })
    const mine = sent.filter((m) => m.to.endsWith(`${run}@example.test`))
    expect(mine.find((m) => m.to.startsWith('fr.'))!.subject).toBe(`Novembre ${run}`)
    expect(mine.find((m) => m.to.startsWith('ar.'))!.subject).toBe(`November ${run}`) // no Arabic version: English
    const fr = mine.find((m) => m.to.startsWith('fr.'))!
    expect(fr.headers?.['List-Unsubscribe']).toMatch(/^<https:\/\/site\.test\/api\/newsletter\/unsubscribe\?t=\d+\.[\w-]{32}>$/)
    expect(fr.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
    expect(fr.text).toContain('https://site.test/fr/newsletter/unsubscribe?t=')
    expect(fr.from?.address).toBe('info@school.test')

    const bounced = (await payload.findByID({ collection: 'subscribers', id: subs[2]!.id, overrideAccess: true })) as { status: string; unsubscribeReason: string }
    expect(bounced).toMatchObject({ status: 'unsubscribed', unsubscribeReason: 'bounced' })
    const after = (await payload.findByID({ collection: 'newsletters', id: doc.id, overrideAccess: true })) as unknown as { status: string; stats: { sent: number; failed: number; sentAt?: string } }
    expect(after.status).toBe('sent')
    expect(after.stats.sent).toBeGreaterThanOrEqual(2)
    expect(after.stats.failed).toBeGreaterThanOrEqual(1)
    expect(after.stats.sentAt).toBeTruthy()
    await expect(payload.update({ collection: 'newsletters', id: doc.id, data: { subject: 'Changed' } as never, user: as.reviewer, overrideAccess: false })).rejects.toThrow(/can no longer change/)
  })

  it('stops on the daily limit and resumes from the same subscriber', async () => {
    const s = (await payload.create({ collection: 'subscribers', data: { email: `limit.${run}@example.test`, locale: 'en', status: 'confirmed' }, overrideAccess: true })) as unknown as { id: number }
    keep('subscribers', s.id)
    const doc = (await payload.create({ collection: 'newsletters', locale: 'en', data: { subject: `Limit ${run}`, body: lexical('Hi') } as never, overrideAccess: true })) as unknown as { id: number }
    keep('newsletters', doc.id)
    await payload.update({ collection: 'newsletters', id: doc.id, data: { status: 'sending', stats: { total: 1, sent: 0, failed: 0, cursor: s.id - 1, sendRequestedAt: new Date(0).toISOString() } } as never, overrideAccess: true, context: { newsletterSystem: true } })
    nextResult = () => ({ ok: false, error: 'daily_limit' })
    const req = await createLocalReq({}, payload)
    expect(await runNewsletter(req)).toMatchObject({ newsletter: doc.id, done: false, stopped: 'daily_limit', sent: 0 })
    nextResult = () => ({ ok: true })
    expect(await runNewsletter(req)).toMatchObject({ newsletter: doc.id, done: true, sent: 1 })
  })
})
