import { useMemo } from 'react'
import { SectionTitle, StatCard, StatusPill } from '../../components/ui'
import { timeAgo } from '../../lib/utils'

function MiniBar({ label, value, max, tone = 'bg-primary' }) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2 text-[0.76rem] font-bold text-ink">
        <span className="truncate">{label}</span>
        <span className="flex-shrink-0 text-muted">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminOverview({ reports, profiles, requests, onGoTo }) {
  const stats = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter((r) => r.status === 'Pending').length,
      verified: reports.filter((r) => r.status === 'Verified').length,
      progress: reports.filter((r) => r.status === 'In Progress').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length
    }),
    [reports]
  )

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests])

  const byBarangay = useMemo(() => {
    const counts = new Map()
    reports.forEach((r) => {
      if (!r.barangay) return
      counts.set(r.barangay, (counts.get(r.barangay) || 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [reports])

  const maxBarangay = byBarangay[0]?.[1] || 0

  const recent = useMemo(
    () =>
      [...reports]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5),
    [reports]
  )

  const team = useMemo(() => {
    const counts = { citizen: 0, barangay: 0, engineer: 0, admin: 0, pending: 0 }
    profiles.forEach((p) => {
      if (counts[p.role] === undefined) counts.pending += 1
      else counts[p.role] += 1
    })
    return counts
  }, [profiles])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-7 pt-[18px]">
        <div className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.7px] text-primary">
          Administrator
        </div>
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">System Overview</h1>

        {pendingRequests > 0 && (
          <button
            className="mb-4 flex w-full cursor-pointer items-center gap-3 rounded-[14px] bg-primary-dark p-4 text-left text-white"
            onClick={() => onGoTo('requests')}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/15">
              <i className="fas fa-file-signature" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.7rem] font-extrabold uppercase tracking-wide opacity-75">
                Action needed
              </div>
              <div className="text-[0.92rem] font-extrabold">
                {pendingRequests} official {pendingRequests === 1 ? 'request' : 'requests'} awaiting review
              </div>
            </div>
            <i className="fas fa-chevron-right text-[0.8rem] opacity-70" />
          </button>
        )}

        <div className="stat-grid">
          <StatCard icon={<i className="fas fa-clipboard-list" />} label="Total Reports" value={stats.total} />
          <StatCard
            icon={<i className="fas fa-hourglass-half" />}
            iconClass="text-warning"
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={<i className="fas fa-shield-alt" />}
            iconClass="text-secondary"
            label="Verified"
            value={stats.verified}
          />
          <StatCard
            icon={<i className="fas fa-check-circle" />}
            iconClass="text-success"
            label="Resolved"
            value={stats.resolved}
          />
        </div>

        <SectionTitle>Reports by Barangay</SectionTitle>
        <div className="mb-5 rounded-[14px] bg-card p-4 shadow-card">
          {byBarangay.length === 0 ? (
            <p className="text-center text-[0.8rem] text-gray-400">No reports with a barangay yet.</p>
          ) : (
            byBarangay.map(([name, value]) => (
              <MiniBar key={name} label={name} value={value} max={maxBarangay} />
            ))
          )}
        </div>

        <SectionTitle>Recent Reports</SectionTitle>
        <div className="mb-5 overflow-hidden rounded-[14px] bg-card shadow-card">
          {recent.length === 0 && (
            <p className="p-4 text-center text-[0.8rem] text-gray-400">No reports yet.</p>
          )}
          {recent.map((r, idx) => (
            <div
              key={r.id}
              className={`flex items-center gap-3 px-4 py-3 ${idx ? 'border-t border-line' : ''}`}
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.85rem] font-extrabold text-ink">{r.category}</div>
                <div className="truncate text-[0.72rem] font-semibold text-muted">
                  {r.barangay || 'Unassigned'} · {timeAgo(r.createdAt)}
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>
          ))}
        </div>

        <SectionTitle>Registered Accounts</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { key: 'citizen', label: 'Citizens', icon: 'fa-user', tone: 'text-primary' },
            { key: 'barangay', label: 'Barangay', icon: 'fa-shield-alt', tone: 'text-warning' },
            { key: 'engineer', label: 'Engineers', icon: 'fa-hard-hat', tone: 'text-info' },
            { key: 'admin', label: 'Admins', icon: 'fa-user-shield', tone: 'text-danger' }
          ].map((item) => (
            <div key={item.key} className="rounded-xl bg-card p-4 shadow-card">
              <i className={`fas ${item.icon} mb-1.5 text-[1.2rem] ${item.tone}`} />
              <div className="text-[0.66rem] font-bold uppercase tracking-wide text-muted">{item.label}</div>
              <div className="text-[1.6rem] font-extrabold text-ink">{team[item.key]}</div>
            </div>
          ))}
        </div>
        {team.pending > 0 && (
          <p className="mt-2 text-center text-[0.72rem] font-semibold text-muted">
            {team.pending} account{team.pending === 1 ? '' : 's'} still pending official verification.
          </p>
        )}
      </div>
    </div>
  )
}
