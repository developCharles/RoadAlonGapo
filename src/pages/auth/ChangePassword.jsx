import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { MessageBox } from './Login'
import { useAuth } from '../../context/AuthContext'
import { updatePassword } from '../../lib/api'
import { homeForRole } from '../../lib/constants'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { profile, session, refreshProfile } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const rules = useMemo(
    () => ({
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      num: /[0-9]/.test(password),
      sym: /[^A-Za-z0-9]/.test(password)
    }),
    [password]
  )
  const allMet = Object.values(rules).every(Boolean)

  if (!session) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!allMet) return setError('Password does not meet all requirements.')
    if (password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      await updatePassword(password)
      await refreshProfile()
      navigate(homeForRole(profile?.role || 'citizen'), { replace: true })
    } catch (err) {
      setError(err.message || 'Could not update password.')
    } finally {
      setBusy(false)
    }
  }

  const Rule = ({ ok, children }) => (
    <div className={`flex items-center gap-1.5 text-[0.7rem] font-semibold ${ok ? 'text-success' : 'text-gray-400'}`}>
      <i className={`fas ${ok ? 'fa-check-circle' : 'fa-circle'} text-[0.65rem]`} /> {children}
    </div>
  )

  return (
    <AuthLayout>
      <div className="w-full max-w-[380px] rounded-[20px] bg-card p-6 shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
        <div className="mb-5 flex items-center gap-3 rounded-[14px] bg-gradient-to-br from-primary-dark to-primary p-4">
          <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-xl text-white">
            <i className="fas fa-key" />
          </div>
          <div className="text-white">
            <strong className="block text-[0.92rem] font-black tracking-wide">Set a New Password</strong>
            <span className="text-[0.73rem] font-semibold opacity-80">
              Required before you can access the portal.
            </span>
          </div>
        </div>

        <MessageBox type="err">{error}</MessageBox>

        <form onSubmit={handleSubmit} className="space-y-[18px]">
          <div>
            <label className="inp-label">New Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
            />
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Rule ok={rules.len}>8+ characters</Rule>
              <Rule ok={rules.upper}>One uppercase</Rule>
              <Rule ok={rules.num}>One number</Rule>
              <Rule ok={rules.sym}>Special char (!@#$...)</Rule>
            </div>
          </div>
          <div>
            <label className="inp-label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Updating…
              </>
            ) : (
              <>
                <i className="fas fa-check" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
