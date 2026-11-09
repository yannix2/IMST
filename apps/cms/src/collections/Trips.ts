import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { photosField, slugField, stagesField, translationStatusField } from '../fields/common'

// Field trips for /campus-life/trips (wave 3): the destinations the school visits, with the levels
// that go there and photos once consent allows.
export const Trips: CollectionConfig = {
  slug: 'trips',
  labels: { singular: 'Field trip', plural: 'Field trips' },
  admin: { useAsTitle: 'destination', defaultColumns: ['destination', 'place', 'order', '_status'], group: 'School life' },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('trips')) },
  fields: [
    { name: 'destination', type: 'text', required: true, localized: true, maxLength: 100 },
    slugField('destination'),
    { name: 'place', type: 'text', localized: true, maxLength: 80, admin: { description: 'Town or region, for example Zaghouan.' } },
    stagesField,
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 400 },
    { name: 'lastVisit', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' }, position: 'sidebar' } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    photosField('photos', 12),
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    translationStatusField,
  ],
}
