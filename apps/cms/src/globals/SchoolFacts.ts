import type { GlobalConfig } from 'payload'
import { hasRole, isGateway, isStaff } from '../access/roles'

// Facts the site shows only once the school enters and a reviewer approves them (owner decision
// 2026-11-05): the Cambridge centre number on the Accreditations page. Never fill this with a
// number that is not on the school's Cambridge certificate.
export const SchoolFacts: GlobalConfig = {
  slug: 'school-facts',
  label: 'School facts',
  admin: { group: 'Content' },
  access: {
    read: ({ req }) => isStaff(req) || isGateway(req),
    update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  },
  fields: [
    {
      name: 'published',
      label: 'Show on the website',
      type: 'checkbox',
      defaultValue: false,
      access: { update: ({ req }) => hasRole(req, 'reviewer') },
      admin: { position: 'sidebar' },
    },
    {
      name: 'cambridgeCentreNumber',
      label: 'Cambridge centre number',
      type: 'text',
      maxLength: 20,
      admin: { description: 'As printed on the Cambridge certificate, for example TN123.' },
    },
    { name: 'cambridgeSince', label: 'Cambridge centre since (year)', type: 'text', maxLength: 4 },
  ],
}
