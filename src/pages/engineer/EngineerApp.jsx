import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/AppShell'
import BottomSheet from '../../components/BottomSheet'
import ReportDetail from '../../components/ReportDetail'
import MessagesView from '../../components/MessagesView'
import { useToast } from '../../components/Toast'
import { fetchReports, subscribeReports, updateReport } from '../../lib/api'
import { STAGES, getStageIndex } from '../../lib/constants'
import EngineerDashboard from './EngineerDashboard'

export default function EngineerApp() {
  const toast = useToast()
  const [tab, setTab] = useState('dashboard')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [team, setTeam] = useState('')
  const [workDescription, setWorkDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const rows = await fetchReports()
      setReports(rows)
    } catch (e) {
      console.warn('[engineer] load', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeReports(load)
    return unsub
  }, [load])

  const openDetail = (report) => {
    setDetail(report)
    setTeam(report.assignedTeam || '')
    setWorkDescription(report.workDescription || '')
  }

  const saveProgress = async (nextStage) => {
    if (!detail || busy) return
    setBusy(true)
    try {
      const payload = {
        assignedTeam: team || null,
        workDescription,
        repairStage: nextStage ?? detail.repairStage ?? STAGES[0]?.key
      }
      if (nextStage === 'resolved') {
        payload.status = 'Resolved'
        payload.resolvedAt = new Date().toISOString()
        payload.repairStage = 'resolved'
      } else if (detail.status !== 'In Progress' && detail.status !== 'Resolved') {
        payload.status = 'In Progress'
      }
      await updateReport(detail.id, payload)
      await load()
      setDetail(null)
      toast('Progress updated.', 'success')
    } catch (e) {
      toast(e.message || 'Could not update progress.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large', active: tab === 'dashboard', onClick: () => setTab('dashboard') },
    { key: 'messages', label: 'Messages', icon: 'fas fa-comments', active: tab === 'messages', onClick: () => setTab('messages') }
  ]

  const pending = useMemo(() => reports.filter((r) => r.status !== 'Resolved').length, [reports])

  const sidebarItems = [
    { icon: 'fas fa-th-large', label: 'Response Dashboard', sub: `${pending} active hazards`, onClick: () => setTab('dashboard'), badge: pending || null },
    { icon: 'fas fa-comments', label: 'Messages', sub: 'Chat with barangays', onClick: () => setTab('messages') }
  ]

  return (
    <AppShell
      roleLabel="City Engineer"
      logoSubtitle="City Engineering Office"
      navItems={navItems}
      sidebarItems={sidebarItems}
    >
      {tab === 'dashboard' && <EngineerDashboard reports={reports} onOpen={openDetail} />}
      {tab === 'messages' && <MessagesView role="engineer" />}

      <BottomSheet open={Boolean(detail)} onClose={() => setDetail(null)} title="Repair Task">
        {detail && (
          <ReportDetail
            report={reports.find((r) => r.id === detail.id) || detail}
            footer={null}
          >
            <div className="mb-4 space-y-3">
              <div>
                <label className="input-label">Assigned Team</label>
                <input className="input-field" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Crew Alpha" />
              </div>
              <div>
                <label className="input-label">Work Notes</label>
                <textarea className="input-field resize-none" rows={3} value={workDescription} onChange={(e) => setWorkDescription(e.target.value)} placeholder="Describe work done…" />
              </div>
              <div className="flex flex-wrap gap-2">
                {STAGES.filter((s) => s.key !== 'resolved').map((s, idx) => (
                  <button key={s.key} className="btn-outline btn-sm" disabled={busy} onClick={() => saveProgress(s.key)}>
                    Set: {s.label}
                  </button>
                ))}
              </div>
              <button className="btn-success w-full" disabled={busy} onClick={() => saveProgress('resolved')}>
                <i className="fas fa-check-circle" /> Mark Resolved
              </button>
            </div>
          </ReportDetail>
        )}
      </BottomSheet>

      {loading && (
        <div className="pointer-events-none fixed inset-0 z-[5000] flex items-center justify-center bg-white/40">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary" />
        </div>
      )}
    </AppShell>
  )
}
