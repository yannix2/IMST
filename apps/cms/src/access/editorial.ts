import { APIError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'
import { hasRole, publishedOrStaff } from './roles'

// The editorial workflow every public content collection follows (ARCHITECTURE.md section 4):
// editors and reviewers write drafts, only reviewers (and administrators) publish or delete,
// staff read everything, the maarif-api gateway reads published documents only.
export const editorialAccess: NonNullable<CollectionConfig['access']> = {
  read: publishedOrStaff,
  create: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  update: ({ req }) => hasRole(req, 'editor', 'reviewer'),
  delete: ({ req }) => hasRole(req, 'reviewer'),
}

export const onlyReviewersPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (data?._status === 'published' && !hasRole(req, 'reviewer')) throw new APIError('Only a reviewer can publish.', 403)
  return data
}
