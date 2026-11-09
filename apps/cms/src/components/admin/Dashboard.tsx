import type { Payload, PayloadRequest } from 'payload'

// The maarifcms home screen (wave 3): what needs attention today, for this person's role, and
// quick links. Server component; counts use the staff member's own access rights.
type User = { id?: string | number; name?: string; roles?: string[] } | null

const draftCollections = ['news', 'albums', 'clubs', 'trips', 'documents', 'jobs', 'pages', 'page-visuals', 'faqs', 'testimonials', 'people'] as const

async function count(payload: Payload, user: User, collection: string, where: Record<string, unknown>) {
  try {
    const { totalDocs } = await payload.count({ collection: collection as never, where: where as never, user: user as never, overrideAccess: false })
    return totalDocs
  } catch {
    return null
  }
}

export async function Dashboard({ payload, user, req }: { payload: Payload; user: User; req?: PayloadRequest }) {
  void req
  const roles = user?.roles ?? []
  const is = (...r: string[]) => roles.includes('admin') || r.some((x) => roles.includes(x))

  const tiles: { label: string; value: number | null; href: string; show: boolean }[] = [
    { label: 'New visit requests and pre-registrations', value: await count(payload, user, 'inquiries', { status: { equals: 'new' }, kind: { in: ['visit-booking', 'pre-registration'] } }), href: '/admin/collections/inquiries?where[status][equals]=new', show: is('admissions') },
    { label: 'New messages from parents and visitors', value: await count(payload, user, 'inquiries', { status: { equals: 'new' }, kind: { in: ['contact', 'feedback'] } }), href: '/admin/collections/inquiries?where[status][equals]=new', show: is('admissions') },
    { label: 'New job applications', value: await count(payload, user, 'applications', { status: { equals: 'new' } }), href: '/admin/collections/applications?where[status][equals]=new', show: is() },
    { label: 'Photos waiting for a consent decision', value: await count(payload, user, 'media', { consent: { equals: 'pending' } }), href: '/admin/collections/media?where[consent][equals]=pending', show: is('reviewer', 'editor') },
  ]
  let drafts = 0
  if (is('reviewer', 'editor')) {
    for (const c of draftCollections) drafts += (await count(payload, user, c, { _status: { equals: 'draft' } })) ?? 0
  }

  const links = [
    { label: 'Write a news item or event', href: '/admin/collections/news/create', show: is('editor', 'reviewer') },
    { label: 'Add photos', href: '/admin/collections/media/create', show: is('editor', 'reviewer') },
    { label: 'Choose the photos of a page', href: '/admin/collections/page-visuals', show: is('editor', 'reviewer') },
    { label: 'This week’s canteen menu', href: '/admin/collections/weekly-menus', show: is('editor', 'reviewer') },
    { label: 'Post a job opening', href: '/admin/collections/jobs/create', show: is('editor', 'reviewer') },
    { label: 'Staff accounts', href: '/admin/collections/users', show: is() },
    { label: 'Site settings (notifications, analytics)', href: '/admin/globals/site-settings', show: is() },
  ]

  const box: React.CSSProperties = { border: '1px solid var(--theme-elevation-150)', borderRadius: 12, padding: '1rem 1.25rem', background: 'var(--theme-elevation-50)' }
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ margin: '0 0 0.25rem' }}>Hello{user?.name ? `, ${user.name}` : ''}</h2>
      <p style={{ margin: '0 0 1.25rem', color: 'var(--theme-elevation-600)' }}>
        What needs attention on the website today. A photo appears on the site only after a reviewer sets its consent status.
      </p>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}>
        {tiles
          .filter((t) => t.show && t.value !== null)
          .map((t) => (
            <a key={t.label} href={t.href} style={{ ...box, textDecoration: 'none', color: 'inherit' }}>
              <strong style={{ fontSize: '2rem', display: 'block', color: t.value ? '#00737C' : 'inherit' }}>{t.value}</strong>
              {t.label}
            </a>
          ))}
        {is('reviewer', 'editor') ? (
          <div style={box}>
            <strong style={{ fontSize: '2rem', display: 'block', color: drafts ? '#00737C' : 'inherit' }}>{drafts}</strong>
            Drafts not yet published{is('reviewer') ? ' (a reviewer publishes them)' : ''}
          </div>
        ) : null}
      </div>
      <h3 style={{ margin: '1.5rem 0 0.5rem' }}>Quick links</h3>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {links
          .filter((l) => l.show)
          .map((l) => (
            <li key={l.href}>
              <a className="btn btn--style-secondary btn--size-small" href={l.href} style={{ margin: 0 }}>
                {l.label}
              </a>
            </li>
          ))}
      </ul>
    </section>
  )
}
