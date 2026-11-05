import { APIError, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access/roles'

// Lowercase words joined by hyphens, in any script (Arabic slugs allowed).
const SLUG = /^[\p{Ll}\p{Lo}\p{N}]+(?:-[\p{Ll}\p{Lo}\p{N}]+)*$/u

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
    delete: ({ req }) => hasRole(req, 'reviewer'),
  },
  hooks: {
    beforeChange: [
      // Editors draft; only reviewers (and administrators) publish.
      ({ data, req }) => {
        if (data?._status === 'published' && !hasRole(req, 'reviewer')) {
          throw new APIError('Only a reviewer can publish.', 403)
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 120 },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      index: true,
      validate: (value: unknown) =>
        typeof value === 'string' && SLUG.test(value) ? true : 'Use lowercase words joined by hyphens.',
    },
    { name: 'body', type: 'richText', localized: true },
    {
      // Launch rule: a language version is listed publicly only once proofread.
      name: 'translationStatus',
      type: 'select',
      localized: true,
      required: true,
      defaultValue: 'draft',
      options: ['draft', 'ready', 'proofread'],
      admin: { position: 'sidebar' },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true, maxLength: 60 },
        { name: 'description', type: 'textarea', localized: true, maxLength: 155 },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
