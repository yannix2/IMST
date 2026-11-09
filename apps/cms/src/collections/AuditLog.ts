import type { CollectionConfig, Config, Plugin } from 'payload'
import { hasRole } from '../access/roles'

// Audit log (wave 3): who created, changed, published or deleted what, and when. Written only by
// the hooks below (never by hand), read only by administrators, deleted after the retention
// period (jobs/retention). Personal data stays out: the entry names the document, not its content.
export const AuditLog: CollectionConfig = {
  slug: 'audit-log',
  labels: { singular: 'Audit entry', plural: 'Audit log' },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'user', 'action', 'target', 'summary'],
    group: 'System',
    hidden: ({ user }) => !(user as { roles?: string[] } | null)?.roles?.includes('admin'),
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req }) => hasRole(req, 'admin'),
    create: () => false,
    update: () => false,
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users' },
    { name: 'actor', type: 'text', maxLength: 120, admin: { description: 'Who did it when it was not a staff account (for example the website gateway).' } },
    { name: 'action', type: 'select', required: true, index: true, options: ['create', 'update', 'publish', 'unpublish', 'delete'] },
    { name: 'target', type: 'text', required: true, index: true, maxLength: 60, admin: { description: 'Collection or global.' } },
    { name: 'targetId', type: 'text', maxLength: 60 },
    { name: 'summary', type: 'text', maxLength: 200 },
  ],
  timestamps: true,
}

// Collections whose changes are not worth logging (the log itself, system bookkeeping), and the
// ones holding personal data where only the fact of a change is logged (never a title).
const skip = new Set(['audit-log', 'payload-locked-documents', 'payload-preferences', 'payload-migrations', 'payload-kv', 'payload-jobs'])
const personal = new Set(['inquiries', 'applications', 'private-files', 'users'])

type Doc = Record<string, unknown>
const titleOf = (target: string, doc: Doc) => {
  if (personal.has(target)) return `${target} #${String(doc.id ?? '')}`
  const t = doc.title ?? doc.name ?? doc.destination ?? doc.page ?? doc.filename ?? doc.from ?? doc.question ?? doc.id
  return String(typeof t === 'object' && t ? Object.values(t)[0] : t ?? '').slice(0, 200)
}

async function record(
  req: Parameters<NonNullable<NonNullable<CollectionConfig['hooks']>['afterChange']>[number]>[0]['req'],
  action: string,
  target: string,
  doc: Doc,
) {
  if ((req.context as { skipAudit?: boolean } | undefined)?.skipAudit) return
  const user = req.user as { id?: string | number; collection?: string; name?: string } | null
  try {
    await req.payload.create({
      collection: 'audit-log',
      data: {
        user: user?.collection === 'users' ? user.id : undefined,
        actor: user?.collection === 'users' ? undefined : user?.collection ?? 'system',
        action,
        target,
        targetId: doc.id != null ? String(doc.id) : undefined,
        summary: titleOf(target, doc),
      } as never,
      overrideAccess: true,
      req,
      context: { skipAudit: true, skipRefresh: true },
    })
  } catch {
    // Never let the log block a save.
  }
}

/** Adds audit hooks to every collection and global (payload.config.ts plugins). */
export const auditLogPlugin: Plugin = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((c) =>
    skip.has(c.slug)
      ? c
      : {
          ...c,
          hooks: {
            ...c.hooks,
            afterChange: [
              ...(c.hooks?.afterChange ?? []),
              async ({ doc, previousDoc, operation, req }) => {
                const status = (doc as Doc)._status
                const before = (previousDoc as Doc | undefined)?._status
                const action =
                  operation === 'create' ? (status === 'published' ? 'publish' : 'create') : status === 'published' && before !== 'published' ? 'publish' : before === 'published' && status === 'draft' ? 'unpublish' : 'update'
                await record(req, action, c.slug, doc as Doc)
                return doc
              },
            ],
            afterDelete: [
              ...(c.hooks?.afterDelete ?? []),
              async ({ doc, req }) => {
                await record(req, 'delete', c.slug, doc as Doc)
                return doc
              },
            ],
          },
        },
  ),
  globals: (config.globals ?? []).map((g) => ({
    ...g,
    hooks: {
      ...g.hooks,
      afterChange: [
        ...(g.hooks?.afterChange ?? []),
        async ({ doc, req }) => {
          await record(req, 'update', g.slug, { id: g.slug, title: g.slug } as Doc)
          return doc
        },
      ],
    },
  })),
})
