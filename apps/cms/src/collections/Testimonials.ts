import { APIError, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from '../access/roles'

// What parents and students say, in their own words. Only real quotes with written permission
// to publish: a reviewer can publish one only when the permission box is ticked.
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'kind', '_status'], group: 'Content' },
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
          if (!data.permission) throw new APIError('Tick the written-permission box before publishing.', 400)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'parent',
      options: [
        { label: 'Parent', value: 'parent' },
        { label: 'Student', value: 'student' },
        { label: 'Former student', value: 'alumni' },
      ],
    },
    { name: 'name', type: 'text', required: true, maxLength: 60, admin: { description: 'As the person agreed to be named, e.g. "Amira B."' } },
    { name: 'role', type: 'text', localized: true, maxLength: 60, admin: { description: 'e.g. "Mother of a Year 3 pupil"' } },
    { name: 'quote', type: 'textarea', required: true, localized: true, maxLength: 360 },
    {
      name: 'permission',
      label: 'Written permission to publish is on file',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
