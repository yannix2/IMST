import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { consentReminder, photosField, seoField, slugField, stagesField, translationStatusField, viewOnSite } from '../fields/common'

// News and events: the three latest on Home, all of them on /campus-life/news and
// /campus-life/events, each with its own page (/campus-life/news/<slug>) since wave 3.
// Editors draft, reviewers publish.
export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'News item', plural: 'News and events' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'date', '_status'], group: 'School life', preview: viewOnSite('campus-life/news') },
  defaultSort: '-date',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('news', true)) },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'news',
      options: [
        { label: 'News', value: 'news' },
        { label: 'Event', value: 'event' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 100 },
    slugField(),
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' }, description: 'For an event: the day it happens. For news: the day it happened.' },
    },
    stagesField,
    { name: 'summary', type: 'textarea', required: true, localized: true, maxLength: 280 },
    { name: 'body', type: 'richText', localized: true, admin: { description: 'The full story on the news page.' } },
    { name: 'image', label: 'Cover photo', type: 'upload', relationTo: 'media', admin: { description: consentReminder } },
    photosField('photos', 24),
    {
      name: 'event',
      type: 'group',
      admin: { condition: (data) => data?.kind === 'event', description: 'Only for events.' },
      fields: [
        { name: 'startsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endsAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'place', type: 'text', localized: true, maxLength: 120 },
        { name: 'registration', type: 'text', localized: true, maxLength: 200, admin: { description: 'How families sign up, if they need to.' } },
      ],
    },
    translationStatusField,
    seoField,
  ],
}
