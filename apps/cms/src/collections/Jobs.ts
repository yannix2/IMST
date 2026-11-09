import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { campusField, seoField, slugField, translationStatusField, viewOnSite } from '../fields/common'

// Job openings for /careers/openings (wave 3). A published opening shows until its closing date.
export const Jobs: CollectionConfig = {
  slug: 'jobs',
  labels: { singular: 'Job opening', plural: 'Job openings' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'campus', 'closesOn', '_status'], group: 'Careers', preview: viewOnSite('careers/openings') },
  defaultSort: '-createdAt',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('jobs', true)) },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 100 },
    slugField(),
    campusField,
    {
      name: 'contract',
      type: 'select',
      options: [
        { label: 'Full time', value: 'full-time' },
        { label: 'Part time', value: 'part-time' },
        { label: 'Fixed term', value: 'fixed-term' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'startsOn', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar' } },
    { name: 'closesOn', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar', description: 'Last day to apply; the opening disappears after it.' } },
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 280 },
    { name: 'description', type: 'richText', localized: true, admin: { description: 'Role, requirements, what the school offers.' } },
    translationStatusField,
    seoField,
  ],
}
