// maarifcms branding (wave 3): the school's official badge on the login screen and its symbol in
// the navigation, used unchanged (files copied from apps/web/public/brand).
export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/maarif-badge.svg" alt="International Maarif Schools of Tunisia" width={72} height={72} />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>maarifcms</div>
        <div style={{ color: 'var(--theme-elevation-600)' }}>International Maarif Schools of Tunisia</div>
      </div>
    </div>
  )
}

export function Icon() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/maarif-symbol.svg" alt="maarifcms" width={28} height={28} />
}
