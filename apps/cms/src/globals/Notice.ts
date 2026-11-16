import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'
import { refreshGlobal } from '../hooks/revalidate'

// The notice bar (wave 6): one short message above every page for things families must know
// today (a closure, a change of hours, a postponed event). Editors write it; only a reviewer
// can show it. It hides itself after "Show until", so an old notice never stays up.
const LINK = /^(\/[a-z0-9\-/]*|https:\/\/[^\s]+)$/

export const Notice: GlobalConfig = {
  slug: 'notice',
  label: 'Notice bar',
  admin: { group: 'Parents' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  },
  hooks: { afterChange: [refreshGlobal('notice')] },
  fields: [
    {
      name: 'active',
      label: 'Show on the website',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    {
      name: 'until',
      label: 'Show until',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' }, position: 'sidebar', description: 'The last day the notice is shown. Leave empty to hide it by hand.' },
    },
    {
      name: 'text',
      type: 'text',
      localized: true,
      maxLength: 180,
      admin: { description: 'One short sentence. A language with no text shows no notice: write it in all four.' },
    },
    {
      name: 'link',
      type: 'text',
      maxLength: 200,
      admin: { description: 'Optional. A page of the site without the language, for example /parents/calendar, or a full https:// address.' },
      validate: (v: unknown) => (!v || (typeof v === 'string' && LINK.test(v)) ? true : 'Start with / for a page of the site, or with https://.'),
    },
  ],
}
