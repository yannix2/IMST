import { APIError, type CollectionBeforeChangeHook, type CollectionConfig, type Endpoint, type PayloadRequest } from 'payload'
import { locales, type Locale } from '@maarif/contracts'
import { hasRole } from '../access/roles'
import { issueFor, runNewsletter, sendIssue, versionFor, type NewsletterDoc } from '../newsletter/run'

// The newsletter (wave 4, B4). Editors and reviewers write it in up to four languages (English is
// required: it is what subscribers get when their language is missing), send a test to themselves,
// then a reviewer sends it. Sending happens in batches, every five minutes, through maarif-api's
// cron (newsletter/run.ts); the counts fill in as it goes. A newsletter being sent or already sent
// is locked.
//   POST /cms-api/newsletters/:id/test   the logged-in staff member gets each language version
//   POST /cms-api/newsletters/:id/send   reviewer: status ready -> sending
//   POST /cms-api/newsletters/run        cron only (x-maintenance-secret)

const writers = (req: PayloadRequest) => hasRole(req, 'editor', 'reviewer')

async function load(req: PayloadRequest): Promise<NewsletterDoc | null> {
  const id = Number(req.routeParams?.id)
  if (!Number.isInteger(id)) return null
  return (await req.payload.findByID({ collection: 'newsletters', id, depth: 0, locale: 'all', overrideAccess: true, req, disableErrors: true })) as unknown as NewsletterDoc | null
}

const test: Endpoint = {
  path: '/:id/test',
  method: 'post',
  handler: async (req) => {
    if (!writers(req)) return Response.json({ ok: false, error: 'forbidden' }, { status: 403 })
    const doc = await load(req)
    const me = (req.user as { email?: string; id?: number } | null)?.email
    if (!doc || !me) return Response.json({ ok: false, error: 'not_found' }, { status: 404 })
    const ready = locales.filter((l) => versionFor(doc, l) === l)
    if (!ready.length) return Response.json({ ok: false, error: 'Write at least the English subject and text first.' }, { status: 400 })
    const results: Partial<Record<Locale, string>> = {}
    for (const l of ready) {
      // A fake subscriber id: the test's unsubscribe link leads to the page but matches nobody.
      const r = await sendIssue(req, doc, { id: 0, email: me, locale: l })
      results[l] = r.ok ? 'sent' : r.error
    }
    return Response.json({ ok: Object.values(results).every((r) => r === 'sent'), to: me, results })
  },
}

const send: Endpoint = {
  path: '/:id/send',
  method: 'post',
  handler: async (req) => {
    if (!hasRole(req, 'reviewer')) return Response.json({ ok: false, error: 'Only a reviewer can send the newsletter.' }, { status: 403 })
    const doc = await load(req)
    if (!doc) return Response.json({ ok: false, error: 'not_found' }, { status: 404 })
    if (doc.status !== 'ready') return Response.json({ ok: false, error: 'Set the status to "Ready to send" and save first.' }, { status: 400 })
    if (!issueFor(doc, { id: 0, locale: 'en' })) return Response.json({ ok: false, error: 'The English subject and text are required.' }, { status: 400 })
    const { totalDocs } = await req.payload.count({ collection: 'subscribers', where: { status: { equals: 'confirmed' } }, overrideAccess: true, req })
    if (!totalDocs) return Response.json({ ok: false, error: 'Nobody has confirmed a subscription yet.' }, { status: 400 })
    await req.payload.update({
      collection: 'newsletters',
      id: doc.id,
      data: { status: 'sending', stats: { total: totalDocs, sent: 0, failed: 0, cursor: 0, sendRequestedAt: new Date().toISOString() } },
      overrideAccess: true,
      req,
      context: { newsletterSystem: true },
    })
    return Response.json({ ok: true, total: totalDocs })
  },
}

const run: Endpoint = {
  path: '/run',
  method: 'post',
  handler: async (req) => {
    const secret = process.env.MAINTENANCE_SECRET
    if (!secret || req.headers.get('x-maintenance-secret') !== secret) return Response.json({ ok: false }, { status: 403 })
    return Response.json({ ok: true, ...(await runNewsletter(req)) })
  },
}

// Staff move a newsletter between Draft and Ready only; "sending" and "sent" belong to the sender,
// and their content is locked.
const guardStatus: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if ((req.context as { newsletterSystem?: boolean } | undefined)?.newsletterSystem) return data
  const before = (originalDoc as { status?: string } | undefined)?.status
  if (before === 'sending' || before === 'sent') throw new APIError('This newsletter is being sent or has been sent: it can no longer change. Duplicate it to write a new one.', 400)
  if (data?.status === 'sending' || data?.status === 'sent') throw new APIError('Use the "Send" button to send the newsletter.', 400)
  return data
}

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: { singular: 'Newsletter', plural: 'Newsletters' },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'status', 'stats.sent', 'stats.sentAt'],
    group: 'Newsletter',
    description: 'Write in English first (required), then the other languages. Send yourself a test, set "Ready to send", save, and a reviewer sends it.',
  },
  endpoints: [run, test, send],
  access: {
    read: ({ req }) => writers(req),
    create: ({ req }) => writers(req),
    update: ({ req }) => writers(req),
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  hooks: { beforeChange: [guardStatus] },
  fields: [
    { name: 'subject', type: 'text', localized: true, maxLength: 140, admin: { description: 'The email subject, also the title inside the email.' } },
    { name: 'preheader', label: 'Preview line', type: 'text', localized: true, maxLength: 160, admin: { description: 'Optional: the grey line inboxes show after the subject.' } },
    { name: 'body', label: 'Text', type: 'richText', localized: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Ready to send', value: 'ready' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'actions',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '/components/admin/NewsletterActions#NewsletterActions' } },
    },
    {
      name: 'stats',
      label: 'Sending',
      type: 'group',
      admin: { position: 'sidebar', readOnly: true },
      fields: [
        { name: 'total', label: 'Subscribers when sent', type: 'number' },
        { name: 'sent', label: 'Emails sent', type: 'number' },
        { name: 'failed', label: 'Not delivered', type: 'number' },
        { name: 'cursor', type: 'number', admin: { hidden: true } },
        { name: 'sendRequestedAt', label: 'Send started', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'sentAt', label: 'Finished', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
  ],
  timestamps: true,
}
