import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import { isLocale, type Locale } from '@maarif/contracts'
import { accountInvite, passwordReset, renderMail, senderFor } from '@maarif/mail'
import { mailDomain } from './adapter'

// maarifcms account emails (wave 4, B3), in the person's "Language of emails".
//  - Forgot password: Payload's own flow, restyled with the school layout (1 hour).
//  - Invitation: when an administrator creates an account, the person gets "You have a maarifcms
//    account" with a "Set your password" button (/admin/reset/<token>, valid 72 hours). The
//    administrator types any temporary password; the person chooses their own.

export const RESET_HOURS = 1
export const INVITE_HOURS = 72

type UserDoc = { id: number | string; email?: string; name?: string; language?: string | null }

const adminUrl = () => (process.env.PAYLOAD_PUBLIC_SERVER_URL || 'https://cms.yassinekhiari.download').replace(/\/$/, '')
const brand = () => ({ siteUrl: process.env.SITE_URL || 'https://yassinekhiari.download' })
export const resetUrl = (token: string) => `${adminUrl()}/admin/reset/${encodeURIComponent(token)}`
export const languageOf = (user: UserDoc | null | undefined): Locale => (user?.language && isLocale(user.language) ? user.language : 'en')

const resetMail = (user: UserDoc, token: string) => renderMail(passwordReset(languageOf(user), { name: user.name, url: resetUrl(token), hours: RESET_HOURS }), brand())

export const forgotPasswordEmail = {
  generateEmailSubject: ({ user }: { user?: unknown }) => resetMail((user ?? {}) as UserDoc, 'x').subject,
  generateEmailHTML: ({ token, user }: { token?: string; user?: unknown }) => resetMail((user ?? {}) as UserDoc, token ?? '').html,
}

/** Sends the invitation for a new account. Returns false when it could not be sent. */
export async function sendInvite(req: PayloadRequest, user: UserDoc): Promise<boolean> {
  if (!user.email) return false
  const token = await req.payload.forgotPassword({ collection: 'users', data: { email: user.email }, disableEmail: true, expiration: INVITE_HOURS * 3_600_000, req })
  if (typeof token !== 'string' || !token) return false
  const locale = languageOf(user)
  const sender = senderFor('account', mailDomain(), locale)
  const mail = renderMail(accountInvite(locale, { email: user.email, name: user.name, url: resetUrl(token), hours: INVITE_HOURS }), brand())
  const result = (await req.payload.sendEmail({
    to: user.email,
    ...(sender ? { from: { address: sender.from.email, name: sender.from.name }, replyTo: sender.replyTo } : {}),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  })) as { ok?: boolean } | undefined
  return Boolean(result?.ok)
}

// After an administrator creates an account (not the very first account, which its owner creates
// for themselves, and not seed scripts: context { skipInvite: true }).
export const inviteOnCreate: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  const skip = (req.context as { skipInvite?: boolean } | undefined)?.skipInvite
  if (operation !== 'create' || skip || !req.user) return doc
  const sent = await sendInvite(req, doc as UserDoc).catch(() => false)
  if (!sent) req.payload.logger.warn({ msg: 'invitation email not sent', user: `users #${String(doc.id)}` })
  return doc
}
