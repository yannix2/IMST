import type { GlobalConfig } from 'payload'
import { hasRole, isGateway } from '../access/roles'

// Settings the administrator changes without code (wave 3): who is told when a form or a job
// application arrives (ADR 009: the addresses must also be verified in Cloudflare Email Routing),
// office hours, and the Google Analytics measurement ID (ADR 010; used only after a visitor accepts).
const emails = (name: string, label: string) => ({
  name,
  label,
  type: 'array' as const,
  maxRows: 5,
  fields: [{ name: 'email', type: 'email' as const, required: true }],
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'System' },
  access: {
    read: ({ req }) => hasRole(req, 'admin') || isGateway(req),
    update: ({ req }) => hasRole(req, 'admin'),
  },
  fields: [
    {
      name: 'notifications',
      type: 'group',
      admin: { description: 'Each address must first be verified in Cloudflare Email Routing, or the email is not sent.' },
      fields: [
        emails('admissions', 'Visit requests and pre-registrations'),
        emails('general', 'Contact messages'),
        emails('parents', 'Parents’ suggestions and complaints'),
        emails('careers', 'Job applications'),
      ],
    },
    { name: 'officeHours', type: 'text', localized: true, maxLength: 160, admin: { description: 'For example: Monday to Friday, 8:00 to 16:00.' } },
    {
      name: 'gaMeasurementId',
      label: 'Google Analytics measurement ID',
      type: 'text',
      maxLength: 20,
      validate: (v: unknown) => (!v || (typeof v === 'string' && /^G-[A-Z0-9]{4,12}$/.test(v)) ? true : 'For example G-ABC123XYZ.'),
    },
    {
      name: 'retention',
      type: 'group',
      admin: { description: 'How long personal data is kept before automatic deletion (to confirm with the lawyer).' },
      fields: [
        { name: 'inquiriesMonths', type: 'number', defaultValue: 24, min: 1, max: 60 },
        { name: 'applicationsMonths', type: 'number', defaultValue: 6, min: 1, max: 24 },
        { name: 'auditLogMonths', type: 'number', defaultValue: 12, min: 1, max: 36 },
      ],
    },
  ],
}
