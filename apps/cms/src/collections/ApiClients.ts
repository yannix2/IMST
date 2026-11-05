import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/roles'

// Machine clients. maarif-api authenticates as one of these with
// `Authorization: api-clients API-Key <key>`; it has no password and cannot open the admin.
export const ApiClients: CollectionConfig = {
  slug: 'api-clients',
  admin: {
    useAsTitle: 'name',
    group: 'System',
  },
  auth: {
    useAPIKey: true,
    disableLocalStrategy: true,
  },
  access: {
    admin: () => false,
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [{ name: 'name', type: 'text', required: true }],
}
