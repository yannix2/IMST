import type { CollectionConfig } from 'payload'
import { formKinds, grades, locales } from '@maarif/contracts'
import { hasRole, isGateway } from '../access/roles'

// Form entries from the public site (pre-registration, visit booking, contact).
// Personal data: only admissions staff and administrators can read them; only the
// gateway can create them; nobody but an administrator can delete them.
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'contactName',
    defaultColumns: ['contactName', 'kind', 'grade', 'status', 'createdAt'],
    group: 'Admissions',
  },
  access: {
    create: ({ req }) => isGateway(req),
    read: ({ req }) => hasRole(req, 'admissions'),
    update: ({ req }) => hasRole(req, 'admissions'),
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  fields: [
    { name: 'kind', type: 'select', required: true, options: [...formKinds], index: true },
    { name: 'locale', type: 'select', required: true, options: [...locales] },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: ['new', 'contacted', 'closed'],
    },
    { name: 'contactName', type: 'text', required: true, maxLength: 120 },
    { name: 'phone', type: 'text', maxLength: 20 },
    { name: 'email', type: 'email' },
    { name: 'grade', type: 'select', options: [...grades] },
    { name: 'message', type: 'textarea', maxLength: 2000 },
    // Form-specific answers (student name, city, preferred visit date, topic).
    { name: 'details', type: 'json' },
    { name: 'privacyNoticeAcceptedAt', type: 'date', required: true },
    {
      name: 'staffNotes',
      type: 'textarea',
      access: { create: () => false },
      admin: { description: 'Internal notes. Never shared with the family.' },
    },
  ],
  timestamps: true,
}
