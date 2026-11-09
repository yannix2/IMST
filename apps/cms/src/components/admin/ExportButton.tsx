// "Export to spreadsheet" above an inbox list (wave 3). A plain link to the collection's CSV
// endpoint (endpoints/exportCsv.ts); the staff member's session cookie authorises it.
export function ExportButton({ collection, label = 'Export to spreadsheet (CSV)' }: { collection: string; label?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 1rem' }}>
      <a className="btn btn--style-secondary btn--size-small" href={`/cms-api/${collection}/export.csv`} download>
        {label}
      </a>
    </div>
  )
}
