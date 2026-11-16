import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Wave 6 (docs/plans/2026-11-16-wave-6.md): key dates and the notice bar, against the local D1.

let payload: Payload
const run = `w6${Date.now()}`
type AuthAs = Record<string, unknown> & { collection: string }
const as: Record<'editor' | 'reviewer' | 'admissions' | 'gateway', AuthAs> = {} as never
const created: { collection: string; id: number | string }[] = []
const keep = (collection: string, id: number | string) => created.push({ collection, id })
const skip = { skipRefresh: true }

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  for (const role of ['editor', 'reviewer', 'admissions'] as const) {
    const user = await payload.create({ collection: 'users', data: { email: `${role}.${run}@example.test`, password: `Long-${run}-password`, name: role, roles: [role] }, context: { skipInvite: true } })
    keep('users', user.id)
    as[role] = { ...user, collection: 'users' }
  }
  const client = await payload.create({ collection: 'api-clients', data: { name: `gateway ${run}` } })
  keep('api-clients', client.id)
  as.gateway = { ...client, collection: 'api-clients' }
})

afterAll(async () => {
  await payload.updateGlobal({ slug: 'notice', data: { active: false, text: null, link: null, until: null }, context: skip })
  for (const { collection, id } of created.reverse()) {
    try {
      await payload.delete({ collection: collection as never, id, context: skip })
    } catch {
      // already gone
    }
  }
})

describe('key dates', () => {
  const data = { title: `Winter holiday ${run}`, kind: 'holiday' as const, startsOn: '2026-12-21T12:00:00.000Z', endsOn: '2027-01-02T12:00:00.000Z', translationStatus: 'ready' as const }

  it('lets editors draft and only reviewers publish; the gateway reads published dates only', async () => {
    const draft = await payload.create({ collection: 'key-dates', data: { ...data, _status: 'draft' }, user: as.editor, overrideAccess: false, context: skip })
    keep('key-dates', draft.id)
    await expect(payload.create({ collection: 'key-dates', data: { ...data, _status: 'published' }, user: as.editor, overrideAccess: false, context: skip })).rejects.toThrow(/reviewer/)
    await expect(payload.create({ collection: 'key-dates', data, user: as.admissions, overrideAccess: false, context: skip })).rejects.toThrow()
    const published = await payload.create({ collection: 'key-dates', data: { ...data, title: `Published ${run}`, _status: 'published' }, user: as.reviewer, overrideAccess: false, context: skip })
    keep('key-dates', published.id)

    const seen = await payload.find({ collection: 'key-dates', user: as.gateway, overrideAccess: false, limit: 200 })
    const ids = seen.docs.map((d) => d.id)
    expect(ids).toContain(published.id)
    expect(ids).not.toContain(draft.id)
    await expect(payload.delete({ collection: 'key-dates', id: draft.id, user: as.editor, overrideAccess: false, context: skip })).rejects.toThrow()
  })

  it('refuses a last day before the first day', async () => {
    await expect(
      payload.create({ collection: 'key-dates', data: { ...data, endsOn: '2026-12-01T12:00:00.000Z', _status: 'draft' }, user: as.editor, overrideAccess: false, context: skip }),
    ).rejects.toThrow()
  })
})

describe('notice bar', () => {
  it('lets editors write it, only reviewers show it, and the gateway read it', async () => {
    await payload.updateGlobal({ slug: 'notice', data: { text: `School closed ${run}`, link: '/parents/calendar', active: true }, user: as.editor, overrideAccess: false, context: skip })
    const afterEditor = await payload.findGlobal({ slug: 'notice', user: as.gateway, overrideAccess: false })
    expect(afterEditor.text).toBe(`School closed ${run}`)
    expect(afterEditor.active).toBeFalsy() // an editor's tick is dropped

    await payload.updateGlobal({ slug: 'notice', data: { active: true }, user: as.reviewer, overrideAccess: false, context: skip })
    expect((await payload.findGlobal({ slug: 'notice', user: as.gateway, overrideAccess: false })).active).toBe(true)
    await expect(payload.updateGlobal({ slug: 'notice', data: { text: 'x' }, user: as.admissions, overrideAccess: false, context: skip })).rejects.toThrow()
  })

  it('refuses a link that is neither a site page nor https', async () => {
    await expect(payload.updateGlobal({ slug: 'notice', data: { link: 'javascript:alert(1)' }, user: as.reviewer, overrideAccess: false, context: skip })).rejects.toThrow()
  })
})
