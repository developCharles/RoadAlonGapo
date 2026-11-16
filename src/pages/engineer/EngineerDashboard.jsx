import { useMemo, useState } from 'react'
import { computeSeverity, SEVERITY_META, STATUS_META, getCategoryIcon, REPORT_STATUSES, HAZARD_CATEGORIES } from '../../lib/constants'
import { cn, timeAgo } from '../../lib/utils'
import { EmptyState } from '../../components/ui'

const SEVERITIES = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'low', label: 'Low' }
]

const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'severity', label: 'Most Critical' },
  { key: 'upvotes', label: 'Most Upvotes' }
]

export default function EngineerDashboard({ reports, onOpen }) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sev, setSev] = useState('all')
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = [...reports]
    if (sev !== 'all') list = list.filter((r) => computeSeverity(r) === sev)
    if (cat !== 'all') list = list.filter((r) => (r.category || '').toLowerCase().includes(cat.toLowerCase()))
    if (status !== 'all') list = list.filter((r) => r.status === status)
    const rank = { critical: 0, high: 1, moderate: 2, low: 3 }
    list.sort((a, b) => {
      if (sort === 'severity') return rank[computeSeverity(a)] - rank[computeSeverity(b)]
      if (sort === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return list
  }, [reports, sev, cat, status, sort])

  const actionCount = useMemo(
    () =>
      reports.filter(
        (r) =>
          ['Verified', 'In Progress'].includes(r.status) &&
          ['critical', 'high'].includes(computeSeverity(r))
      ).length,
    [reports]
  )
  const assigned = reports.filter(
    (r) => r.assignedTeam && ['Verified', 'In Progress'].includes(r.status)
  ).length
  const resolved = reports.filter((r) => r.status === 'Resolved').length

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-7 pt-[18px]">
        <div className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.7px] text-primary">
          City Engineering Office
        </div>
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">Response Dashboard</h1>

        <div className="mb-3 rounded-[14px] bg-primary-dark p-5 text-white">
          <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-wide opacity-75">Action Needed</div>
          <div className="mb-1 text-[3rem] font-black leading-none">{actionCount}</div>
          <div className="text-[0.85rem] opacity-85">Critical &amp; high-severity hazards awaiting response</div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <i className="fas fa-users mb-1.5 text-[1.3rem] text-primary" />
            <div className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Active Tasks</div>
            <div className="text-[1.9rem] font-extrabold text-ink">{assigned}</div>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <i className="fas fa-check-circle mb-1.5 text-[1.3rem] text-success" />
            <div className="text-[0.68rem] font-bold uppercase tracking-wide text-muted">Resolved</div>
            <div className="text-[1.9rem] font-extrabold text-ink">{resolved}</div>
          </div>
        </div>

        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-400">Hazard Queue</div>
          <button
            className="flex cursor-pointer items-center gap-1.5 border-0 bg-none text-[0.78rem] font-bold text-primary"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <span>{SORTS.find((s) => s.key === sort)?.label}</span>
            <i className="fas fa-filter" />
          </button>
        </div>

        {filterOpen && (
          <div className="mb-4 rounded-xl border-[1.5px] border-line bg-card p-3.5 shadow-card">
            <div className="mb-2 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Severity</div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {SEVERITIES.map((s) => (
                <button key={s.key} className={cn('chip', sev === s.key && 'chip-active')} onClick={() => setSev(s.key)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mb-2 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Status</div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <button className={cn('chip', status === 'all' && 'chip-active')} onClick={() => setStatus('all')}>
                All
              </button>
              {REPORT_STATUSES.map((s) => (
                <button key={s} className={cn('chip', status === s && 'chip-active')} onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
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

        {filtered.length === 0 ? (
          <EmptyState icon="fa-clipboard-check" title="No hazards match" sub="Try adjusting the filters." />
        ) : (
          filtered.map((r) => <HazardCard key={r.id} report={r} onClick={() => onOpen(r)} />)
        )}
      </div>
    </div>
  )
}

function HazardCard({ report, onClick }) {
  const sev = computeSeverity(report)
  const sevMeta = SEVERITY_META[sev]
  const statusMeta = STATUS_META[report.status] || STATUS_META.Pending
  return (
    <div
      className="mb-3 cursor-pointer overflow-hidden rounded-[14px] border-l-4 bg-card shadow-card transition-transform active:scale-[0.98]"
      style={{ borderLeftColor: sevMeta.pill || '#0056b3' }}
      onClick={onClick}
    >
      <div className="flex h-20 items-center justify-center bg-gray-200">
        {report.imageUrl ? (
          <img src={report.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className={cn('fas text-[1.8rem] text-gray-300', getCategoryIcon(report.category))} />
        )}
      </div>
      <div className="p-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn('badge', sevMeta.badge)}>{sevMeta.label}</span>
            <span className={cn('badge', statusMeta.badge)}>{statusMeta.label}</span>
          </div>
          <span className="text-[0.7rem] font-semibold text-gray-400">{timeAgo(report.createdAt)}</span>
        </div>
        <div className="mb-0.5 text-base font-extrabold text-ink">{report.category}</div>
        <div className="mb-2.5 flex items-center gap-1.5 text-[0.8rem] text-muted">
          <i className="fas fa-map-marker-alt text-[0.75rem] text-primary" />
          <span className="truncate">{report.location || '—'}</span>
        </div>
        <div className="mb-3 flex items-center gap-2">
          {(report.upvotes || 0) > 0 && (
            <span className="flex items-center gap-1 rounded-[10px] bg-secondary/10 px-2 py-0.5 text-[0.66rem] font-extrabold text-secondary">
              <i className="fas fa-thumbs-up" /> {report.upvotes}
            </span>
          )}
          {report.assignedTeam && (
            <span className="flex items-center gap-1 rounded-[10px] bg-primary/10 px-2 py-0.5 text-[0.66rem] font-extrabold text-primary">
              <i className="fas fa-users" /> {report.assignedTeam}
            </span>
          )}
        </div>
        <button className="btn-primary w-full" type="button">
          <i className="fas fa-external-link-alt" /> Open Task
        </button>
      </div>
    </div>
  )
}
