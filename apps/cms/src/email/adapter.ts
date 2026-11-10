import type { EmailAdapter, SendEmailOptions } from 'payload'
import { sendMail, senderFor, type MailBinding, type MailResult } from '@maarif/mail'

// maarifcms emails (wave 4, ADR 011) through the CMS Worker's own Cloudflare Email Service binding
// (`EMAIL` in wrangler.jsonc, Workers Paid). Payload's own emails (forgot password) and ours
// (invitations, visit confirmations, newsletter) all go through `payload.sendEmail`, which lands
// here. A message may set `from` / `replyTo` (packages/mail senderFor); otherwise it leaves as
// maarifcms account mail: noreply@ with replies to support@.
// Returns a MailResult and never throws: callers decide what a failure means.

type Address = string | { address: string; name?: string }

const addressOf = (a: Address | undefined) => (typeof a === 'string' ? a : a?.address)
const listOf = (to: unknown): string[] => (Array.isArray(to) ? to : to ? [to] : []).map((a) => addressOf(a as Address)).filter((a): a is string => Boolean(a))

/** Plain text from simple email HTML, for messages that only bring HTML (Payload's own). */
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|title|head)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim()
      return text && text !== href ? `${text} (${href})` : href
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|h2|h3|li|tr|div|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const mailDomain = () => process.env.MAIL_DOMAIN

export function cloudflareEmailAdapter(binding: () => MailBinding | undefined): EmailAdapter<MailResult> {
  return ({ payload }) => {
    const account = senderFor('account', mailDomain())
    return {
      name: 'cloudflare-email-service',
      defaultFromAddress: account?.from.email ?? 'noreply@localhost',
      defaultFromName: account?.from.name ?? 'maarifcms',
      sendEmail: async (message: SendEmailOptions): Promise<MailResult> => {
        const fallback = senderFor('account', mailDomain())
        const from = message.from ? (typeof message.from === 'string' ? { email: message.from } : { email: message.from.address, name: message.from.name }) : fallback?.from
        const replyTo = addressOf(message.replyTo as Address | undefined) ?? fallback?.replyTo
        if (!from) return { ok: false, error: 'invalid' }
        const html = typeof message.html === 'string' ? message.html : ''
        const text = typeof message.text === 'string' ? message.text : htmlToText(html)
        const headers = message.headers && !Array.isArray(message.headers) ? (Object.fromEntries(Object.entries(message.headers).filter(([, v]) => typeof v === 'string')) as Record<string, string>) : undefined
        let result: MailResult = { ok: false, error: 'invalid' }
        for (const to of listOf(message.to)) {
          result = await sendMail(binding(), { from, replyTo, to, subject: String(message.subject ?? ''), html, text, headers })
          if (!result.ok) payload.logger.warn({ msg: 'email not sent', error: result.error })
        }
        return result
      },
    }
  }
}
