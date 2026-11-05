import type { CollectionConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'

// Files live in a private R2 bucket. Visitors get them only through maarif-api (/media/*),
// which can read an image only once its consent status allows publication.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: ({ req }) => {
      if (isStaff(req)) return true
      if (isGateway(req)) return { consent: { not_equals: 'pending' } }
      return false
    },
    create: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    delete: ({ req }) => hasRole(req, 'reviewer'),
  },
  fields: [
    { name: 'alt', type: 'text', required: true, localized: true, maxLength: 200 },
    {
      name: 'consent',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending: not publishable', value: 'pending' },
        { label: 'No identifiable child', value: 'no-identifiable-child' },
        { label: 'Written parental authorization on file', value: 'parental-authorization' },
      ],
      // Only a reviewer can clear a photo for publication (product.md, consent rule).
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
  ],
  upload: {
    // Video and captions for the head of school's message (globals/HeadMessage.ts).
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf', 'video/mp4', 'video/webm', 'text/vtt'],
    // Not supported on Workers (no sharp); images are resized at the edge instead.
    crop: false,
    focalPoint: false,
  },
}
