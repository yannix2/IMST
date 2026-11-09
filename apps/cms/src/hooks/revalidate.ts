import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'

// Refresh on publish (wave 3, ADR 007): after staff change public content, maarifcms tells
// maarif-api which cache tags changed; maarif-api passes them to maarif-web, which refreshes the
// pages that used them. Never blocks or fails a save: at most a 3-second wait, errors ignored
// (pages refresh on their own within five minutes anyway).
//
// How the API is reached: the API service binding in Cloudflare; API_URL in local development.

type Tagger = (doc: Record<string, unknown>) => string[]

async function send(tags: string[]): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !tags.length) return
  const init: RequestInit = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-revalidate-secret': secret },
    body: JSON.stringify({ tags: [...new Set(tags)] }),
    signal: AbortSignal.timeout(3000),
  }
  try {
    if (process.env.API_URL) {
      await fetch(new URL('/internal/revalidate', process.env.API_URL), init)
      return
    }
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    const api = (env as { API?: Fetcher }).API
    if (api) await api.fetch('https://maarif-api.internal/internal/revalidate', init)
  } catch {
    // Missed refresh: the five-minute refresh catches up.
  }
}

// Drafts do not change the public site, so only published versions (or deletions) refresh it.
const isPublicChange = (doc: Record<string, unknown>, previous?: Record<string, unknown>) =>
  doc._status === undefined || doc._status === 'published' || previous?._status === 'published'

export const refreshOnChange =
  (tagger: Tagger): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req }) => {
    if (!skip(req) && isPublicChange(doc, previousDoc)) await send([...tagger(doc), ...(previousDoc ? tagger(previousDoc) : [])])
    return doc
  }

export const refreshOnDelete =
  (tagger: Tagger): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    if (!skip(req)) await send(tagger(doc))
    return doc
  }

export const refreshGlobal =
  (...tags: string[]): GlobalAfterChangeHook =>
  async ({ doc, req }) => {
    if (!skip(req)) await send(tags)
    return doc
  }

// Bulk scripts (seeding) can turn refreshes off with context { skipRefresh: true }.
const skip = (req: PayloadRequest) => Boolean((req.context as { skipRefresh?: boolean } | undefined)?.skipRefresh)

const slug = (doc: Record<string, unknown>) => (typeof doc.slug === 'string' && doc.slug ? doc.slug : null)

/** Tags for a collection: its list tag, plus one per document when it has its own page. */
export const tagsFor =
  (list: string, withSlug = false): Tagger =>
  (doc) => {
    const s = withSlug ? slug(doc) : null
    return s ? [list, `${list}:${s}`] : [list]
  }

/** afterChange + afterDelete hooks for a collection. */
export const refreshHooks = (tagger: Tagger) => ({ afterChange: [refreshOnChange(tagger)], afterDelete: [refreshOnDelete(tagger)] })
