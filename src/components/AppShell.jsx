import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { demoEnabled } from '../lib/demo'
import InactivityOverlay from './InactivityOverlay'

/**
 * Shared app shell: sidebar + header + bottom nav + inactivity guard.
 * navItems: [{ key, label, icon, to, badge }]
 * sidebarItems: [{ icon, label, sub, onClick, danger, dividerAfter }]
 */
export default function AppShell({
  roleLabel,
  roleTone = 'primary-dark',
  logoSubtitle,
  navItems = [],
  sidebarItems = [],
  headerRight = null,
  ribbon = null,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-canvas">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-[6000] bg-black/50 transition-opacity',
          sidebarOpen ? 'visible opacity-100' : 'invisible opacity-0'
        )}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={cn('sidebar', sidebarOpen && 'open')}>
        <div className={cn('sb-hdr', roleTone === 'admin-accent' ? 'bg-admin-accent' : 'bg-primary-dark')}>
          <div className="mb-0.5 text-[1.05rem] font-black uppercase tracking-[0.8px]">RoadAlongapo</div>
          <div className="mb-2.5 text-[0.74rem] font-semibold text-white/65">{logoSubtitle}</div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-[11px] py-1 text-[0.7rem] font-extrabold tracking-wide text-white">
            <i className="fas fa-shield-alt" /> {roleLabel}
          </div>
          <div className="mt-1.5 text-[0.78rem] font-semibold text-white/75">
            {profile?.name || 'Loading…'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sidebarItems.map((item, idx) => (
            <div key={item.label + idx}>
              <div
                className="sb-item"
                onClick={() => {
                  setSidebarOpen(false)
                  item.onClick?.()
                }}
              >
                <div className="sb-item-icon">
                  <i className={item.icon} />
                </div>
                <div className="flex-1">
                  <div className="sb-item-label">{item.label}</div>
                  {item.sub && <div className="sb-item-sub">{item.sub}</div>}
                </div>
                {item.badge ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-danger px-1 text-[0.6rem] font-extrabold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              {item.dividerAfter && <div className="mx-[18px] my-1.5 h-px bg-line" />}
            </div>
          ))}
        </div>

        <div
          className="flex cursor-pointer items-center gap-2.5 border-t border-line px-[18px] py-4 text-[0.9rem] font-extrabold text-danger"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt" />
          <span>Sign Out</span>
        </div>
      </aside>

      {/* Header */}
      <header className="z-[4000] flex flex-shrink-0 items-center justify-between border-b border-line bg-card px-[18px] py-[13px]">
        <button
          className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-primary/10"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <i className="fas fa-bars text-primary" />
        </button>
        <div className="text-[1.15rem] font-extrabold uppercase tracking-[0.6px] text-primary">
          RoadAlongapo
        </div>
        <div className="flex items-center gap-2">
          {demoEnabled() && (
            <button
              className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-warning-bg px-3 text-[0.7rem] font-extrabold uppercase tracking-wide text-warning"
              onClick={() => navigate('/demo')}
              title="Switch demo role"
            >
              <i className="fas fa-flask" /> Demo
            </button>
          )}
          {headerRight}
          <button
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full bg-primary/10"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <i className="fas fa-sign-out-alt text-primary" />
          </button>
        </div>
      </header>

      {ribbon}

      <main className="flex min-h-0 flex-1 flex-col pb-[72px]">{children}</main>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button key={item.key} className={cn('nav-item', item.active && 'active')} onClick={item.onClick}>
            <i className={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <InactivityOverlay />
    </div>
  )
}
