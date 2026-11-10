import type { Endpoint, PayloadRequest } from 'payload'
import type { StaffRole } from '../access/roles'
import { hasRole } from '../access/roles'

// Spreadsheet export of an inbox (wave 3): GET /cms-api/<collection>/export.csv, opened from the
// "Export to spreadsheet" button above the list. Same rights as reading the list (admissions for
// inquiries, administrators for applications), read with the staff member's own access rules.
// UTF-8 with a byte-order mark so Excel shows Arabic and French accents correctly; cells that
// start with = + - @ are prefixed with ' so a spreadsheet never runs them as formulas.

type Column = { label: string; value: (doc: Record<string, unknown>) => unknown }

const cell = (value: unknown) => {
  let s = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCsv(collection: string, roles: StaffRole[], columns: Column[]): Endpoint {
  return {
    path: '/export.csv',
    method: 'get',
    handler: async (req: PayloadRequest) => {
      if (!hasRole(req, ...roles)) return Response.json({ error: 'forbidden' }, { status: 403 })
      const status = req.searchParams.get('status')
      const result = await req.payload.find({
        collection: collection as never,
        where: status ? { status: { equals: status } } : undefined,
        sort: '-createdAt',
        limit: 5000,
        depth: 1,
        user: req.user,
        overrideAccess: false,
        req,
      })
      const rows = [columns.map((c) => cell(c.label)).join(','), ...result.docs.map((doc) => columns.map((c) => cell(c.value(doc as Record<string, unknown>))).join(','))]
      const date = new Date().toISOString().slice(0, 10)
      return new Response(`﻿${rows.join('\r\n')}\r\n`, {
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition': `attachment; filename="${collection}-${date}.csv"`,
          'cache-control': 'no-store',
        },
      })
    },
  }
}

const field = (name: string) => (doc: Record<string, unknown>) => doc[name]
const detail = (name: string) => (doc: Record<string, unknown>) => (doc.details as Record<string, unknown> | undefined)?.[name]

export const inquiriesCsv = exportCsv('inquiries', ['admissions'], [
  { label: 'Received', value: field('createdAt') },
  { label: 'Kind', value: field('kind') },
  { label: 'Status', value: field('status') },
  { label: 'Name', value: field('contactName') },
  { label: 'Phone', value: field('phone') },
  { label: 'Email', value: field('email') },
  { label: 'Grade', value: field('grade') },
  { label: 'Language', value: field('locale') },
  { label: 'Student', value: detail('studentName') },
  { label: 'City or area', value: detail('cityArea') },
  { label: 'Preferred day', value: detail('preferredDate') },
  { label: 'Preferred time', value: detail('preferredSlot') },
  { label: 'Topic', value: (d) => detail('topic')(d) ?? detail('feedbackKind')(d) },
  { label: 'Message', value: field('message') },
  { label: 'Visit confirmed for', value: (d) => (d.visit as { confirmedFor?: unknown } | undefined)?.confirmedFor },
  { label: 'Confirmation emailed', value: (d) => (d.visit as { confirmationSentAt?: unknown } | undefined)?.confirmationSentAt },
  { label: 'Staff notes', value: field('staffNotes') },
])

export const applicationsCsv = exportCsv('applications', ['admin'], [
  { label: 'Received', value: field('createdAt') },
  { label: 'Status', value: field('status') },
  { label: 'Name', value: field('name') },
  { label: 'Email', value: field('email') },
  { label: 'Phone', value: field('phone') },
  { label: 'Position', value: field('position') },
  { label: 'Opening', value: (d) => (typeof d.job === 'object' && d.job ? (d.job as { title?: unknown }).title : '') },
  { label: 'Language', value: field('locale') },
  { label: 'Message', value: field('message') },
  { label: 'Staff notes', value: field('staffNotes') },
])
