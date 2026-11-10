import type { Endpoint, PayloadRequest } from 'payload'

// Nightly maintenance (wave 3, B7), called by maarif-api's cron over the service binding with the
// shared MAINTENANCE_SECRET. Never reachable from the admin or by visitors without the secret.
//  1. Retention: deletes inquiries, job applications (their CVs go with them) and audit entries
//     older than the months set in Site settings, plus CVs left without an application.
//  2. Backup: writes every collection and global as JSON to the private R2 bucket under
//     backups/YYYY-MM-DD.json and keeps the last 30 days. Media files are already in R2; D1
//     Time Travel (30 days) is the second safety net.

const BACKUP_DAYS = 30
const monthsAgo = (months: number) => {
  const d = new Date()
  d.setUTCMonth(d.getUTCMonth() - months)
  return d.toISOString()
}

type R2 = { put: (key: string, body: string, opts?: unknown) => Promise<unknown>; list: (opts: { prefix: string }) => Promise<{ objects: { key: string }[] }>; delete: (key: string) => Promise<void> }

async function bucket(): Promise<R2 | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = await getCloudflareContext({ async: true })
    return ((env as { R2?: R2 }).R2 as R2) ?? null
  } catch {
    return null
  }
}

async function purge(req: PayloadRequest, collection: string, before: string) {
  const { docs } = await req.payload.find({ collection: collection as never, where: { createdAt: { less_than: before } }, limit: 500, depth: 0, overrideAccess: true, req })
  for (const doc of docs) await req.payload.delete({ collection: collection as never, id: (doc as { id: string | number }).id, overrideAccess: true, req, context: { skipRefresh: true, skipAudit: true } })
  return docs.length
}

export const maintenance: Endpoint = {
  path: '/maintenance/nightly',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const secret = process.env.MAINTENANCE_SECRET
    if (!secret || req.headers.get('x-maintenance-secret') !== secret) return Response.json({ ok: false }, { status: 403 })

    const settings = (await req.payload.findGlobal({ slug: 'site-settings', overrideAccess: true, req })) as { retention?: { inquiriesMonths?: number; applicationsMonths?: number; auditLogMonths?: number } }
    const r = settings.retention ?? {}
    const deleted = {
      inquiries: await purge(req, 'inquiries', monthsAgo(r.inquiriesMonths ?? 24)),
      applications: await purge(req, 'applications', monthsAgo(r.applicationsMonths ?? 6)),
      auditLog: await purge(req, 'audit-log', monthsAgo(r.auditLogMonths ?? 12)),
      orphanCvs: 0,
      // Wave 4: newsletter sign-ups never confirmed within 30 days (the address stays unused).
      pendingSubscribers: 0,
    }
    {
      const before = new Date(Date.now() - 30 * 86_400_000).toISOString()
      const { docs } = await req.payload.find({ collection: 'subscribers', where: { and: [{ status: { equals: 'pending' } }, { updatedAt: { less_than: before } }] }, limit: 500, depth: 0, overrideAccess: true, req })
      for (const doc of docs) await req.payload.delete({ collection: 'subscribers', id: doc.id, overrideAccess: true, req, context: { skipAudit: true } })
      deleted.pendingSubscribers = docs.length
    }
    // CVs stored but never attached (an application that failed after the upload), after a day.
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()
    const { docs: cvs } = await req.payload.find({ collection: 'private-files', where: { createdAt: { less_than: yesterday } }, limit: 500, depth: 0, overrideAccess: true, req })
    for (const cv of cvs) {
      const used = await req.payload.count({ collection: 'applications', where: { cv: { equals: cv.id } }, overrideAccess: true, req })
      if (!used.totalDocs) {
        await req.payload.delete({ collection: 'private-files', id: cv.id, overrideAccess: true, req, context: { skipAudit: true } })
        deleted.orphanCvs++
      }
    }

    // Backup.
    const r2 = await bucket()
    let backup: string | null = null
    if (r2) {
      const data: Record<string, unknown> = { createdAt: new Date().toISOString() }
      for (const c of req.payload.config.collections) {
        if (c.slug.startsWith('payload-')) continue
        const all = await req.payload.find({ collection: c.slug as never, limit: 0, pagination: false, depth: 0, locale: 'all', overrideAccess: true, req })
        data[c.slug] = all.docs
      }
      for (const g of req.payload.config.globals) data[`global:${g.slug}`] = await req.payload.findGlobal({ slug: g.slug as never, depth: 0, locale: 'all', overrideAccess: true, req })
      backup = `backups/${new Date().toISOString().slice(0, 10)}.json`
      await r2.put(backup, JSON.stringify(data), { httpMetadata: { contentType: 'application/json' } })
      const { objects } = await r2.list({ prefix: 'backups/' })
      const keepFrom = new Date(Date.now() - BACKUP_DAYS * 86_400_000).toISOString().slice(0, 10)
      for (const o of objects) if (o.key.slice('backups/'.length, 'backups/'.length + 10) < keepFrom) await r2.delete(o.key)
    }
    return Response.json({ ok: true, deleted, backup })
  },
}
