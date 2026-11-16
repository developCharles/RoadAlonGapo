import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { MessageBox } from './Login'
import { signUpWithEmail } from '../../lib/api'
import { homeForRole } from '../../lib/constants'

function validate(pw) {
  return {
    len: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    num: /[0-9]/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw)
  }
}

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const rules = useMemo(() => validate(password), [password])
  const allMet = Object.values(rules).every(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!name.trim()) return setError('Please enter your full name.')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    if (!allMet) return setError('Password does not meet all requirements.')
    if (password !== confirm) return setError('Passwords do not match.')

    setBusy(true)
    try {
      const data = await signUpWithEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      })
      if (data?.session) {
        navigate(homeForRole('citizen'), { replace: true })
      } else {
        setSuccess('Account created! Please check your email to confirm before signing in.')
      }
    } catch (err) {
      setError(
        err.code === 'email_exists' || err.message?.includes('already been registered')
          ? 'This email is already registered. Please sign in.'
          : err.message || 'Registration failed.'
      )
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
      <div className="w-full max-w-[380px] rounded-[20px] bg-card p-5 shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
        <button
          className="mb-4 flex cursor-pointer items-center gap-2 border-0 bg-none text-[0.88rem] font-bold text-muted"
          onClick={() => navigate('/login')}
        >
          <i className="fas fa-arrow-left" /> Back to Sign In
        </button>
        <h2 className="mb-1 text-[1.5rem] font-black text-primary-dark">Create Account</h2>
        <p className="mb-5 text-[0.82rem] text-muted">Join RoadAlongapo and help keep Olongapo safe.</p>

        <MessageBox type="err">{error}</MessageBox>
        <MessageBox type="ok">{success}</MessageBox>

        <form onSubmit={handleSubmit}>
          <div className="mb-[18px]">
            <label className="inp-label">Full Name</label>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] outline-none"
                placeholder="e.g. Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <i className="fas fa-user text-gray-400" />
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="inp-label">Email Address</label>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                type="email"
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] outline-none"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="fas fa-at text-gray-400" />
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="inp-label">Password</label>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                type="password"
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] outline-none"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="fas fa-lock text-gray-400" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Rule ok={rules.len}>8+ characters</Rule>
              <Rule ok={rules.upper}>One uppercase</Rule>
              <Rule ok={rules.num}>One number</Rule>
              <Rule ok={rules.sym}>Special char (!@#$...)</Rule>
            </div>
          </div>

          <div className="mb-[18px]">
            <label className="inp-label">Confirm Password</label>
            <div className="flex items-center border-b-2 border-line focus-within:border-primary">
              <input
                type="password"
                className="w-full border-0 bg-transparent py-2.5 pr-8 text-[0.95rem] outline-none"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <i className="fas fa-lock text-gray-400" />
            </div>
          </div>

          <button type="submit" className="btn-main w-full cursor-pointer rounded-xl bg-primary-dark py-3.5 text-[0.95rem] font-black text-white" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Please wait…
              </>
            ) : (
              <>
                <i className="fas fa-user-plus" /> Create Your Account
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-[0.82rem] text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
