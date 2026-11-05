import { APIError, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access/roles'

// Questions parents ask, for the Home page FAQ. Staff write the answers; a question shows on
// the site only once published, and only in the languages that have an answer.
// Suggested questions can be loaded as drafts with `pnpm --filter @maarif/cms seed:faqs`.
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'Question', plural: 'Questions (FAQ)' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'order', '_status'], group: 'Content' },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 10 },
  access: {
    read: publishedOrStaff,
    create: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    delete: ({ req }) => hasRole(req, 'reviewer'),
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (data?._status === 'published') {
          if (!hasRole(req, 'reviewer')) throw new APIError('Only a reviewer can publish.', 403)
          if (!data.answer || !String(data.answer).trim()) throw new APIError('Write the answer before publishing.', 400)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, maxLength: 140 },
    { name: 'answer', type: 'textarea', localized: true, maxLength: 700 },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar', description: 'Lower numbers show first.' } },
  ],
}
