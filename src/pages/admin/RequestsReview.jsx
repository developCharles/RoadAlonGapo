import { useMemo, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import { Badge, EmptyState, LoadingBlock } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { reviewOfficialRequest, updateProfile, writeLog } from '../../lib/api'
import { demoEnabled } from '../../lib/demo'
import { cn, formatDate, timeAgo } from '../../lib/utils'

const FILTERS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' }
]

const STATUS_TONE = { pending: 'orange', approved: 'green', rejected: 'gray' }

function DetailRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <i className={`fas ${icon} mt-0.5 w-3.5 flex-shrink-0 text-[0.78rem] text-gray-400`} />
      <div className="min-w-0">
        <div className="text-[0.66rem] font-extrabold uppercase tracking-wide text-gray-400">{label}</div>
        <div className="break-words text-[0.85rem] font-semibold text-ink">{value}</div>
      </div>
    </div>
  )
}

export default function RequestsReview({ requests, profiles, reviewerId, onRefresh, loading }) {
  const toast = useToast()
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      all: requests.length
    }),
    [requests]
  )

  const list = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  )

  const open = (request) => {
    setSelected(request)
    setNotes(request.notes || '')
  }

  const decide = async (decision) => {
    if (!selected || busy) return
    setBusy(true)
    try {
      const profile = profiles.find((p) => p.id === selected.uid)
      if (decision === 'approved') {
        if (!profile && !demoEnabled()) {
          throw new Error(
            'This applicant has no profile row yet. Ask them to sign in once, then approve again.'
          )
        }
        await updateProfile(selected.uid, {
          name: selected.name,
          email: selected.email,
          role: 'barangay',
          status: 'active',
          barangay: selected.barangay,
          position: selected.position,
          contact: selected.contact,
          passwordChanged: false
        })
      } else if (profile) {
        await updateProfile(selected.uid, { role: 'rejected', status: 'inactive' })
      }

      await reviewOfficialRequest(selected.id, decision, reviewerId, notes.trim() || null)
      await writeLog(
        decision === 'approved' ? 'success' : 'warn',
        `${decision === 'approved' ? 'Approved' : 'Rejected'} official access for ${selected.name} (${selected.barangay}).`,
        { requestId: selected.id, email: selected.email }
      )

      toast(
        decision === 'approved'
          ? `${selected.name} is now a barangay official.`
          : `Access request from ${selected.name} rejected.`,
        decision === 'approved' ? 'success' : 'info'
      )
      setSelected(null)
      await onRefresh()
    } catch (e) {
      toast(e.message || 'Could not update this request.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-7 pt-[18px]">
        <div className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.7px] text-primary">
          Administrator
        </div>
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">Official Requests</h1>

        <div className="mb-4 rounded-[14px] bg-primary-dark p-5 text-white">
          <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-wide opacity-75">
            Awaiting decision
          </div>
          <div className="mb-1 text-[3rem] font-black leading-none">{counts.pending}</div>
          <div className="text-[0.85rem] opacity-85">
            Barangay officials who applied for verification access
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={cn('chip', filter === f.key && 'chip-active')}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {loading && requests.length === 0 ? (
          <LoadingBlock label="Loading requests…" />
        ) : list.length === 0 ? (
          <EmptyState
            icon="fa-file-signature"
            title="Nothing here"
            sub={filter === 'pending' ? 'No official requests are waiting for review.' : 'No requests match this filter.'}
          />
        ) : (
          list.map((r) => (
            <button
              key={r.id}
              className="mb-2.5 flex w-full cursor-pointer items-start gap-3 rounded-xl bg-card p-3.5 text-left shadow-card"
              onClick={() => open(r)}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-info-bg text-info">
                <i className="fas fa-id-card" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[0.88rem] font-extrabold text-ink">{r.name}</span>
                  <Badge tone={STATUS_TONE[r.status] || 'gray'}>{r.status}</Badge>
                </div>
                <div className="truncate text-[0.75rem] font-semibold text-muted">
                  {r.position} · {r.barangay}
                </div>
                <div className="truncate text-[0.72rem] text-gray-400">
                  {r.email} · {timeAgo(r.createdAt)}
                </div>
              </div>
              <i className="fas fa-chevron-right mt-1 text-[0.75rem] text-gray-300" />
            </button>
          ))
        )}
      </div>

      <BottomSheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.status === 'pending' ? 'Review Request' : 'Request Details'}
        footer={
          selected?.status === 'pending' ? (
            <>
              <button className="btn-danger flex-1" onClick={() => decide('rejected')} disabled={busy}>
                <i className="fas fa-times" /> Reject
              </button>
              <button className="btn-success flex-1" onClick={() => decide('approved')} disabled={busy}>
                <i className="fas fa-check" /> {busy ? 'Saving…' : 'Approve'}
              </button>
            </>
          ) : (
            <button className="btn-primary flex-1" onClick={() => setSelected(null)}>
              Close
            </button>
          )
        }
      >
        {selected && (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-info-bg text-[1.2rem] text-info">
                <i className="fas fa-id-card" />
              </div>
              <div className="min-w-0">
                <div className="text-[1rem] font-extrabold text-ink">{selected.name}</div>
                <Badge tone={STATUS_TONE[selected.status] || 'gray'}>{selected.status}</Badge>
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-line bg-gray-50 px-3.5 py-2">
              <DetailRow icon="fa-user-tie" label="Position" value={selected.position} />
              <DetailRow icon="fa-map-marker-alt" label="Barangay" value={selected.barangay} />
              <DetailRow icon="fa-envelope" label="Email" value={selected.email} />
              <DetailRow icon="fa-phone" label="Contact" value={selected.contact} />
              <DetailRow icon="fa-calendar" label="Submitted" value={formatDate(selected.createdAt)} />
              {selected.reviewedAt && (
                <DetailRow icon="fa-clipboard-check" label="Reviewed" value={formatDate(selected.reviewedAt)} />
              )}
            </div>

            <div className="mb-4">
              <div className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">
                Supporting Documents
              </div>
              {(selected.documents || []).length === 0 ? (
                <p className="text-[0.78rem] text-gray-400">No documents attached.</p>
              ) : (
                (selected.documents || []).map((doc, idx) => (
                  <div
                    key={`${doc.name}-${idx}`}
                    className="mb-1.5 flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2"
                  >
                    <i className="fas fa-file-alt text-[0.85rem] text-primary" />
                    <span className="min-w-0 flex-1 truncate text-[0.8rem] font-semibold text-ink">
                      {doc.name}
                    </span>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.72rem] font-extrabold text-primary"
                      >
                        Open
                      </a>
                    ) : (
                      <span className="text-[0.68rem] font-bold text-gray-300">demo</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="mb-2">
                <label className="input-label">Review note (optional)</label>
                <textarea
                  className="input-field resize-none bg-gray-50 focus:bg-white"
                  rows={2}
                  placeholder="Reason or remarks for this decision…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}

            {selected.status === 'pending' && (
              <div className="rounded-[10px] border border-yellow-200 bg-[#fff8e1] px-3 py-2.5 text-[0.72rem] font-semibold leading-relaxed text-warning">
                <i className="fas fa-circle-info mr-1" />
                Approving grants barangay access and forces a password change on first login.
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
