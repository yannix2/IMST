import type { CollectionConfig } from 'payload'
import { locales } from '@maarif/contracts'
import { hasRole, isGateway } from '../access/roles'
import { applicationsCsv } from '../endpoints/exportCsv'

// Job applications from /careers (wave 3). Personal data: created only by the maarif-api gateway,
// read and handled only by administrators, deleted automatically after the retention period
// (6 months, jobs/retention). Deleting an application also deletes its CV.
export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: { singular: 'Job application', plural: 'Job applications' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'job', 'status', 'createdAt'],
    group: 'Careers',
    hidden: ({ user }) => !(user as { roles?: string[] } | null)?.roles?.includes('admin'),
    components: { beforeListTable: [{ path: '/components/admin/ExportButton#ExportButton', clientProps: { collection: 'applications' } }] },
  },
  endpoints: [applicationsCsv],
  access: {
    create: ({ req }) => isGateway(req),
    read: ({ req }) => hasRole(req, 'admin'),
    update: ({ req }) => hasRole(req, 'admin'),
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  hooks: {
    afterDelete: [
      async ({ doc, req }) => {
        const cv = typeof doc.cv === 'object' ? doc.cv?.id : doc.cv
        if (cv) await req.payload.delete({ collection: 'private-files', id: cv, req, overrideAccess: true })
      },
    ],
  },
  fields: [
    { name: 'job', type: 'relationship', relationTo: 'jobs', admin: { description: 'Empty for a spontaneous application.' } },
    { name: 'position', type: 'text', required: true, maxLength: 120 },
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', maxLength: 20 },
    { name: 'message', type: 'textarea', maxLength: 2000 },
    { name: 'cv', label: 'CV (PDF)', type: 'upload', relationTo: 'private-files', required: true },
    { name: 'locale', type: 'select', required: true, options: [...locales] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Interview', value: 'interview' },
        { label: 'Not retained', value: 'declined' },
        { label: 'Hired', value: 'hired' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'privacyNoticeAcceptedAt', type: 'date', required: true },
    { name: 'staffNotes', type: 'textarea', access: { create: () => false }, admin: { description: 'Internal notes. Never shared with the candidate.' } },
  ],
  timestamps: true,
}
