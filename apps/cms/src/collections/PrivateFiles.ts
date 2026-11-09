import { APIError, type CollectionConfig } from 'payload'
import { cvRules } from '@maarif/contracts'
import { hasRole, isGateway } from '../access/roles'

// CVs sent with job applications (wave 3, owner decision 2026-11-09). Personal data: only the
// maarif-api gateway can add a file, only administrators can open or delete one, and the gateway
// can never read them back, so they are never served on the public site. Stored in R2 under
// `private/`; deleted with their application after the retention period (jobs/retention).
export const PrivateFiles: CollectionConfig = {
  slug: 'private-files',
  labels: { singular: 'Private file', plural: 'Private files (CVs)' },
  admin: { group: 'Careers', hidden: ({ user }) => !(user as { roles?: string[] } | null)?.roles?.includes('admin') },
  access: {
    create: ({ req }) => isGateway(req),
    read: ({ req }) => hasRole(req, 'admin'),
    update: () => false,
    delete: ({ req }) => hasRole(req, 'admin'),
  },
  hooks: {
    beforeOperation: [
      ({ operation, req }) => {
        const size = (req.file as { size?: number } | undefined)?.size
        if (operation === 'create' && size && size > cvRules.maxBytes) throw new APIError('The CV must be at most 5 MB.', 413)
      },
    ],
  },
  fields: [{ name: 'label', type: 'text', maxLength: 160 }],
  upload: {
    mimeTypes: [cvRules.mimeType],
    crop: false,
    focalPoint: false,
  },
}
