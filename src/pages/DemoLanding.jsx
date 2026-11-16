import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { homeForRole } from '../lib/constants'
import { resetDemoData } from '../lib/demo'

const ROLE_CARDS = [
  {
    role: 'citizen',
    icon: 'fa-user',
    title: 'Citizen',
    sub: 'Browse the hazard map, file reports, upvote issues.',
    tone: 'bg-primary/10 text-primary'
  },
  {
    role: 'barangay',
    icon: 'fa-shield-alt',
    title: 'Barangay Official',
    sub: 'Verify or reject reports, escalate to engineering.',
    tone: 'bg-warning-bg text-warning'
  },
  {
    role: 'engineer',
    icon: 'fa-hard-hat',
    title: 'City Engineer',
    sub: 'Assign crews, update repair stages, resolve tasks.',
    tone: 'bg-info-bg text-info'
  },
  {
    role: 'admin',
    icon: 'fa-user-shield',
    title: 'Administrator',
    sub: 'Review official requests, manage accounts, inspect backups and logs.',
    tone: 'bg-danger-bg text-danger'
  }
]

export default function DemoLanding() {
  const navigate = useNavigate()
  const { enterDemo } = useAuth()

  const previewAs = (role) => {
    enterDemo(role)
    navigate(homeForRole(role), { replace: true })
  }

  const resetData = () => {
    resetDemoData()
  }

  return (
    <AuthLayout subtitle="Demo Preview — no database required">
      <div className="w-full max-w-[440px] rounded-[20px] bg-card p-5 shadow-[0_8px_40px_rgba(0,61,128,0.13)]">
        <h2 className="mb-1 text-[1.4rem] font-black text-primary-dark">Explore the portals</h2>
        <p className="mb-4 text-[0.82rem] leading-relaxed text-muted">
          Supabase isn’t configured, so the app is running with sample data stored in your browser. Changes you make
          here are saved locally and survive refresh.
        </p>

        <div className="space-y-2.5">
          {ROLE_CARDS.map((card) => (
            <button
              key={card.role}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-line bg-white p-3 text-left transition-colors hover:border-primary hover:bg-primary/[0.03]"
              onClick={() => previewAs(card.role)}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] ${card.tone}`}>
                <i className={`fas ${card.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[0.9rem] font-extrabold text-ink">{card.title}</div>
                <div className="text-[0.74rem] leading-snug text-muted">{card.sub}</div>
              </div>
              <i className="fas fa-chevron-right text-[0.8rem] text-gray-300" />
            </button>
          ))}
        </div>

        <button
          className="mt-4 w-full cursor-pointer border-0 bg-none text-center text-[0.75rem] font-bold text-gray-400 hover:text-danger"
          onClick={resetData}
        >
          <i className="fas fa-rotate-left" /> Reset sample data
        </button>

        <div className="mt-3 rounded-[10px] border border-yellow-200 bg-[#fff8e1] px-3 py-2.5 text-[0.72rem] font-semibold leading-relaxed text-warning">
          <i className="fas fa-circle-info mr-1" />
          Demo mode is for previewing screens only. Add your Supabase keys to <code>.env</code> and restart to use real
          accounts and data.
        </div>
      </div>
    </AuthLayout>
  )
}
