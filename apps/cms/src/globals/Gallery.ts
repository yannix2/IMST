import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'

// "Life at Maarif": the Home page photo carousel. Photos come from Media, so the consent rule
// applies: a photo still marked "pending" is never served to the site.
export const Gallery: GlobalConfig = {
  slug: 'gallery',
  label: 'Home page gallery',
  admin: { group: 'Content' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  },
  fields: [
    {
      name: 'published',
      label: 'Show on the Home page',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    {
      name: 'photos',
      type: 'array',
      maxRows: 16,
      labels: { singular: 'Photo', plural: 'Photos' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: { mimeType: { in: ['image/jpeg', 'image/webp', 'image/avif', 'image/png'] } },
        },
        { name: 'caption', type: 'text', localized: true, maxLength: 80 },
      ],
    },
  ],
}
