import { APIError, type CollectionConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshHooks } from '../hooks/revalidate'

// Files live in a private R2 bucket. Visitors get them only through maarif-api (/api/media/*),
// which can read a file only once its consent status allows publication. Since wave 3 every photo
// and video of the site lives here (owner decision 2026-11-09); maarif-api resizes images with
// Cloudflare Images (ADR 008), because Workers cannot run image processing inside the CMS.
export const consentValues = ['pending', 'no-identifiable-child', 'adults-only', 'parental-authorization'] as const

// Upload ceilings (wave 5): videos up to 30 MB (the Home film; payload.config.ts sets the hard
// limit), everything else 10 MB as before.
export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 30 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo or file', plural: 'Photos and files' },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'consent', 'updatedAt'],
    description: 'A photo appears on the site only after a reviewer sets its consent status.',
  },
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
  hooks: {
    beforeOperation: [
      ({ operation, req, args }) => {
        if (operation !== 'create' && operation !== 'update') return args
        const file = req.file
        if (!file) return args
        const limit = file.mimetype?.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_FILE_BYTES
        if (file.size > limit) throw new APIError(`This file is too large: at most ${limit / 1024 / 1024} MB${limit === MAX_FILE_BYTES ? ' (videos: 30 MB)' : ''}.`, 413)
        return args
      },
    ],
    beforeChange: [
      // Belt and braces with the field access below: only a reviewer can set or change consent,
      // whatever path the change comes from (REST, admin, upload script).
      ({ data, originalDoc, req, operation }) => {
        const before = operation === 'create' ? 'pending' : originalDoc?.consent
        const after = data?.consent ?? before
        if (after !== before && !hasRole(req, 'reviewer')) throw new APIError('Only a reviewer can change the consent status.', 403)
        return data
      },
    ],
    // A photo can appear on many pages (alt text, consent, replacement): refresh all of them.
    ...refreshHooks(() => ['cms']),
  },
  fields: [
    { name: 'alt', label: 'Description (for people who cannot see the image)', type: 'text', required: true, localized: true, maxLength: 200 },
    {
      name: 'consent',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending: not publishable', value: 'pending' },
        { label: 'No identifiable child (hands, backs, distant, objects)', value: 'no-identifiable-child' },
        { label: 'Only adults can be recognised', value: 'adults-only' },
        { label: 'Written parental authorization on file', value: 'parental-authorization' },
      ],
      // Only a reviewer can clear a photo for publication (product.md, consent rule).
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    {
      name: 'focus',
      label: 'Keep in view when cropped',
      type: 'group',
      admin: { position: 'sidebar', description: 'Where the subject is, in % from the left and from the top (50/50 = centre).' },
      fields: [
        { name: 'x', type: 'number', min: 0, max: 100, defaultValue: 50 },
        { name: 'y', type: 'number', min: 0, max: 100, defaultValue: 50 },
      ],
    },
    { name: 'source', type: 'text', maxLength: 200, admin: { position: 'sidebar', description: 'Where the original is (IMSTMEDIA folder or event), for the record.' } },
  ],
  upload: {
    // Images, PDFs (documents), video and captions (head's message, Home film, albums).
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf', 'video/mp4', 'video/webm', 'text/vtt'],
    // Not supported on Workers (no sharp); images are resized by maarif-api instead.
    crop: false,
    focalPoint: false,
  },
}
