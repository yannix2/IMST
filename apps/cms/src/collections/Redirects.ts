import type { CollectionConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshHooks, tagsFor } from '../hooks/revalidate'

// Redirects staff manage without code (wave 3), for example an old tn.maarifschool.org address
// or a renamed news item. The site reads them at build time and when they change.
const PATH = /^\/[^\s?#]*$/

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'permanent', 'updatedAt'], group: 'System' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    create: ({ req }) => hasRole(req, 'reviewer'),
    update: ({ req }) => hasRole(req, 'reviewer'),
    delete: ({ req }) => hasRole(req, 'reviewer'),
  },
  hooks: refreshHooks(tagsFor('redirects')),
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 300,
      validate: (v: unknown) => (typeof v === 'string' && PATH.test(v) ? true : 'A path starting with /, for example /en/old-page.'),
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      maxLength: 300,
      validate: (v: unknown) => (typeof v === 'string' && (PATH.test(v) || /^https:\/\//.test(v)) ? true : 'A path starting with / or a full https:// address.'),
    },
    { name: 'permanent', type: 'checkbox', defaultValue: true, admin: { description: 'Permanent (301) tells search engines the page moved for good.' } },
  ],
}
