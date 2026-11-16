import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/AppShell'
import BottomSheet from '../../components/BottomSheet'
import ReportDetail from '../../components/ReportDetail'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { fetchReports, subscribeReports, upvoteReport } from '../../lib/api'
import CitizenMap from './CitizenMap'
import ReportsView from './ReportsView'
import ProfileView from './ProfileView'
import ReportForm from './ReportForm'

export default function CitizenApp() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('map')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [voting, setVoting] = useState(false)

  const load = useCallback(async () => {
    try {
      const rows = await fetchReports()
      setReports(rows)
    } catch (e) {
      console.warn('[citizen] load reports', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const unsub = subscribeReports(load)
    return unsub
  }, [load])

  const mine = useMemo(() => reports.filter((r) => r.reportedBy === profile?.id), [reports, profile])

  const handleUpvote = async (report) => {
    if (voting) return
    setVoting(true)
    try {
      await upvoteReport(report.id, profile.email)
      await load()
    } catch (e) {
      toast('Could not register your upvote.', 'error')
    } finally {
      setVoting(false)
    }
  }

  const navItems = [
    { key: 'map', label: 'Map', icon: 'fas fa-map', active: tab === 'map', onClick: () => setTab('map') },
    { key: 'reports', label: 'Reports', icon: 'fas fa-clipboard-list', active: tab === 'reports', onClick: () => setTab('reports') },
    { key: 'profile', label: 'Profile', icon: 'fas fa-user', active: tab === 'profile', onClick: () => setTab('profile') }
  ]

  const sidebarItems = [
    { icon: 'fas fa-plus', label: 'Report a Hazard', sub: 'Submit a new report', onClick: () => setFormOpen(true) },
    { icon: 'fas fa-clipboard-list', label: 'My Reports', sub: 'Track your submissions', onClick: () => setTab('reports'), dividerAfter: true },
    { icon: 'fas fa-question-circle', label: 'Help & Support', sub: 'FAQ and contact info', onClick: () => toast('Support center coming soon.') },
    { icon: 'fas fa-info-circle', label: 'About', sub: 'RoadAlongapo v1.0.0', onClick: () => toast('RoadAlongapo — civic infrastructure reporting.') }
  ]

  return (
    <AppShell
      roleLabel="Citizen"
      logoSubtitle="Citizen Portal"
      navItems={navItems}
      sidebarItems={sidebarItems}
      headerRight={
        <button
          className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-primary/10"
          onClick={() => setTab('reports')}
          aria-label="My reports"
        >
          <i className="fas fa-bell text-primary" />
        </button>
      }
    >
      {tab === 'map' && (
        <CitizenMap
          reports={reports}
          loading={loading}
          onOpenReport={setDetail}
          onNewReport={() => setFormOpen(true)}
        />
      )}
      {tab === 'reports' && (
        <ReportsView reports={mine} onOpen={setDetail} onNew={() => setFormOpen(true)} />
      )}
      {tab === 'profile' && <ProfileView reports={reports} onOpen={setDetail} />}

      <BottomSheet open={Boolean(detail)} onClose={() => setDetail(null)} title="Report Details">
        {detail && (
          <ReportDetail
            report={reports.find((r) => r.id === detail.id) || detail}
            footer={
              <button className="btn-primary flex-1" onClick={() => handleUpvote(detail)} disabled={voting}>
                <i className="fas fa-thumbs-up" />
                {voting ? 'Saving…' : `Upvote (${(reports.find((r) => r.id === detail.id) || detail).upvotes || 0})`}
              </button>
            }
          />
        )}
      </BottomSheet>

      <ReportForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmitted={() => {
          setFormOpen(false)
          toast('Report submitted. Thank you!', 'success')
          load()
        }}
      />
    </AppShell>
  )
}
