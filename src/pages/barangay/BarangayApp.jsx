import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/AppShell'
import BottomSheet from '../../components/BottomSheet'
import ReportDetail from '../../components/ReportDetail'
import MessagesView from '../../components/MessagesView'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { fetchReports, subscribeReports, updateReport, insertMessage } from '../../lib/api'
import BarangayMap from './BarangayMap'
import DeskView from './DeskView'
import BarangayProfile from './BarangayProfile'

export default function BarangayApp() {
  const { profile } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('map')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const rows = await fetchReports()
      setReports(rows)
    } catch (e) {
      console.warn('[barangay] load', e)
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
    setRemarks(report.barangayRemarks || '')
  }

  const act = async (patch, message) => {
    if (!detail || busy) return
    setBusy(true)
    try {
      await updateReport(detail.id, patch)
      await load()
      setDetail(null)
      toast(message, 'success')
    } catch (e) {
      toast(e.message || 'Action failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const verify = () =>
    act(
      { status: 'Verified', verifiedAt: new Date().toISOString(), barangayRemarks: remarks },
      'Report verified and sent to City Engineering.'
    )

  const reject = () =>
    act(
      { status: 'Rejected', rejectedAt: new Date().toISOString(), barangayRemarks: remarks },
      'Report rejected.'
    )

  const escalate = async () => {
    if (!detail || busy) return
    setBusy(true)
    try {
      await insertMessage({
        barangay: profile.barangay,
        senderId: profile.id,
        senderName: profile.name,
        senderRole: 'barangay',
        text: `Escalation: "${detail.category}" at ${detail.location || 'reported location'} needs City Engineering attention.`,
        readByEngineer: false,
        readByBarangay: true
      })
      toast('Escalated to City Engineering.', 'success')
    } catch (e) {
      toast(e.message || 'Could not escalate.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const navItems = [
    { key: 'map', label: 'Map', icon: 'fas fa-map', active: tab === 'map', onClick: () => setTab('map') },
    { key: 'desk', label: 'Desk', icon: 'fas fa-clipboard-check', active: tab === 'desk', onClick: () => setTab('desk') },
    { key: 'messages', label: 'Messages', icon: 'fas fa-comments', active: tab === 'messages', onClick: () => setTab('messages') },
    { key: 'profile', label: 'Profile', icon: 'fas fa-user', active: tab === 'profile', onClick: () => setTab('profile') }
  ]

  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'Pending').length, [reports])

  const sidebarItems = [
    { icon: 'fas fa-clipboard-check', label: 'Verification Desk', sub: `${pendingCount} awaiting review`, onClick: () => setTab('desk'), badge: pendingCount || null },
    { icon: 'fas fa-comments', label: 'Escalation Log', sub: 'Messages to City Engineering', onClick: () => setTab('messages'), dividerAfter: true },
    { icon: 'fas fa-book', label: 'Verification Guidelines', sub: 'Protocols & procedures', onClick: () => toast('Guidelines coming soon.') },
    { icon: 'fas fa-question-circle', label: 'Help & Support', sub: 'FAQ and contact info', onClick: () => toast('Support center coming soon.') }
  ]

  return (
    <AppShell
      roleLabel="Barangay Official"
      logoSubtitle="Barangay Official Portal"
      navItems={navItems}
      sidebarItems={sidebarItems}
    >
      {tab === 'map' && <BarangayMap reports={reports} loading={loading} onOpenReport={openDetail} />}
      {tab === 'desk' && <DeskView reports={reports} onOpenReport={openDetail} />}
      {tab === 'messages' && <MessagesView role="barangay" />}
      {tab === 'profile' && <BarangayProfile reports={reports} />}

      <BottomSheet open={Boolean(detail)} onClose={() => setDetail(null)} title="Verify Report">
        {detail && (
          <ReportDetail
            report={reports.find((r) => r.id === detail.id) || detail}
            footer={
              <>
                <button className="btn-danger flex-1" onClick={reject} disabled={busy}>
                  <i className="fas fa-times" /> Reject
                </button>
                <button className="btn-success flex-1" onClick={verify} disabled={busy}>
                  <i className="fas fa-check" /> Verify
                </button>
              </>
            }
          >
            <div className="mb-4 mt-1">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">
                  Remarks
                </label>
                <span className="text-[0.68rem] font-semibold text-gray-300">Optional</span>
              </div>
              <textarea
                className="input-field resize-none bg-gray-50 focus:bg-white"
                rows={3}
                placeholder="Add context for the City Engineering office…"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <button className="btn-outline mb-2 w-full" onClick={escalate} disabled={busy}>
              <i className="fas fa-paper-plane" /> Escalate to City Engineering
            </button>
          </ReportDetail>
        )}
      </BottomSheet>
    </AppShell>
  )
}
