import type { GlobalConfig } from 'payload'
import { stages } from '@maarif/contracts'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshGlobal } from '../hooks/revalidate'
import { campusField } from '../fields/common'

// School day times per level and campus for /parents/schedules (wave 3). Shown only once a
// reviewer ticks "Show on the website"; never filled with times the school has not confirmed.
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export const Timetables: GlobalConfig = {
  slug: 'timetables',
  label: 'School day times',
  admin: { group: 'Parents' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  },
  hooks: { afterChange: [refreshGlobal('timetables')] },
  fields: [
    {
      name: 'published',
      label: 'Show on the website',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    { name: 'schoolYear', type: 'text', maxLength: 9, admin: { position: 'sidebar', description: 'For example 2026-2027.' } },
    {
      name: 'rows',
      type: 'array',
      maxRows: 20,
      fields: [
        { name: 'stage', type: 'select', required: true, options: [...stages] },
        campusField,
        { name: 'days', type: 'text', localized: true, required: true, maxLength: 60, admin: { description: 'For example: Monday to Friday.' } },
        { name: 'start', type: 'text', required: true, validate: (v: unknown) => (typeof v === 'string' && TIME.test(v) ? true : 'Use HH:MM.') },
        { name: 'end', type: 'text', required: true, validate: (v: unknown) => (typeof v === 'string' && TIME.test(v) ? true : 'Use HH:MM.') },
        { name: 'note', type: 'text', localized: true, maxLength: 160 },
      ],
    },
  ],
}
