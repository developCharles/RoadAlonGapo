import { useMemo, useState } from 'react'
import HazardMap from '../../components/HazardMap'
import BottomSheet from '../../components/BottomSheet'
import { HAZARD_CATEGORIES, REPORT_STATUSES, computeSeverity } from '../../lib/constants'
import { cn } from '../../lib/utils'

export default function BarangayMap({ reports, loading, onOpenReport }) {
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [cats, setCats] = useState([])
  const [statuses, setStatuses] = useState([])
  const [sort, setSort] = useState('newest')
  const [flyTo, setFlyTo] = useState(null)

  const filtered = useMemo(() => {
    let list = [...reports]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          (r.category || '').toLowerCase().includes(q) ||
          (r.location || '').toLowerCase().includes(q) ||
          (r.barangay || '').toLowerCase().includes(q)
      )
    }
    if (cats.length) {
      list = list.filter((r) => cats.some((c) => (r.category || '').toLowerCase().includes(c.toLowerCase())))
    }
    if (statuses.length) list = list.filter((r) => statuses.includes(r.status))
    const sevRank = { critical: 0, high: 1, moderate: 2, low: 3 }
    list.sort((a, b) => {
      if (sort === 'severity') return sevRank[computeSeverity(a)] - sevRank[computeSeverity(b)]
      if (sort === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return list
  }, [reports, search, cats, statuses, sort])

  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'Pending').length,
      verified: reports.filter((r) => r.status === 'Verified').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length
    }),
    [reports]
  )

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="absolute left-3.5 right-3.5 top-3 z-[1000]">
        <div className="flex flex-col items-stretch rounded-xl bg-card shadow-[0_4px_14px_rgba(0,0,0,0.13)]">
          <div className="flex items-center px-3 py-2.5">
            <i className="fas fa-search mr-1 text-primary" />
            <input
              className="flex-1 border-0 bg-transparent px-2.5 py-1.5 text-[0.9rem] text-ink outline-none"
              placeholder="Search barangay or hazard type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-primary text-white"
              onClick={() => setFilterOpen(true)}
              aria-label="Filters"
            >
              <i className="fas fa-sliders-h text-[0.9rem]" />
            </button>
          </div>
        </div>
      </div>

      <HazardMap reports={filtered} onMarkerClick={onOpenReport} showControls flyTo={flyTo} className="flex-1" />

      <div className="absolute bottom-3 left-2.5 right-2.5 z-[999] rounded-[14px] bg-white/95 p-3.5 px-4 shadow-[0_4px_16px_rgba(0,0,0,0.15)]">
        <div className="mb-2.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">
          Infrastructure Overview — Olongapo City
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Stat num={stats.total} label="Total" />
          <Stat num={stats.pending} label="Pending" className="text-secondary" />
          <Stat num={stats.verified} label="Verified" />
          <Stat num={stats.resolved} label="Resolved" className="text-success" />
        </div>
      </div>

      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Data Filtering"
        footer={
          <button className="btn-primary w-full" onClick={() => setFilterOpen(false)}>
            <i className="fas fa-check" /> Apply Filters
          </button>
        }
      >
        <div className="px-[18px] pb-5">
          <div className="mb-1.5 mt-3 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">
            Hazard Type
          </div>
          <div className="flex flex-wrap gap-1.5">
            {HAZARD_CATEGORIES.map((c) => (
              <button key={c} className={cn('chip', cats.includes(c) && 'chip-active')} onClick={() => toggle(cats, setCats, c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="mb-1.5 mt-5 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Status</div>
          <div className="flex flex-wrap gap-1.5">
            {REPORT_STATUSES.map((s) => (
              <button key={s} className={cn('chip', statuses.includes(s) && 'chip-active')} onClick={() => toggle(statuses, setStatuses, s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="mb-1.5 mt-5 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">Sort By</div>
          <div className="flex flex-wrap gap-1.5">
            {['newest', 'severity', 'upvotes'].map((s) => (
              <button key={s} className={cn('chip', sort === s && 'chip-active')} onClick={() => setSort(s)}>
                {s === 'newest' ? 'Newest First' : s === 'severity' ? 'Critical First' : 'Most Upvotes'}
              </button>
            ))}
          </div>
          <button
            className="mt-5 cursor-pointer border-0 bg-none text-[0.8rem] font-bold text-primary"
            onClick={() => {
              setCats([])
              setStatuses([])
            }}
          >
            Clear all
          </button>
        </div>
      </BottomSheet>

      {loading && (
        <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-white/60">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary" />
        </div>
      )}
    </div>
  )
}

function Stat({ num, label, className = 'text-primary' }) {
  return (
    <div className="text-center">
      <div className={cn('text-[1.3rem] font-extrabold', className)}>{num}</div>
      <div className="text-[0.62rem] font-bold uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  )
}
