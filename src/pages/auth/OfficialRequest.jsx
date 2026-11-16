import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { MessageBox } from './Login'
import { signUpWithEmail, insertOfficialRequest, uploadFile } from '../../lib/api'
import { BARANGAYS, POSITIONS } from '../../lib/constants'

const ACCEPT = 'image/jpeg,image/png,application/pdf'

export default function OfficialRequest() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    name: '',
    position: '',
    barangay: '',
    contact: '',
    email: '',
    password: '',
    confirm: ''
  })
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const rules = useMemo(
    () => ({
      len: form.password.length >= 8,
      upper: /[A-Z]/.test(form.password),
      num: /[0-9]/.test(form.password),
      sym: /[^A-Za-z0-9]/.test(form.password)
    }),
    [form.password]
  )
  const allMet = Object.values(rules).every(Boolean)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.size <= 5 * 1024 * 1024)
    setFiles((prev) => [...prev, ...picked].slice(0, 6))
  }

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { name, position, barangay, contact, email, password, confirm } = form
    if (!name.trim()) return setError('Please enter your full name.')
    if (!position) return setError('Please select your position/title.')
    if (!barangay) return setError('Please select your barangay.')
    if (contact.replace(/\D/g, '').length < 10) return setError('Please enter a valid contact number.')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    if (!allMet) return setError('Password does not meet all requirements.')
    if (password !== confirm) return setError('Passwords do not match.')
    if (files.length === 0) return setError('Please upload at least one proof document.')

    setBusy(true)
    try {
      const { data, error: err } = await signUpWithEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'pending',
        status: 'inactive',
        barangay,
        position,
        contact,
        passwordChanged: true
      })
      if (err) throw err
      const uid = data?.user?.id
      if (!uid) throw new Error('Account created, but could not attach documents. Contact the administrator.')

      const documents = []
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadFile('official-documents', path, file)
        documents.push({ name: file.name, url })
      }

      await insertOfficialRequest({
        uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        position,
        barangay,
        contact,
        requestedRole: 'barangay',
        status: 'pending',
        documents
      })

      const { signOut } = await import('../../lib/api')
      await signOut()
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Submission failed.')
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-[400px] rounded-[20px] bg-card p-6 text-center shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
          <div className="mb-3.5 text-[3rem]">📋</div>
          <h2 className="mb-2 text-lg font-black text-primary-dark">Request Submitted!</h2>
          <p className="mb-5 text-[0.82rem] leading-relaxed text-muted">
            Your access request has been received. The IT Administrator will verify your identity and
            activate your account. You can log in once approved.
          </p>
          <button className="btn-primary w-full" onClick={() => navigate('/login')}>
            <i className="fas fa-arrow-left" /> Back to Sign In
          </button>
        </div>
      </AuthLayout>
    )
  }

  const Rule = ({ ok, children }) => (
    <div className={`flex items-center gap-1.5 text-[0.7rem] font-semibold ${ok ? 'text-success' : 'text-gray-400'}`}>
      <i className={`fas ${ok ? 'fa-check-circle' : 'fa-circle'} text-[0.65rem]`} /> {children}
    </div>
  )

  return (
    <AuthLayout>
      <div className="w-full max-w-[400px] rounded-[20px] bg-card p-5 shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
        <button
          className="mb-4 flex cursor-pointer items-center gap-2 border-0 bg-none text-[0.88rem] font-bold text-muted"
          onClick={() => navigate('/login')}
        >
          <i className="fas fa-arrow-left" /> Back to Sign In
        </button>
        <h2 className="mb-1 text-[1.5rem] font-black text-primary-dark">Official Access Request</h2>
        <p className="mb-5 text-[0.82rem] leading-relaxed text-muted">
          For LGU Barangay officials only. Your request will be reviewed and approved by the IT Administrator
          before access is granted.
        </p>

        <MessageBox type="err">{error}</MessageBox>

        <form onSubmit={handleSubmit} className="space-y-[18px]">
          <div>
            <label className="inp-label">
              Full Name <span className="text-danger">*</span>
            </label>
            <input className="input-field" value={form.name} onChange={set('name')} placeholder="e.g. Maria Santos" />
          </div>

          <div>
            <label className="inp-label">
              Position / Title <span className="text-danger">*</span>
            </label>
            <select className="input-field" value={form.position} onChange={set('position')}>
              <option value="">— Select position —</option>
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="inp-label">
              Barangay <span className="text-danger">*</span>
            </label>
            <select className="input-field" value={form.barangay} onChange={set('barangay')}>
              <option value="">— Select your barangay —</option>
              {BARANGAYS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="inp-label">
              Contact Number <span className="text-danger">*</span>
            </label>
            <input
              className="input-field"
              value={form.contact}
              onChange={set('contact')}
              placeholder="09XX XXX XXXX"
              maxLength={13}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="inp-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={set('email')}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="inp-label">
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={set('password')}
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
            <label className="inp-label">
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="input-field"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Re-enter password"
            />
          </div>

          <div>
            <label className="inp-label">
              Proof of Identity / Position <span className="text-danger">*</span>
            </label>
            <p className="mb-2.5 text-[0.7rem] leading-relaxed text-muted">
              Upload documents that verify your identity and position (Appointment Letter, ID Card, Certificate of
              Incumbency, Barangay Resolution). JPG, PNG, or PDF (max 5MB each).
            </p>
            <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleFiles} />
            <div
              className="cursor-pointer rounded-xl border-2 border-dashed border-line bg-gray-50 p-6 text-center hover:border-primary hover:bg-info-bg"
              onClick={() => fileRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt mb-2.5 block text-[2.2rem] text-primary" />
              <div className="text-[0.88rem] font-bold text-gray-700">Click to upload or drag and drop</div>
              <div className="text-[0.72rem] text-gray-400">JPG, PNG, or PDF (max 5MB per file)</div>
            </div>

            {files.length > 0 && (
              <div className="mt-3.5 rounded-xl border-[1.5px] border-line bg-gray-50 p-3.5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[0.78rem] font-extrabold tracking-wide text-gray-700">
                    UPLOADED DOCUMENTS
                  </span>
                  <button type="button" className="cursor-pointer border-0 bg-none text-[0.72rem] font-bold text-danger" onClick={() => setFiles([])}>
                    <i className="fas fa-trash-alt" /> Remove All
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-lg border-[1.5px] border-line bg-white">
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-danger">
                          <i className="fas fa-file-pdf text-[1.6rem]" />
                          <span className="px-1 text-center text-[0.55rem] font-bold">{file.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-[0.6rem] text-white"
                        onClick={() => removeFile(idx)}
                      >
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-yellow-200 bg-[#fff8e1] px-3 py-2.5">
            <p className="text-[0.74rem] font-bold leading-relaxed text-warning">
              <i className="fas fa-exclamation-triangle mr-1" />
              <strong>Important:</strong> Submitting false information or impersonating an LGU official violates RA
              10173 (Data Privacy Act) and may be subject to legal action.
            </p>
          </div>

          <button type="submit" className="btn-main w-full cursor-pointer rounded-xl bg-primary-dark py-3.5 text-[0.95rem] font-black text-white" disabled={busy}>
            {busy ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Submitting…
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane" /> Submit Access Request
              </>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
