import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { stagesField, translationStatusField } from '../fields/common'

// Documents for parents (wave 3): the academic calendar, the handbook, forms and policies, as PDFs.
// The file is per language, so a French handbook and an English one can sit side by side.
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents (PDF)' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'schoolYear', '_status'], group: 'Parents' },
  defaultSort: '-validFrom',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('documents')) },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 120 },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Academic calendar', value: 'calendar' },
        { label: 'Handbook', value: 'handbook' },
        { label: 'Form', value: 'form' },
        { label: 'Policy', value: 'policy' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'schoolYear', type: 'text', maxLength: 9, admin: { position: 'sidebar', description: 'For example 2026-2027.' } },
    stagesField,
    { name: 'summary', type: 'textarea', localized: true, maxLength: 280 },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      admin: { description: 'PDF, one per language when the school has it in that language.' },
    },
    { name: 'validFrom', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar' } },
    { name: 'validUntil', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar' } },
    translationStatusField,
  ],
}
