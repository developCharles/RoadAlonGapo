import { useMemo, useState } from 'react'
import HazardMap from '../../components/HazardMap'
import BottomSheet from '../../components/BottomSheet'
import { Badge } from '../../components/ui'
import { HAZARD_CATEGORIES, REPORT_STATUSES, computeSeverity, SEVERITY_META } from '../../lib/constants'
import { cn, timeAgo } from '../../lib/utils'

const SORTS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'severity', label: 'Critical First' },
  { key: 'upvotes', label: 'Most Upvotes' }
]

export default function CitizenMap({ reports, loading, onOpenReport, onNewReport }) {
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
          (r.description || '').toLowerCase().includes(q)
      )
    }
    if (cats.length) list = filterByCategory(list, cats)
    if (statuses.length) list = list.filter((r) => statuses.includes(r.status))
    const sevRank = { critical: 0, high: 1, moderate: 2, low: 3 }
    list.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sort === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0)
      if (sort === 'severity') return sevRank[computeSeverity(a)] - sevRank[computeSeverity(b)]
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

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return reports
      .filter(
        (r) =>
          (r.category || '').toLowerCase().includes(q) || (r.location || '').toLowerCase().includes(q)
      )
      .slice(0, 6)
  }, [search, reports])

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Search bar */}
      <div className="absolute left-3.5 right-3.5 top-3 z-[1000]">
        <div className="flex flex-col items-stretch rounded-xl bg-card shadow-[0_4px_14px_rgba(0,0,0,0.13)]">
          <div className="flex items-center px-3 py-2.5">
            <i className="fas fa-search mr-1 text-primary" />
            <input
              className="flex-1 border-0 bg-transparent px-2.5 py-1.5 text-[0.9rem] text-ink outline-none"
              placeholder="Search hazard type or location…"
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
          {searchResults.length > 0 && (
            <div className="max-h-[220px] overflow-y-auto rounded-b-xl bg-white shadow-lg">
              {searchResults.map((r) => (
                <div
                  key={r.id}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-gray-50 px-4 py-3 hover:bg-primary/5"
                  onClick={() => {
                    setFlyTo({ lat: Number(r.lat), lng: Number(r.lng), zoom: 16 })
                    setSearch('')
                  }}
                >
                  <i className="fas fa-map-marker-alt w-4 text-primary" />
                  <div className="min-w-0">
                    <div className="truncate text-[0.86rem] text-ink">{r.category}</div>
                    <div className="truncate text-[0.72rem] text-muted">{r.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HazardMap
        reports={filtered}
        onMarkerClick={onOpenReport}
        showControls
        flyTo={flyTo}
        className="flex-1"
      />

      <button
        className="absolute bottom-[104px] right-3.5 z-[1100] flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[0.9rem] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
        onClick={onNewReport}
      >
        <i className="fas fa-plus" /> REPORT
      </button>

      {/* Stats panel */}
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
              <button
                key={c}
                className={cn('chip', cats.includes(c) && 'chip-active')}
                onClick={() => toggle(cats, setCats, c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mb-1.5 mt-5 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">
            Status
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REPORT_STATUSES.map((s) => (
              <button
                key={s}
                className={cn('chip', statuses.includes(s) && 'chip-active')}
                onClick={() => toggle(statuses, setStatuses, s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mb-1.5 mt-5 text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">
            Sort By
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                className={cn('chip', sort === s.key && 'chip-active')}
                onClick={() => setSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            className="mt-5 cursor-pointer border-0 bg-none text-[0.8rem] font-bold text-primary"
            onClick={() => {
              setCats([])
              setStatuses([])
              setSort('newest')
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

function filterByCategory(list, cats) {
  return list.filter((r) => {
    const c = (r.category || '').toLowerCase()
    return cats.some((selected) => c.includes(selected.toLowerCase()))
  })
}
