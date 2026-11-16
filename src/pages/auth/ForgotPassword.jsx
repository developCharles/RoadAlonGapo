import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { MessageBox } from './Login'
import { sendPasswordReset } from '../../lib/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    setBusy(true)
    try {
      await sendPasswordReset(email.trim().toLowerCase())
      setSuccess('Reset email sent! Check your inbox.')
    } catch (err) {
      setError(err.message || 'Could not send reset email.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[380px]">
        <button
          className="mb-4 flex cursor-pointer items-center gap-2 border-0 bg-none text-[0.88rem] font-bold text-muted"
          onClick={() => navigate('/login')}
        >
          <i className="fas fa-arrow-left" /> Back to Sign In
        </button>
        <div className="rounded-[20px] bg-card p-5 shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
          <h2 className="mb-1 text-[1.5rem] font-black text-primary-dark">Reset Password</h2>
          <p className="mb-5 text-[0.82rem] text-muted">
            Enter your registered email and we'll send you a password reset link.
          </p>

          <MessageBox type="err">{error}</MessageBox>
          <MessageBox type="ok">{success}</MessageBox>

          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn-main w-full cursor-pointer rounded-xl bg-primary-dark py-3.5 text-[0.95rem] font-black text-white" disabled={busy}>
              {busy ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Please wait…
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane" /> Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-3.5 text-center text-[0.82rem] text-muted">
            Remembered it?{' '}
            <button className="cursor-pointer border-0 bg-none font-bold text-primary" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
