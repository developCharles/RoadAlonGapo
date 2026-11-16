import { useMemo, useState } from 'react'
import BottomSheet from '../../components/BottomSheet'
import { Avatar, Badge, EmptyState, LoadingBlock, Toggle } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { updateProfile, writeLog } from '../../lib/api'
import { BARANGAYS, POSITIONS } from '../../lib/constants'
import { cn, formatDate } from '../../lib/utils'

const ROLE_META = {
  citizen: { label: 'Citizen', tone: 'gray' },
  barangay: { label: 'Barangay', tone: 'blue' },
  engineer: { label: 'Engineer', tone: 'orange' },
  admin: { label: 'Admin', tone: 'red' },
  pending: { label: 'Pending', tone: 'orange' },
  rejected: { label: 'Rejected', tone: 'gray' }
}

const EDITABLE_ROLES = ['citizen', 'barangay', 'engineer', 'admin']

export default function UserManagement({ profiles, currentUserId, onRefresh, loading }) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState({ role: 'citizen', status: 'active', barangay: '', position: '' })
  const [busy, setBusy] = useState(false)

  const isSelf = selected?.id === currentUserId

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return profiles.filter((p) => {
      if (roleFilter !== 'all') {
        if (roleFilter === 'pending') {
          if (p.role !== 'pending' && p.role !== 'rejected') return false
        } else if (p.role !== roleFilter) {
          return false
        }
      }
      if (!q) return true
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.barangay || '').toLowerCase().includes(q)
      )
    })
  }, [profiles, query, roleFilter])

  const open = (profile) => {
    setSelected(profile)
    setDraft({
      role: EDITABLE_ROLES.includes(profile.role) ? profile.role : 'citizen',
      status: profile.status === 'inactive' ? 'inactive' : 'active',
      barangay: profile.barangay || '',
      position: profile.position || ''
    })
  }

  const save = async () => {
    if (!selected || busy || isSelf) return
    setBusy(true)
    try {
      const patch = { role: draft.role, status: draft.status }
      if (draft.role === 'barangay') {
        patch.barangay = draft.barangay || null
        patch.position = draft.position || null
      }
      await updateProfile(selected.id, patch)
      await writeLog('info', `Updated account ${selected.email}: role=${draft.role}, status=${draft.status}.`, {
        userId: selected.id
      })
      toast(`${selected.name || selected.email} updated.`, 'success')
      setSelected(null)
      await onRefresh()
    } catch (e) {
      toast(e.message || 'Could not update this account.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async (profile) => {
    if (busy || profile.id === currentUserId) return
    const nextStatus = profile.status === 'inactive' ? 'active' : 'inactive'
    setBusy(true)
    try {
      await updateProfile(profile.id, { status: nextStatus })
      await writeLog('warn', `${nextStatus === 'inactive' ? 'Deactivated' : 'Reactivated'} ${profile.email}.`, {
        userId: profile.id
      })
      toast(`${profile.name || profile.email} ${nextStatus === 'inactive' ? 'deactivated' : 'reactivated'}.`, 'success')
      await onRefresh()
    } catch (e) {
      toast(e.message || 'Could not update status.', 'error')
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
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">User Management</h1>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-300 bg-card px-3 py-2.5">
          <i className="fas fa-search text-[0.85rem] text-gray-400" />
          <input
            className="flex-1 border-0 bg-transparent text-[0.88rem] text-ink outline-none"
            placeholder="Search name, email or barangay…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="border-0 bg-none text-gray-400"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times-circle" />
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {['all', 'citizen', 'barangay', 'engineer', 'admin', 'pending'].map((key) => (
            <button
              key={key}
              className={cn('chip', roleFilter === key && 'chip-active')}
              onClick={() => setRoleFilter(key)}
            >
              {key === 'pending' ? 'Pending' : key === 'all' ? 'All' : ROLE_META[key].label}
            </button>
          ))}
        </div>

        <div className="mb-2.5 text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-400">
          {filtered.length} account{filtered.length === 1 ? '' : 's'}
        </div>

        {loading && profiles.length === 0 ? (
          <LoadingBlock label="Loading accounts…" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="fa-users" title="No accounts found" sub="Try a different search or filter." />
        ) : (
          filtered.map((p) => {
            const meta = ROLE_META[p.role] || ROLE_META.citizen
            const inactive = p.status === 'inactive'
            return (
              <div key={p.id} className="mb-2.5 flex items-center gap-3 rounded-xl bg-card p-3.5 shadow-card">
                <Avatar name={p.name || p.email} />
                <button className="min-w-0 flex-1 cursor-pointer border-0 bg-none text-left" onClick={() => open(p)}>
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[0.86rem] font-extrabold text-ink">
                      {p.name || 'Unnamed user'}
                    </span>
                    {p.id === currentUserId && <Badge tone="blue">You</Badge>}
                  </div>
                  <div className="truncate text-[0.72rem] text-gray-400">{p.email}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <Badge tone={inactive ? 'gray' : 'green'}>{inactive ? 'Inactive' : 'Active'}</Badge>
                    {p.barangay && (
                      <span className="truncate text-[0.7rem] font-semibold text-muted">{p.barangay}</span>
                    )}
                  </div>
                </button>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary/10 text-primary"
                    onClick={() => open(p)}
                    aria-label={`Manage ${p.name || p.email}`}
                  >
                    <i className="fas fa-pen text-[0.75rem]" />
                  </button>
                  <button
                    className={cn(
                      'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg',
                      inactive ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger',
                      p.id === currentUserId && 'cursor-not-allowed opacity-40'
                    )}
                    onClick={() => toggleStatus(p)}
                    disabled={busy || p.id === currentUserId}
                    aria-label={inactive ? 'Reactivate account' : 'Deactivate account'}
                  >
                    <i className={cn('fas text-[0.75rem]', inactive ? 'fa-rotate-left' : 'fa-user-slash')} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <BottomSheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Manage Account"
        footer={
          <button className="btn-primary flex-1" onClick={save} disabled={busy || isSelf}>
            <i className="fas fa-save" /> {busy ? 'Saving…' : isSelf ? 'Cannot edit your own access' : 'Save Changes'}
          </button>
        }
      >
        {selected && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Avatar name={selected.name || selected.email} className="h-12 w-12 text-[1rem]" />
              <div className="min-w-0">
                <div className="truncate text-[1rem] font-extrabold text-ink">
                  {selected.name || 'Unnamed user'}
                </div>
                <div className="truncate text-[0.75rem] text-gray-400">{selected.email}</div>
                <div className="text-[0.7rem] font-semibold text-gray-400">
                  Joined {formatDate(selected.createdAt)}
                </div>
              </div>
            </div>

            {isSelf && (
              <div className="mb-3 rounded-[10px] border border-yellow-200 bg-[#fff8e1] px-3 py-2.5 text-[0.72rem] font-semibold leading-relaxed text-warning">
                <i className="fas fa-lock mr-1" />
                You cannot change your own role or deactivate your own account.
              </div>
            )}

            <div className="mb-4">
              <div className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">Role</div>
              <div className="flex flex-wrap gap-1.5">
                {EDITABLE_ROLES.map((role) => (
                  <button
                    key={role}
                    className={cn('chip', draft.role === role && 'chip-active')}
                    onClick={() => !isSelf && setDraft((d) => ({ ...d, role }))}
                    disabled={isSelf}
                  >
                    {ROLE_META[role].label}
                  </button>
                ))}
              </div>
              {!EDITABLE_ROLES.includes(selected.role) && (
                <p className="mt-2 text-[0.72rem] font-semibold text-muted">
                  Current status “{selected.role}” — pick a role above to override.
                </p>
              )}
            </div>

            {draft.role === 'barangay' && (
              <>
                <div className="mb-3">
                  <label className="input-label">Barangay</label>
                  <select
                    className="input-field"
                    value={draft.barangay}
                    onChange={(e) => setDraft((d) => ({ ...d, barangay: e.target.value }))}
                    disabled={isSelf}
                  >
                    <option value="">Select barangay…</option>
                    {BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="input-label">Position</label>
                  <select
                    className="input-field"
                    value={draft.position}
                    onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
                    disabled={isSelf}
                  >
                    <option value="">Select position…</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="mb-2 flex items-center justify-between rounded-xl border border-line bg-gray-50 px-3.5 py-3">
              <div>
                <div className="text-[0.82rem] font-extrabold text-ink">Account active</div>
                <div className="text-[0.72rem] text-muted">Inactive accounts cannot sign in.</div>
              </div>
              <Toggle
                on={draft.status === 'active'}
                onChange={(next) => !isSelf && setDraft((d) => ({ ...d, status: next ? 'active' : 'inactive' }))}
              />
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
