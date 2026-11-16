import type { CollectionConfig } from 'payload'
import { editorialAccess, onlyReviewersPublish } from '../access/editorial'
import { refreshHooks, tagsFor } from '../hooks/revalidate'
import { campusField, stagesField, translationStatusField } from '../fields/common'

// Key dates of the school year (wave 6): term starts, holidays, exam periods, parent meetings.
// The Calendar page lists them by month and offers them as a calendar file ("Add to my
// calendar"); the PDF calendar in Documents stays as the official version. Whole days only:
// times of day belong in the note, so nothing depends on a time zone.
export const keyDateKinds = ['term', 'holiday', 'exam', 'meeting', 'event', 'other'] as const

const DAY = /^\d{4}-\d{2}-\d{2}/

export const KeyDates: CollectionConfig = {
  slug: 'key-dates',
  labels: { singular: 'Key date', plural: 'Key dates (calendar)' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'startsOn', 'endsOn', '_status'], group: 'Parents' },
  defaultSort: 'startsOn',
  versions: { drafts: true, maxPerDoc: 10 },
  access: editorialAccess,
  hooks: { beforeChange: [onlyReviewersPublish], ...refreshHooks(tagsFor('key-dates')) },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 120, admin: { description: 'For example: Winter holiday, First day of school, Parent-teacher meetings.' } },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: [
        { label: 'Start or end of term', value: 'term' },
        { label: 'Holiday (no school)', value: 'holiday' },
        { label: 'Exams', value: 'exam' },
        { label: 'Meeting with parents', value: 'meeting' },
        { label: 'School event', value: 'event' },
        { label: 'Other', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'startsOn', label: 'First day', type: 'date', required: true, index: true, admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar' } },
    {
      name: 'endsOn',
      label: 'Last day',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar', description: 'Leave empty for a single day.' },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        const start = siblingData?.startsOn
        if (!value || typeof start !== 'string' || !DAY.test(start)) return true
        const end = value instanceof Date ? value.toISOString() : String(value)
        return end.slice(0, 10) >= start.slice(0, 10) ? true : 'The last day cannot be before the first day.'
      },
    },
    stagesField,
    campusField,
    { name: 'note', type: 'textarea', localized: true, maxLength: 280, admin: { description: 'Optional: times, place, what families should bring.' } },
    translationStatusField,
  ],
}
