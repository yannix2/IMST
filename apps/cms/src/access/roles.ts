import type { Access, FieldAccess, PayloadRequest } from 'payload'

// Staff roles (ARCHITECTURE.md section 4). Editors draft, reviewers publish,
// admissions staff handle form entries, administrators manage everything.
export const staffRoles = ['admin', 'editor', 'reviewer', 'admissions'] as const
export type StaffRole = (typeof staffRoles)[number]

type AuthUser = { collection?: string; roles?: StaffRole[] | null }

function user(req: PayloadRequest): AuthUser | null {
  return (req.user as AuthUser | null) ?? null
}

export function isStaff(req: PayloadRequest): boolean {
  return user(req)?.collection === 'users'
}

export function hasRole(req: PayloadRequest, ...roles: StaffRole[]): boolean {
  const current = user(req)
  if (current?.collection !== 'users') return false
  return Boolean(current.roles?.some((role) => role === 'admin' || roles.includes(role)))
}

// The maarif-api gateway authenticates as an `api-clients` document with an API key.
export function isGateway(req: PayloadRequest): boolean {
  return user(req)?.collection === 'api-clients'
}

export const adminOnly: Access = ({ req }) => hasRole(req, 'admin')
export const staffOnly: Access = ({ req }) => isStaff(req)
export const adminOnlyField: FieldAccess = ({ req }) => hasRole(req, 'admin')

// Published content: staff see drafts too; the gateway sees published documents only;
// anonymous requests see nothing (the public site reads through maarif-api).
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req)) return true
  if (isGateway(req)) return { _status: { equals: 'published' } }
  return false
}
