import { APIError, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access/roles'

// The leadership team for the About > Leadership page (owner decision 2026-11-05). The page
// and its menu link stay hidden until one person is published. A photo shows only when the
// person has agreed to it in writing (the box below); without it the site shows no photo.
export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Person', plural: 'Leadership and staff' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role', 'order', '_status'], group: 'Content' },
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
        if (data?._status === 'published' && !hasRole(req, 'reviewer')) throw new APIError('Only a reviewer can publish.', 403)
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    { name: 'role', type: 'text', required: true, localized: true, maxLength: 80 },
    { name: 'bio', type: 'textarea', localized: true, maxLength: 400, admin: { description: 'Two or three sentences, optional.' } },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['image/jpeg', 'image/webp', 'image/avif', 'image/png'] } },
    },
    {
      name: 'photoConsent',
      label: 'This person agreed in writing to show their photo on the website',
      type: 'checkbox',
      defaultValue: false,
    },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar', description: 'Lower numbers show first.' } },
  ],
}
