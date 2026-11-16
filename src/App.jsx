import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { RequireRole } from './components/guards'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import OfficialRequest from './pages/auth/OfficialRequest'
import ChangePassword from './pages/auth/ChangePassword'
import DemoLanding from './pages/DemoLanding'

import CitizenApp from './pages/citizen/CitizenApp'
import BarangayApp from './pages/barangay/BarangayApp'
import EngineerApp from './pages/engineer/EngineerApp'
import AdminApp from './pages/admin/AdminApp'

export default function App() {
  const { configured, profile } = useAuth()

  // No Supabase keys: run a fully clickable demo with sample data.
  if (!configured) {
    return (
      <Routes>
        <Route path="/demo" element={<DemoLanding />} />
        <Route path="/login" element={<DemoLanding />} />
        <Route path="/register" element={<DemoLanding />} />
        <Route path="/official-request" element={<DemoLanding />} />

        <Route
          path="/"
          element={
            <RequireRole role="citizen">
              <CitizenApp />
            </RequireRole>
          }
        />
        <Route
          path="/barangay"
          element={
            <RequireRole role="barangay">
              <BarangayApp />
            </RequireRole>
          }
        />
        <Route
          path="/engineer"
          element={
            <RequireRole role="engineer">
              <EngineerApp />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminApp />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to={profile ? '/' : '/demo'} replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/official-request" element={<OfficialRequest />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route
        path="/"
        element={
          <RequireRole role="citizen">
            <CitizenApp />
          </RequireRole>
        }
      />
      <Route
        path="/barangay"
        element={
          <RequireRole role="barangay">
            <BarangayApp />
          </RequireRole>
        }
      />
      <Route
        path="/engineer"
        element={
          <RequireRole role="engineer">
            <EngineerApp />
          </RequireRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminApp />
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
