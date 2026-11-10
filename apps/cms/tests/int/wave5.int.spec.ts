import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { Media, MAX_FILE_BYTES, MAX_VIDEO_BYTES } from '@/collections/Media'

// Wave 5 (docs/plans/2026-11-11-wave-5.md, B2): the Home film global's new fields and access, and
// the upload ceilings (videos 30 MB, everything else 10 MB). Against the local D1 database.

let payload: Payload
const run = `w5${Date.now()}`
type AuthAs = Record<string, unknown> & { collection: string }
const as: Record<'editor' | 'admissions' | 'gateway', AuthAs> = {} as never
const created: { collection: string; id: number | string }[] = []
let before: { transcript?: string | null; published?: boolean | null } = {}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  for (const role of ['editor', 'admissions'] as const) {
    const user = await payload.create({ collection: 'users', data: { email: `${role}.${run}@example.test`, password: `Long-${run}-password`, name: role, roles: [role] }, context: { skipInvite: true } })
    created.push({ collection: 'users', id: user.id })
    as[role] = { ...user, collection: 'users' }
  }
  const client = await payload.create({ collection: 'api-clients', data: { name: `gateway ${run}` } })
  created.push({ collection: 'api-clients', id: client.id })
  as.gateway = { ...client, collection: 'api-clients' }
  const hero = await payload.findGlobal({ slug: 'home-hero', locale: 'fr', overrideAccess: true })
  before = { transcript: hero.transcript, published: hero.published }
})

afterAll(async () => {
  // Only the transcript changed (the editor cannot publish); put it back as the editor did.
  await payload.updateGlobal({ slug: 'home-hero', locale: 'fr', data: { transcript: before.transcript ?? null }, user: as.editor, overrideAccess: false, context: { skipRefresh: true } })
  for (const { collection, id } of created.reverse()) {
    try {
      await payload.delete({ collection: collection as never, id, overrideAccess: true, context: { skipRefresh: true } })
    } catch {
      // already gone
    }
  }
})

describe('Home film global (wave 5)', () => {
  it('has the full film fields and a transcript per language', async () => {
    const saved = await payload.updateGlobal({
      slug: 'home-hero',
      locale: 'fr',
      data: { transcript: `Bienvenue ${run}.` },
      user: as.editor,
      overrideAccess: false,
      context: { skipRefresh: true },
    })
    expect(saved.transcript).toBe(`Bienvenue ${run}.`)
    expect('fullFilm' in saved && 'fullFilmSmall' in saved && 'fullFilmPoster' in saved).toBe(true)
    const en = await payload.findGlobal({ slug: 'home-hero', locale: 'en', fallbackLocale: false, overrideAccess: true })
    expect(en.transcript ?? '').not.toBe(`Bienvenue ${run}.`)
  })

  it('keeps publishing for reviewers, editing for editors, reading for staff and the gateway', async () => {
    const saved = await payload.updateGlobal({ slug: 'home-hero', data: { published: !before.published }, user: as.editor, overrideAccess: false, context: { skipRefresh: true } })
    expect(Boolean(saved.published)).toBe(Boolean(before.published)) // field reserved to reviewers
    await expect(payload.updateGlobal({ slug: 'home-hero', data: { transcript: 'x' }, user: as.admissions, overrideAccess: false })).rejects.toThrow()
    await expect(payload.findGlobal({ slug: 'home-hero', user: as.gateway, overrideAccess: false })).resolves.toBeTruthy()
  })
})

describe('upload ceilings (wave 5)', () => {
  const check = Media.hooks!.beforeOperation![0]!
  const call = (file: { mimetype: string; size: number } | undefined, operation: 'create' | 'update' | 'read' = 'create') =>
    check({ operation, args: {}, req: { file } } as never)

  it('lets videos reach 30 MB and keeps every other file at 10 MB', async () => {
    expect(() => call({ mimetype: 'video/mp4', size: MAX_VIDEO_BYTES })).not.toThrow()
    expect(() => call({ mimetype: 'video/mp4', size: MAX_VIDEO_BYTES + 1 })).toThrow(/30 MB/)
    expect(() => call({ mimetype: 'image/jpeg', size: MAX_FILE_BYTES })).not.toThrow()
    expect(() => call({ mimetype: 'image/jpeg', size: MAX_FILE_BYTES + 1 })).toThrow(/10 MB/)
    expect(() => call({ mimetype: 'application/pdf', size: 12 * 1024 * 1024 }, 'update')).toThrow()
    expect(() => call(undefined)).not.toThrow()
    expect(() => call({ mimetype: 'image/jpeg', size: MAX_FILE_BYTES * 5 }, 'read')).not.toThrow()
  })
})
