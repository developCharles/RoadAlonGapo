import { useMemo, useState } from 'react'
import ReportCard from '../../components/ReportCard'
import { EmptyState } from '../../components/ui'
import { cn } from '../../lib/utils'

const RANGES = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' }
]

export default function ReportsView({ reports, onOpen, onNew }) {
  const [range, setRange] = useState('all')

  const filtered = useMemo(() => {
    if (range === 'all') return reports
    const now = Date.now()
    const span = range === 'week' ? 7 : range === 'month' ? 30 : 365
    const cutoff = now - span * 24 * 60 * 60 * 1000
    return reports.filter((r) => new Date(r.createdAt).getTime() >= cutoff)
  }, [reports, range])

  const counts = useMemo(
    () => ({
      pending: reports.filter((r) => r.status === 'Pending').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length
    }),
    [reports]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-7 pt-5">
        <h2 className="mb-1 text-[1.5rem] font-extrabold text-ink">My Reports</h2>
        <p className="mb-4 text-[0.84rem] text-gray-400">
          {reports.length} filed · {counts.pending} pending · {counts.resolved} resolved
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={cn('chip', range === r.key && 'chip-active')}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="fa-clipboard-list"
            title="No reports yet"
            sub="Report a hazard from the map to get started."
          />
        ) : (
          filtered.map((r) => <ReportCard key={r.id} report={r} onClick={onOpen} />)
        )}
      </div>

      <button className="btn-primary mx-4 mb-4" onClick={onNew}>
        <i className="fas fa-plus" /> Report a Hazard
      </button>
    </div>
  )
}
