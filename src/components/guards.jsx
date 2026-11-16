import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeForRole } from '../lib/constants'
import { demoEnabled } from '../lib/demo'

export function RequireAuth({ children }) {
  const { session, profile, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) return children

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-primary" />
        <p className="text-sm font-bold text-muted">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
        <i className="fas fa-exclamation-triangle text-3xl text-warning" />
        <p className="text-sm font-bold text-ink">Profile not found</p>
        <p className="text-xs text-muted">Your account has no profile record. Contact the administrator.</p>
      </div>
    )
  }

  return children
}

export function RequireRole({ role, children }) {
  const { session, profile, loading, configured } = useAuth()

  if (demoEnabled()) {
    if (!session || !profile) return <Navigate to="/demo" replace />
    if (profile.role !== role) return <Navigate to={homeForRole(profile.role)} replace />
    return children || <Outlet />
  }

  if (!configured || loading) return null

  if (!session || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.role !== role) {
    return <Navigate to={homeForRole(profile.role)} replace />
  }

  return children || <Outlet />
}
