import { useMemo, useState } from 'react'
import ReportCard from '../../components/ReportCard'
import { EmptyState } from '../../components/ui'
import { HAZARD_CATEGORIES, computeSeverity } from '../../lib/constants'
import { cn } from '../../lib/utils'

const SORTS = [
  { key: 'newest', label: 'Recent First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'critical', label: 'Critical First' }
]

export default function DeskView({ reports, onOpenReport }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('newest')

  const queue = useMemo(() => {
    let list = reports.filter((r) => r.status === 'Pending')
    if (cat !== 'all') list = list.filter((r) => (r.category || '').toLowerCase().includes(cat.toLowerCase()))
    const sevRank = { critical: 0, high: 1, moderate: 2, low: 3 }
    list.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sort === 'critical') return sevRank[computeSeverity(a)] - sevRank[computeSeverity(b)]
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return list
  }, [reports, cat, sort])

  const todayCount = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return reports.filter(
      (r) => r.status === 'Verified' && new Date(r.verifiedAt || r.createdAt) >= start
    ).length
  }, [reports])

  const sortLabel = SORTS.find((s) => s.key === sort)?.label || 'Recent First'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-7 pt-[18px]">
        <div className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.7px] text-primary">
          Barangay Official
        </div>
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">Verification Desk</h1>

        <div className="mb-3 rounded-[14px] bg-primary-dark p-5 text-white">
          <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-wide opacity-75">Action Needed</div>
          <div className="mb-1 text-[3rem] font-black leading-none">{queue.length}</div>
          <div className="mb-3.5 text-[0.85rem] opacity-85">Unverified reports awaiting your review</div>
          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-white/20 px-3.5 py-2 text-[0.78rem] font-extrabold tracking-wide text-white"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <i className="fas fa-filter" /> {filterOpen ? 'Hide Filters' : 'Filter Queue'}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <i className="fas fa-calendar-check mb-1.5 text-[1.3rem] text-primary" />
            <div className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Verified Today</div>
            <div className="text-[1.9rem] font-extrabold text-ink">{todayCount}</div>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <i className="fas fa-exclamation-triangle mb-1.5 text-[1.3rem] text-warning" />
            <div className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Avg. Response</div>
            <div className="text-[1.9rem] font-extrabold text-ink">~2.4h</div>
          </div>
        </div>

        {filterOpen && (
          <div className="mb-4 rounded-xl border-[1.5px] border-line bg-card p-3.5 shadow-card">
            <div className="mb-2 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Hazard Type</div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button className={cn('chip', cat === 'all' && 'chip-active')} onClick={() => setCat('all')}>
                All
              </button>
              {HAZARD_CATEGORIES.map((c) => (
                <button key={c} className={cn('chip', cat === c && 'chip-active')} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="mb-2 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Sort By</div>
            <div className="flex flex-wrap gap-1.5">
              {SORTS.map((s) => (
                <button key={s.key} className={cn('chip', sort === s.key && 'chip-active')} onClick={() => setSort(s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-400">
            Pending Verification
          </div>
          <button className="flex cursor-pointer items-center gap-1.5 border-0 bg-none text-[0.78rem] font-bold text-primary" onClick={() => setFilterOpen((o) => !o)}>
            <span>{sortLabel}</span>
            <i className="fas fa-filter" />
          </button>
        </div>

        {queue.length === 0 ? (
          <div className="rounded-xl bg-card py-10 text-center shadow-card">
            <i className="fas fa-check-circle mb-2.5 block text-[2rem] text-gray-300" />
            <p className="text-[0.85rem] leading-relaxed text-gray-400">
              You've reviewed all pending reports.
              <br />
              Great work keeping Olongapo safe.
            </p>
          </div>
        ) : (
          queue.map((r) => <ReportCard key={r.id} report={r} onClick={onOpenReport} />)
        )}
      </div>
    </div>
  )
}
