'use client'

// The newsletter's two buttons in the sidebar (wave 4, B4): "Send a test to me" (each language
// version goes to the logged-in staff member) and, for reviewers, "Send to subscribers" once the
// newsletter is saved as "Ready to send". Both call the collection's endpoints
// (collections/Newsletters.ts) with the staff member's session.
import { useState } from 'react'
import { useAuth, useDocumentInfo, useFormFields, useFormModified } from '@payloadcms/ui'

type Result = { ok: boolean; error?: string; to?: string; results?: Record<string, string>; total?: number }

export function NewsletterActions() {
  const { id } = useDocumentInfo()
  const { user } = useAuth<{ roles?: string[] }>()
  const status = useFormFields(([fields]) => fields.status?.value as string | undefined)
  const modified = useFormModified()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const roles = user?.roles ?? []
  const reviewer = roles.includes('admin') || roles.includes('reviewer')

  if (!id) return <p style={{ color: 'var(--theme-elevation-600)' }}>Save the newsletter once to send a test.</p>
  if (status === 'sending') return <p>Sending in batches every five minutes. The counts below fill in as it goes.</p>
  if (status === 'sent') return <p>This newsletter has been sent.</p>

  async function call(path: 'test' | 'send') {
    if (path === 'send' && !window.confirm('Send this newsletter to every confirmed subscriber now? This cannot be undone.')) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/cms-api/newsletters/${id}/${path}`, { method: 'POST', credentials: 'include' })
      const result = (await response.json().catch(() => ({ ok: false }))) as Result
      if (path === 'test') {
        setMessage(result.ok ? `Test sent to ${result.to} (${Object.keys(result.results ?? {}).join(', ')}).` : (result.error ?? `Not sent: ${Object.entries(result.results ?? {}).map(([l, r]) => `${l} ${r}`).join(', ') || 'unknown error'}.`))
      } else {
        setMessage(result.ok ? `Sending started for ${result.total} subscribers. Reload the page to follow it.` : (result.error ?? 'Not started.'))
      }
    } catch {
      setMessage('The server did not answer. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '0.5rem', margin: '0 0 1.5rem' }}>
      <button type="button" className="btn btn--style-secondary btn--size-small" style={{ margin: 0 }} disabled={busy || modified} onClick={() => call('test')}>
        Send a test to me
      </button>
      {reviewer ? (
        <button type="button" className="btn btn--style-primary btn--size-small" style={{ margin: 0 }} disabled={busy || modified || status !== 'ready'} onClick={() => call('send')}>
          Send to subscribers
        </button>
      ) : null}
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-elevation-600)' }}>
        {modified ? 'Save your changes first.' : status !== 'ready' ? 'To send: set the status to "Ready to send" and save.' : reviewer ? 'Ready: a reviewer can send it.' : 'Ready: ask a reviewer to send it.'}
      </p>
      {message ? (
        <p role="status" style={{ margin: 0, fontWeight: 600 }}>
          {message}
        </p>
      ) : null}
    </div>
  )
}
