import type { CollectionConfig } from 'payload'
import { adminOnly, adminOnlyField, hasRole, staffRoles } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
  },
  auth: {
    tokenExpiration: 8 * 60 * 60, // one working day
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 minutes
    cookies: { secure: true, sameSite: 'Strict' },
  },
  access: {
    // Staff see their own account; administrators manage everyone.
    read: ({ req }) => (hasRole(req, 'admin') ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: adminOnly,
    delete: adminOnly,
    update: ({ req }) => (hasRole(req, 'admin') ? true : req.user ? { id: { equals: req.user.id } } : false),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
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
      options: staffRoles.map((role) => ({ label: role, value: role })),
      saveToJWT: true,
      access: { update: adminOnlyField, create: adminOnlyField },
    },
  ],
  timestamps: true,
}
