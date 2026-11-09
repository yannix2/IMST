import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { campusField, photosField, slugField, stagesField, translationStatusField } from '../fields/common'

// Clubs and activities for /campus-life/clubs (wave 3). Only clubs the school actually runs.
export const Clubs: CollectionConfig = {
  slug: 'clubs',
  labels: { singular: 'Club', plural: 'Clubs and activities' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'campus', 'order', '_status'], group: 'School life' },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('clubs')) },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, maxLength: 80 },
    slugField('name'),
    stagesField,
    campusField,
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 280 },
    { name: 'description', type: 'richText', localized: true },
    { name: 'schedule', type: 'text', localized: true, maxLength: 120, admin: { description: 'For example: Wednesdays 14:00 to 15:30.' } },
    { name: 'partner', type: 'text', maxLength: 120, admin: { description: 'Organisation that runs the club with the school, if any.' } },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    photosField('photos', 12),
    { name: 'order', type: 'number', defaultValue: 100, admin: { position: 'sidebar' } },
    translationStatusField,
  ],
}
