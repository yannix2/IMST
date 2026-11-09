import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { photosField, seoField, slugField, stagesField, translationStatusField, viewOnSite } from '../fields/common'

// Photo albums for /campus-life/gallery (wave 3). One album per event or moment; the cover opens it.
export const Albums: CollectionConfig = {
  slug: 'albums',
  labels: { singular: 'Photo album', plural: 'Photo albums' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date', '_status'], group: 'School life', preview: viewOnSite('campus-life/gallery') },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('albums', true)) },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 100 },
    slugField(),
    { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar' } },
    stagesField,
    { name: 'summary', type: 'textarea', localized: true, maxLength: 280 },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    photosField('photos', 60),
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'video' } },
      admin: { description: 'Optional short video (MP4, at most 10 MB).' },
    },
    translationStatusField,
    seoField,
  ],
}
