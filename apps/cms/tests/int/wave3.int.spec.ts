import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Wave 3 access rules (docs/plans/2026-11-09-wave-3.md), against the local D1 database.

let payload: Payload
const run = `w3${Date.now()}`
type AuthAs = Record<string, unknown> & { collection: string }
const as: Record<'admin' | 'editor' | 'reviewer' | 'admissions' | 'gateway', AuthAs> = {} as never
const created: { collection: string; id: number | string }[] = []
const keep = (collection: string, id: number | string) => created.push({ collection, id })

// A 1×1 PNG and a tiny PDF, enough for upload collections.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==', 'base64')
const pdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF\n',
)
const file = (data: Buffer, name: string, mimetype: string) => ({ data, name, mimetype, size: data.length })

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  for (const role of ['admin', 'editor', 'reviewer', 'admissions'] as const) {
    const user = await payload.create({ collection: 'users', data: { email: `${role}.${run}@example.test`, password: `Long-${run}-password`, name: role, roles: [role] } })
    keep('users', user.id)
    as[role] = { ...user, collection: 'users' }
  }
  const client = await payload.create({ collection: 'api-clients', data: { name: `gateway ${run}` } })
  keep('api-clients', client.id)
  as.gateway = { ...client, collection: 'api-clients' }
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) {
    try {
      await payload.delete({ collection: collection as never, id, context: { skipRefresh: true } })
    } catch {
      // already gone
    }
  }
})

describe('staff accounts', () => {
  it('refuses passwords shorter than 12 characters', async () => {
    await expect(payload.create({ collection: 'users', data: { email: `short.${run}@example.test`, password: 'Short-1', name: 'x', roles: ['editor'] } })).rejects.toThrow(/12 characters/)
  })
})

describe('job applications and CVs (personal data)', () => {
  let applicationId: number | string

  it('lets the gateway store a CV and an application, and nobody but administrators read them', async () => {
    const cv = await payload.create({ collection: 'private-files', data: { label: 'CV test' }, file: file(pdf, `cv-${run}.pdf`, 'application/pdf'), user: as.gateway, overrideAccess: false })
    keep('private-files', cv.id)
    const application = await payload.create({
      collection: 'applications',
      data: { position: 'Science teacher', name: 'Test Candidate', email: 'candidate@example.test', cv: cv.id, locale: 'en', status: 'new', privacyNoticeAcceptedAt: new Date().toISOString() },
      user: as.gateway,
      overrideAccess: false,
    })
    applicationId = application.id
    keep('applications', application.id)

    for (const who of [as.gateway, as.editor, as.reviewer, as.admissions]) {
      await expect(payload.find({ collection: 'applications', user: who, overrideAccess: false })).rejects.toThrow()
      await expect(payload.find({ collection: 'private-files', user: who, overrideAccess: false })).rejects.toThrow()
    }
    const forAdmin = await payload.find({ collection: 'applications', user: as.admin, overrideAccess: false })
    expect(forAdmin.docs.some((d) => d.id === application.id)).toBe(true)
  })

  it('deletes the CV with its application', async () => {
    const app = await payload.findByID({ collection: 'applications', id: applicationId, depth: 0 })
    await payload.delete({ collection: 'applications', id: applicationId, user: as.admin, overrideAccess: false })
    await expect(payload.findByID({ collection: 'private-files', id: app.cv as number })).rejects.toThrow()
  })

  it('refuses a CV that is not a PDF', async () => {
    await expect(payload.create({ collection: 'private-files', data: {}, file: file(png, `cv-${run}.png`, 'image/png'), user: as.gateway, overrideAccess: false })).rejects.toThrow()
  })
})

describe('photo consent', () => {
  it('starts a photo as pending and lets only a reviewer clear it', async () => {
    const photo = await payload.create({ collection: 'media', data: { alt: 'A test photo', consent: 'pending' }, file: file(png, `p-${run}.png`, 'image/png'), user: as.editor, overrideAccess: false, context: { skipRefresh: true } })
    keep('media', photo.id)
    expect(photo.consent).toBe('pending')
    // An editor's attempt is dropped (the field is reviewer-only): the photo stays pending.
    const attempt = await payload.update({ collection: 'media', id: photo.id, data: { consent: 'no-identifiable-child' }, user: as.editor, overrideAccess: false, context: { skipRefresh: true } })
    expect(attempt.consent).toBe('pending')
    const cleared = await payload.update({ collection: 'media', id: photo.id, data: { consent: 'adults-only' }, user: as.reviewer, overrideAccess: false, context: { skipRefresh: true } })
    expect(cleared.consent).toBe('adults-only')
    const visible = await payload.find({ collection: 'media', where: { id: { equals: photo.id } }, user: as.gateway, overrideAccess: false })
    expect(visible.totalDocs).toBe(1)
  })

  it('never shows the gateway a pending photo', async () => {
    const photo = await payload.create({ collection: 'media', data: { alt: 'Pending photo', consent: 'pending' }, file: file(png, `q-${run}.png`, 'image/png'), user: as.editor, overrideAccess: false, context: { skipRefresh: true } })
    keep('media', photo.id)
    const visible = await payload.find({ collection: 'media', where: { id: { equals: photo.id } }, user: as.gateway, overrideAccess: false })
    expect(visible.totalDocs).toBe(0)
  })
})

describe('news (draft, publish, audit)', () => {
  it('lets an editor draft but only a reviewer publish, and logs the publication', async () => {
    const data = { kind: 'news' as const, title: `Sports day ${run}`, slug: `sports-${run}`, date: new Date().toISOString(), summary: 'A day of games.', translationStatus: 'ready' as const }
    await expect(payload.create({ collection: 'news', data: { ...data, _status: 'published' }, user: as.editor, overrideAccess: false })).rejects.toThrow(/reviewer/)
    const item = await payload.create({ collection: 'news', data: { ...data, _status: 'published' }, user: as.reviewer, overrideAccess: false })
    keep('news', item.id)

    const log = await payload.find({ collection: 'audit-log', where: { target: { equals: 'news' }, targetId: { equals: String(item.id) } }, user: as.admin, overrideAccess: false })
    expect(log.docs[0]?.action).toBe('publish')
    await expect(payload.find({ collection: 'audit-log', user: as.reviewer, overrideAccess: false })).rejects.toThrow()
  })

  it('fills a missing slug from the English title', async () => {
    const item = await payload.create({
      collection: 'news',
      data: { kind: 'event', title: `Fête de l’école ${run}`, date: new Date().toISOString(), summary: 'Summary.', translationStatus: 'draft', _status: 'draft' } as never,
      user: as.editor,
      overrideAccess: false,
      draft: true,
    })
    keep('news', item.id)
    expect(item.slug).toBe(`fete-de-l-ecole-${run}`)
  })
})

describe('redirects and settings', () => {
  it('lets reviewers manage redirects, not editors', async () => {
    await expect(payload.create({ collection: 'redirects', data: { from: `/old-${run}`, to: '/en' }, user: as.editor, overrideAccess: false })).rejects.toThrow()
    const r = await payload.create({ collection: 'redirects', data: { from: `/old-${run}`, to: '/en' }, user: as.reviewer, overrideAccess: false })
    keep('redirects', r.id)
    expect(r.permanent).toBe(true)
  })

  it('lets only administrators change site settings; the gateway may read them', async () => {
    await expect(payload.updateGlobal({ slug: 'site-settings', data: { officeHours: 'x' }, user: as.reviewer, overrideAccess: false })).rejects.toThrow()
    await expect(payload.findGlobal({ slug: 'site-settings', user: as.gateway, overrideAccess: false })).resolves.toBeTruthy()
  })
})
