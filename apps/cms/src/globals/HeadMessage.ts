import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'

// The head of school's word on the Home page: a short video that plays muted on its own
// (browsers refuse sound without a tap), captions, and the same words as text.
// Nothing shows on the site until a reviewer ticks "Show on the Home page".
export const HeadMessage: GlobalConfig = {
  slug: 'head-message',
  label: 'Head of school’s message',
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
    { name: 'name', type: 'text', required: true, maxLength: 80 },
    { name: 'role', type: 'text', required: true, localized: true, maxLength: 80 },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 600,
      admin: { description: 'The words of the video, or a short summary. Shown beside it.' },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['video/mp4', 'video/webm'] } },
      admin: { description: 'MP4 (H.264), under 10 MB, 30 to 90 seconds. Children only with written parental authorization.' },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { in: ['image/jpeg', 'image/webp', 'image/avif', 'image/png'] } },
      admin: { description: 'The still shown before the video plays (a frame of the video works best).' },
    },
    {
      name: 'captions',
      type: 'upload',
      relationTo: 'media',
      localized: true,
      filterOptions: { mimeType: { equals: 'text/vtt' } },
      admin: { description: 'Captions as a WebVTT (.vtt) file, one per language.' },
    },
  ],
}
