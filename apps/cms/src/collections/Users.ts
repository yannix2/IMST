import { APIError, type CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, hasRole, staffRoles } from '../access/roles'
import { forgotPasswordEmail, inviteOnCreate } from '../email/accounts'

// Staff accounts. Passwords: at least 12 characters (ARCHITECTURE.md section 4); 5 failed logins
// lock the account for 15 minutes; a session lasts one working day. Keep two administrators so
// the school is never locked out (docs: "Using maarifcms").
const MIN_PASSWORD = 12

const roleLabels: Record<(typeof staffRoles)[number], string> = {
  admin: 'Administrator (everything, including accounts and settings)',
  editor: 'Editor (writes drafts)',
  reviewer: 'Reviewer (publishes, clears photos)',
  admissions: 'Admissions (handles form entries)',
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff account', plural: 'Staff accounts' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
    group: 'System',
  },
  auth: {
    tokenExpiration: 8 * 60 * 60, // one working day
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    cookies: { secure: true, sameSite: 'Strict' },
    // Wave 4: the reset email in the school layout and the person's language. No `expiration`
    // here on purpose: resets keep Payload's 1 hour, invitations ask for 72 hours (email/accounts.ts).
    forgotPassword: forgotPasswordEmail,
  },
  access: {
    // Staff see their own account; administrators manage everyone.
    read: ({ req }) => (hasRole(req, 'admin') ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: adminOnly,
    delete: adminOnly,
    update: ({ req }) => (hasRole(req, 'admin') ? true : req.user ? { id: { equals: req.user.id } } : false),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const password = (data as { password?: unknown } | undefined)?.password
        if (typeof password === 'string' && password.length > 0 && password.length < MIN_PASSWORD) {
          throw new APIError(`The password must have at least ${MIN_PASSWORD} characters.`, 400)
        }
        return data
      },
    ],
    // Wave 4: a new account gets an invitation email to choose its own password.
    afterChange: [inviteOnCreate],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'language',
      label: 'Language of emails',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Français', value: 'fr' },
        { label: 'العربية', value: 'ar' },
        { label: 'Türkçe', value: 'tr' },
      ],
      admin: {
        description:
          'The invitation and password emails use this language. When you create an account, type any temporary password: the person receives an email to choose their own (the link works for 72 hours).',
      },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      // The very first account becomes an administrator so the school can bootstrap the CMS.
      defaultValue: async ({ req }) => {
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        return totalDocs === 0 ? ['admin'] : ['editor']
      },
      options: staffRoles.map((role) => ({ label: roleLabels[role], value: role })),
      saveToJWT: true,
      access: { update: adminOnlyField, create: adminOnlyField },
    },
  ],
  timestamps: true,
}
