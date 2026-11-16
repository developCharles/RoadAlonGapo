import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge, EmptyState, LoadingBlock, SectionTitle } from '../../components/ui'
import { useToast } from '../../components/Toast'
import { clearLogs, fetchBackups, fetchLogs, saveBackup, writeLog } from '../../lib/api'
import { formatDateTime, timeAgo } from '../../lib/utils'

const LEVEL_TONE = { info: 'blue', success: 'green', warn: 'orange', error: 'red' }
const LEVEL_ICON = {
  info: 'fa-circle-info',
  success: 'fa-check-circle',
  warn: 'fa-triangle-exclamation',
  error: 'fa-circle-exclamation'
}

export default function SystemTools({ reports, profiles, requests }) {
  const toast = useToast()
  const [logs, setLogs] = useState([])
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const load = useCallback(async () => {
    try {
      const [logRows, backupRows] = await Promise.all([fetchLogs(), fetchBackups()])
      setLogs(logRows)
      setBackups(backupRows)
    } catch (e) {
      console.warn('[admin] system load', e)
      toast(e.message || 'Could not load system records.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const storageEstimate = useMemo(() => {
    const json = JSON.stringify({ reports, profiles, requests })
    return `${Math.max(1, Math.round(json.length / 1024))} KB`
  }, [reports, profiles, requests])

  const createBackup = async () => {
    if (busy) return
    setBusy(true)
    try {
      await saveBackup({
        generatedAt: new Date().toISOString(),
        counts: { reports: reports.length, profiles: profiles.length, requests: requests.length },
        reports,
        profiles,
        requests
      })
      await writeLog(
        'success',
        `Manual backup created (${reports.length} reports, ${profiles.length} accounts, ${requests.length} requests).`
      )
      toast('Backup created.', 'success')
      await load()
    } catch (e) {
      toast(e.message || 'Could not create a backup.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const doClearLogs = async () => {
    if (busy) return
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    setBusy(true)
    try {
      await clearLogs()
      setLogs([])
      setConfirmClear(false)
      toast('Activity log cleared.', 'success')
    } catch (e) {
      toast(e.message || 'Could not clear the log.', 'error')
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
        <h1 className="mb-4 text-[1.7rem] font-extrabold text-ink">System & Data</h1>

        <div className="mb-4 rounded-[14px] bg-primary-dark p-5 text-white">
          <div className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-wide opacity-75">
            Current dataset
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[1.6rem] font-black leading-none">{reports.length}</div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide opacity-75">Reports</div>
            </div>
            <div>
              <div className="text-[1.6rem] font-black leading-none">{profiles.length}</div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide opacity-75">Accounts</div>
            </div>
            <div>
              <div className="text-[1.6rem] font-black leading-none">{requests.length}</div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wide opacity-75">Requests</div>
            </div>
          </div>
          <button
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-white/20 px-3.5 py-2 text-[0.78rem] font-extrabold tracking-wide text-white disabled:opacity-50"
            onClick={createBackup}
            disabled={busy}
          >
            <i className="fas fa-database" /> {busy ? 'Working…' : `Create backup (~${storageEstimate})`}
          </button>
        </div>

        <SectionTitle
          action={
            <button className="section-title-btn" onClick={load}>
              <i className="fas fa-rotate" /> Refresh
            </button>
          }
        >
          Backups
        </SectionTitle>
        <div className="mb-5 overflow-hidden rounded-[14px] bg-card shadow-card">
          {loading ? (
            <LoadingBlock label="Loading backups…" />
          ) : backups.length === 0 ? (
            <EmptyState icon="fa-database" title="No backups yet" sub="Create one to snapshot the current dataset." />
          ) : (
            backups.map((b, idx) => (
              <div key={b.id || idx} className={`flex items-center gap-3 px-4 py-3 ${idx ? 'border-t border-line' : ''}`}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-info-bg text-info">
                  <i className="fas fa-database text-[0.85rem]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.82rem] font-extrabold text-ink">
                    {formatDateTime(b.createdAt)}
                  </div>
                  <div className="text-[0.72rem] font-semibold text-muted">
                    {b.snapshot?.counts
                      ? `${b.snapshot.counts.reports} reports · ${b.snapshot.counts.profiles} accounts · ${b.snapshot.counts.requests} requests`
                      : 'Snapshot stored'}
                  </div>
                </div>
                <i className="fas fa-check-circle text-[0.85rem] text-success" />
              </div>
            ))
          )}
        </div>

        <SectionTitle
          action={
            <button
              className={`section-title-btn ${confirmClear ? 'text-danger' : ''}`}
              onClick={doClearLogs}
              disabled={busy}
            >
              <i className="fas fa-trash" /> {confirmClear ? 'Tap again to confirm' : 'Clear log'}
            </button>
          }
        >
          Activity Log
        </SectionTitle>
        <div className="overflow-hidden rounded-[14px] bg-card shadow-card">
          {loading ? (
            <LoadingBlock label="Loading activity…" />
          ) : logs.length === 0 ? (
            <EmptyState icon="fa-clipboard-list" title="No activity recorded" sub="Admin actions will appear here." />
          ) : (
            logs.map((log, idx) => (
              <div key={log.id || idx} className={`flex items-start gap-3 px-4 py-3 ${idx ? 'border-t border-line' : ''}`}>
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    LEVEL_TONE[log.level] === 'green'
                      ? 'bg-success-bg text-success'
                      : LEVEL_TONE[log.level] === 'orange'
                        ? 'bg-warning-bg text-warning'
                        : LEVEL_TONE[log.level] === 'red'
                          ? 'bg-danger-bg text-danger'
                          : 'bg-info-bg text-info'
                  }`}
                >
                  <i className={`fas ${LEVEL_ICON[log.level] || LEVEL_ICON.info} text-[0.75rem]`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.82rem] font-semibold leading-snug text-ink">{log.message}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge tone={LEVEL_TONE[log.level] || 'blue'}>{log.level}</Badge>
                    <span className="text-[0.7rem] text-gray-400">{timeAgo(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
