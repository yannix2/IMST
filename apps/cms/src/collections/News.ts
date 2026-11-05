import { APIError, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access/roles'

// News and events for the Home page ("News and events": the three latest published items).
// Editors draft, reviewers publish, like pages.
export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News item', plural: 'News and events' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'date', '_status'], group: 'School life' },
  defaultSort: '-date',
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
        if (data?._status === 'published' && !hasRole(req, 'reviewer')) throw new APIError('Only a reviewer can publish.', 403)
        return data
      },
    ],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'news',
      options: [
        { label: 'News', value: 'news' },
        { label: 'Event', value: 'event' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 100 },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' }, description: 'For an event: the day it happens. For news: the day it happened.' },
    },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 280 },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Children only with written parental authorization (consent status cleared).' } },
  ],
}
