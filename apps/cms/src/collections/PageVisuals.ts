import type { CollectionConfig } from 'payload'
import { sitePageKeys } from '@maarif/contracts'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { consentReminder } from '../fields/common'

// Which photos a page shows (wave 3, owner decision 2026-11-09: every photo is managed here).
// One document per page: the header photo and named places in the page ("slots", for example
// "levels-kindergarten" or "steps-visit"); each page's code lists the slots it uses.
export const PageVisuals: CollectionConfig = {
  slug: 'page-visuals',
  labels: { singular: 'Page photos', plural: 'Page photos' },
  admin: {
    useAsTitle: 'page',
    defaultColumns: ['page', 'header', 'updatedAt', '_status'],
    group: 'Content',
    description: 'Choose the photos each page shows. A page without a published entry keeps its drawing.',
  },
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('visuals')) },
  fields: [
    { name: 'page', type: 'select', required: true, unique: true, index: true, options: [...sitePageKeys] },
    { name: 'header', label: 'Header photo', type: 'upload', relationTo: 'media', admin: { description: consentReminder } },
    {
      name: 'slots',
      label: 'Photos inside the page',
      type: 'array',
      // Home alone uses 29 places (levels, life, Cambridge, journey); room to grow.
      maxRows: 40,
      fields: [
        { name: 'slot', type: 'text', required: true, maxLength: 60, admin: { description: 'Place name used by the page. Every inner page: band-1, band-2, band-3 (the row of photos near the end). Home: levels-*, life-*, cambridge-1 to 8, journey-1 to 5. Some pages have their own (see the staff guide).' } },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}
