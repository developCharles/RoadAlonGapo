import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'
import { signInWithEmail, signInWithGoogle, getProfile } from '../../lib/api'
import { homeForRole } from '../../lib/constants'

export function MessageBox({ type, children }) {
  if (!children) return null
  return (
    <div
      className={`mb-3.5 flex items-center gap-2 rounded-[9px] px-3 py-2.5 text-[0.8rem] font-bold ${
        type === 'err' ? 'border border-red-200 bg-danger-bg text-danger' : 'border border-green-300 bg-success-bg text-success'
      }`}
    >
      <i className={type === 'err' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'} />
      <span>{children}</span>
    </div>
  )
}

export function useBusy() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  return { busy, setBusy, error, setError, success, setSuccess }
}

export function routeForProfile(profile) {
  if (!profile) return '/login'
  if (profile.role === 'pending') return { error: 'Your official access request is still under review.' }
  if (profile.role === 'rejected') return { error: 'Your access request was not approved. Contact the IT Administrator.' }
  if (profile.status === 'inactive') return { error: 'Your account has been deactivated. Contact the administrator.' }
  if (profile.role !== 'citizen' && !profile.passwordChanged) return { changePassword: true }
  return { home: homeForRole(profile.role) }
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const finish = async (user) => {
    const profile = await getProfile(user.id)
    await refreshProfile()
    const decision = routeForProfile(profile)
    if (decision.error) {
      const { signOut } = await import('../../lib/api')
      await signOut()
      setError(decision.error)
      setBusy(false)
      return
    }
    if (decision.changePassword) {
      navigate('/change-password', { replace: true })
      return
    }
    const from = location.state?.from
    navigate(from && from !== '/login' ? from : decision.home, { replace: true })
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setBusy(true)
    try {
      const { data, error: err } = await signInWithEmail(email.trim().toLowerCase(), password)
      if (err) throw err
      await finish(data.user)
    } catch (err) {
      const code = err.code || ''
      setError(
        code === 'invalid_credentials' || code === 'invalid_login_credentials'
          ? 'Incorrect email or password.'
          : code === 'too_many_requests'
            ? 'Too many attempts. Please try again later.'
            : err.message || 'Login failed.'
      )
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[380px] rounded-[20px] bg-card p-[22px] shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
        <MessageBox type="err">{error}</MessageBox>

        <form onSubmit={handleEmailLogin}>
          <div className="mb-[18px]">
            <label className="inp-label">Email Address</label>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                type="email"
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] text-ink outline-none"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <i className="fas fa-at cursor-pointer text-gray-400" />
            </div>
          </div>

          <div className="mb-[18px]">
            <div className="mb-[7px] flex items-center justify-between">
              <label className="text-[0.72rem] font-extrabold uppercase tracking-wide text-gray-700">
                Password
              </label>
              <Link to="/forgot" className="text-[0.72rem] font-extrabold text-primary">
                FORGOT?
              </Link>
            </div>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                type={showPw ? 'text' : 'password'}
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] text-ink outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <i
                className={`fas ${showPw ? 'fa-unlock' : 'fa-lock'} cursor-pointer text-gray-400 hover:text-primary`}
                onClick={() => setShowPw((s) => !s)}
              />
            </div>
          </div>

          <button type="submit" className="btn-main w-full cursor-pointer rounded-xl bg-primary-dark py-3.5 text-[0.95rem] font-black text-white" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Please wait…
              </>
            ) : (
              <>
                SIGN IN <i className="fas fa-arrow-right" />
              </>
            )}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2.5 text-[0.74rem] font-bold text-gray-400">
          <div className="h-px flex-1 bg-line" /> or continue with <div className="h-px flex-1 bg-line" />
        </div>

        <button
          className="mb-2.5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-line bg-card py-3 text-[0.88rem] font-bold text-gray-700 hover:border-primary"
          onClick={handleGoogle}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="h-5 w-5" />
          Sign in with Google
        </button>

        <div className="mt-4 text-center text-[0.82rem] text-muted">
          New to the platform?{' '}
          <Link to="/register" className="font-bold text-primary">
            Create an account
          </Link>
        </div>
        <div className="mt-1.5 text-center text-[0.82rem] text-muted">
          LGU Official?{' '}
          <Link to="/official-request" className="font-extrabold text-warning">
            Request Official Access
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
