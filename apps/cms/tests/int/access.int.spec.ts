import { getPayload, type Payload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Proves the access rules from ARCHITECTURE.md section 4 against a local D1 database.

let payload: Payload
const run = `t${Date.now()}`
type AuthAs = Record<string, unknown> & { collection: string }
const as: Record<'editor' | 'reviewer' | 'admissions' | 'gateway', AuthAs> = {} as never
const created: { collection: 'users' | 'api-clients' | 'pages' | 'inquiries'; id: number | string }[] = []

const inquiry: RequiredDataFromCollectionSlug<'inquiries'> = {
  kind: 'pre-registration',
  locale: 'fr',
  status: 'new',
  contactName: 'Test Parent',
  phone: '+21622123456',
  grade: 'kg',
  privacyNoticeAcceptedAt: new Date().toISOString(),
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })

  for (const role of ['editor', 'reviewer', 'admissions'] as const) {
    const user = await payload.create({
      collection: 'users',
      data: { email: `${role}.${run}@example.test`, password: `Long-${run}-password`, name: role, roles: [role] },
    })
    created.push({ collection: 'users', id: user.id })
    as[role] = { ...user, collection: 'users' }
  }

  const client = await payload.create({ collection: 'api-clients', data: { name: `gateway ${run}` } })
  created.push({ collection: 'api-clients', id: client.id })
  as.gateway = { ...client, collection: 'api-clients' }
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) {
    try {
      await payload.delete({ collection, id })
    } catch {
      // already gone
    }
  }
})

describe('inquiries (personal data)', () => {
  it('lets the gateway create an entry', async () => {
    const doc = await payload.create({ collection: 'inquiries', data: inquiry, user: as.gateway, overrideAccess: false })
    created.push({ collection: 'inquiries', id: doc.id })
    expect(doc.status).toBe('new')
  })

  it('does not let the gateway or anonymous visitors read entries', async () => {
    await expect(payload.find({ collection: 'inquiries', user: as.gateway, overrideAccess: false })).rejects.toThrow()
    await expect(payload.find({ collection: 'inquiries', overrideAccess: false })).rejects.toThrow()
  })

  it('lets admissions staff read entries but not editors', async () => {
    const result = await payload.find({ collection: 'inquiries', user: as.admissions, overrideAccess: false })
    expect(result.totalDocs).toBeGreaterThan(0)
    await expect(payload.find({ collection: 'inquiries', user: as.editor, overrideAccess: false })).rejects.toThrow()
  })

  it('refuses anonymous creation', async () => {
    await expect(payload.create({ collection: 'inquiries', data: inquiry, overrideAccess: false })).rejects.toThrow()
  })
})

describe('pages (draft and publish)', () => {
  it('lets an editor save a draft but not publish', async () => {
    const draft = await payload.create({
      collection: 'pages',
      data: { title: 'Draft', slug: `draft-${run}`, translationStatus: 'draft', _status: 'draft' },
      user: as.editor,
      overrideAccess: false,
      draft: true,
    })
    created.push({ collection: 'pages', id: draft.id })

    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'Published', slug: `published-${run}`, translationStatus: 'draft', _status: 'published' },
        user: as.editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/reviewer/)
  })

  it('shows the gateway published pages only', async () => {
    const published = await payload.create({
      collection: 'pages',
      data: { title: 'Live', slug: `live-${run}`, translationStatus: 'proofread', _status: 'published' },
      user: as.reviewer,
      overrideAccess: false,
    })
    created.push({ collection: 'pages', id: published.id })

    const visible = await payload.find({ collection: 'pages', user: as.gateway, overrideAccess: false, limit: 100 })
    const slugs = visible.docs.map((doc) => doc.slug)
    expect(slugs).toContain(`live-${run}`)
    expect(slugs).not.toContain(`draft-${run}`)
  })

  it('hides everything from anonymous requests', async () => {
    await expect(payload.find({ collection: 'pages', overrideAccess: false })).rejects.toThrow()
  })
})
