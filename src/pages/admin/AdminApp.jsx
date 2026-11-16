import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/AppShell'
import { useAuth } from '../../context/AuthContext'
import {
  fetchOfficialRequests,
  fetchProfiles,
  fetchReports,
  subscribeReports
} from '../../lib/api'
import AdminOverview from './AdminOverview'
import RequestsReview from './RequestsReview'
import UserManagement from './UserManagement'
import SystemTools from './SystemTools'

export default function AdminApp() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('overview')
  const [profiles, setProfiles] = useState([])
  const [reports, setReports] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [profileResult, reportResult, requestResult] = await Promise.allSettled([
      fetchProfiles(),
      fetchReports(),
      fetchOfficialRequests()
    ])
    if (profileResult.status === 'fulfilled') setProfiles(profileResult.value)
    else console.warn('[admin] profiles', profileResult.reason)
    if (reportResult.status === 'fulfilled') setReports(reportResult.value)
    else console.warn('[admin] reports', reportResult.reason)
    if (requestResult.status === 'fulfilled') setRequests(requestResult.value)
    else console.warn('[admin] requests', requestResult.reason)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const unsubscribe = subscribeReports(load)
    return unsubscribe
  }, [load])

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending').length, [requests])
  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'Pending').length, [reports])

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'fas fa-th-large' },
    { key: 'requests', label: 'Requests', icon: 'fas fa-file-signature', badge: pendingRequests },
    { key: 'users', label: 'Users', icon: 'fas fa-users' },
    { key: 'system', label: 'System', icon: 'fas fa-database' }
  ]

  const navItems = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    active: tab === t.key,
    onClick: () => setTab(t.key)
  }))

  const sidebarItems = [
    {
      icon: 'fas fa-th-large',
      label: 'System Overview',
      sub: `${reports.length} reports · ${profiles.length} accounts`,
      onClick: () => setTab('overview')
    },
    {
      icon: 'fas fa-file-signature',
      label: 'Official Requests',
      sub: `${pendingRequests} awaiting review`,
      onClick: () => setTab('requests'),
      badge: pendingRequests || null
    },
    {
      icon: 'fas fa-clipboard-check',
      label: 'Verification Queue',
      sub: `${pendingReports} reports pending barangay review`,
      onClick: () => setTab('overview'),
      dividerAfter: true
    },
    {
      icon: 'fas fa-users',
      label: 'User Management',
      sub: 'Roles, status and barangay assignment',
      onClick: () => setTab('users')
    },
    {
      icon: 'fas fa-database',
      label: 'System & Data',
      sub: 'Activity log and backups',
      onClick: () => setTab('system'),
      dividerAfter: true
    },
    {
      icon: 'fas fa-rotate',
      label: 'Refresh Data',
      sub: 'Reload reports, accounts and requests',
      onClick: load
    }
  ]

  return (
    <AppShell
      roleLabel="Administrator"
      roleTone="admin-accent"
      logoSubtitle="Admin Control Panel"
      navItems={navItems}
      sidebarItems={sidebarItems}
      headerRight={
        <button
          className="relative flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-primary/10"
          onClick={() => setTab('requests')}
          aria-label="Pending official requests"
        >
          <i className="fas fa-bell text-primary" />
          {pendingRequests > 0 && (
            <span className="absolute right-0 top-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[0.58rem] font-extrabold text-white">
              {pendingRequests}
            </span>
          )}
        </button>
      }
    >
      {tab === 'overview' && (
        <AdminOverview
          reports={reports}
          profiles={profiles}
          requests={requests}
          onGoTo={setTab}
        />
      )}
      {tab === 'requests' && (
        <RequestsReview
          requests={requests}
          profiles={profiles}
          reviewerId={profile?.id}
          onRefresh={load}
          loading={loading}
        />
      )}
      {tab === 'users' && (
        <UserManagement
          profiles={profiles}
          currentUserId={profile?.id}
          onRefresh={load}
          loading={loading}
        />
      )}
      {tab === 'system' && (
        <SystemTools reports={reports} profiles={profiles} requests={requests} />
      )}
    </AppShell>
  )
}
