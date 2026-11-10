import { createHmac, timingSafeEqual } from 'crypto'

// Links in newsletter emails (wave 4, B4) carry "<subscriber id>.<signature>". The signature is an
// HMAC of the purpose and the subscriber with PAYLOAD_SECRET, so nothing has to be stored, a link
// cannot be guessed or moved to another subscriber, and unsubscribe links keep working forever.
// The confirmation link also signs the email address: after an address change it stops working.

type Purpose = 'confirm' | 'unsubscribe'

const TOKEN = /^(\d{1,12})\.([A-Za-z0-9_-]{32})$/

function signature(purpose: Purpose, id: number | string, extra = ''): string {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET missing')
  return createHmac('sha256', secret).update(`newsletter:${purpose}:${id}:${extra}`).digest('base64url').slice(0, 32)
}

export const confirmToken = (id: number | string, email: string) => `${id}.${signature('confirm', id, email.trim().toLowerCase())}`
export const unsubscribeToken = (id: number | string) => `${id}.${signature('unsubscribe', id)}`

/** The subscriber id of a well-formed token (not yet verified), or null. */
export function tokenId(token: unknown): number | null {
  const m = typeof token === 'string' ? TOKEN.exec(token) : null
  return m ? Number(m[1]) : null
}

export function verifyToken(token: string, purpose: Purpose, id: number | string, email = ''): boolean {
  const m = TOKEN.exec(token)
  if (!m || Number(m[1]) !== Number(id)) return false
  const expected = Buffer.from(signature(purpose, id, purpose === 'confirm' ? email.trim().toLowerCase() : ''))
  const given = Buffer.from(m[2]!)
  return given.length === expected.length && timingSafeEqual(given, expected)
}
