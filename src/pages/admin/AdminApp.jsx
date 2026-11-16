import AppShell from '../../components/AppShell'
import { useAuth } from '../../context/AuthContext'

export default function AdminApp() {
  const { profile, signOut } = useAuth()

  const sidebarItems = [
    {
      icon: 'fas fa-user-shield',
      label: 'Admin',
      sub: profile?.email || 'Administrator',
      onClick: () => {}
    },
    {
      icon: 'fas fa-sign-out-alt',
      label: 'Sign Out',
      sub: 'End session',
      onClick: signOut
    }
  ]

  return (
    <AppShell
      roleLabel="Administrator"
      roleTone="admin-accent"
      logoSubtitle="Admin Control Panel"
      navItems={[]}
      sidebarItems={sidebarItems}
    >
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[520px] rounded-2xl bg-card p-6 shadow-card">
          <h1 className="mb-2 text-xl font-black text-ink">Admin Portal</h1>
          <p className="mb-4 text-[0.85rem] leading-relaxed text-muted">
            Core citizen/barangay/engineer flows are in place. Admin features (official request approvals, user
            management, analytics) can be added next using the existing Supabase API helpers.
          </p>
          <div className="rounded-xl bg-info-bg p-3 text-[0.8rem] font-semibold text-info">
            Signed in as {profile?.name || 'Admin'} ({profile?.email})
          </div>
        </div>
      </div>
    </AppShell>
  )
}
