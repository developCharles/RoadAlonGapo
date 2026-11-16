import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar, StatCard } from '../../components/ui'
import ReportCard from '../../components/ReportCard'
import { initials } from '../../lib/utils'

export default function ProfileView({ reports, onOpen }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const mine = useMemo(() => reports.filter((r) => r.reportedBy === profile?.id), [reports, profile])
  const resolved = mine.filter((r) => r.status === 'Resolved').length
  const level = Math.floor(mine.length / 5) + 1

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-7">
      <div className="border-b border-line bg-card px-[18px] py-5">
        <div className="mb-3 flex items-start gap-3.5">
          <div className="relative flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center rounded-2xl bg-gray-200">
            <span className="text-[1.6rem] font-black text-gray-400">{initials(profile?.name)}</span>
            <div className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-primary text-[0.55rem] text-white">
              <i className="fas fa-check" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-[1.2rem] font-extrabold text-ink">{profile?.name}</div>
            <div className="mb-1.5 text-[0.8rem] text-muted">Verified Commuter · Olongapo City</div>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-[3px] text-[0.68rem] font-extrabold uppercase tracking-wide text-primary">
              <i className="fas fa-star" /> Level {level} Reporter
            </div>
          </div>
        </div>

        <div className="mt-3 flex border-t border-line pt-3">
          <div className="flex-1 text-center">
            <div className="text-[1.9rem] font-black leading-none text-ink">{mine.length}</div>
            <div className="mt-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-gray-400">
              Reports Filed
            </div>
          </div>
          <div className="flex-1 border-l-2 border-line text-center">
            <div className="text-[1.9rem] font-black leading-none text-ink">{resolved}</div>
            <div className="mt-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-gray-400">
              Resolved
            </div>
          </div>
        </div>
      </div>

      <div className="px-[15px] pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[0.8rem] font-extrabold uppercase tracking-wide text-ink">My Reports</div>
        </div>
        {mine.length === 0 ? (
          <p className="py-6 text-center text-[0.85rem] text-gray-400">You haven't submitted any reports yet.</p>
        ) : (
          mine.map((r) => <ReportCard key={r.id} report={r} onClick={onOpen} />)
        )}
      </div>

      <div className="px-[15px] pt-2">
        <div className="text-[0.8rem] font-extrabold uppercase tracking-wide text-ink">Settings</div>
        <div
          className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3.5 shadow-card"
          onClick={() => navigate('/change-password')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-primary/10">
            <i className="fas fa-key text-[0.9rem] text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-[0.9rem] font-bold text-ink">Change Password</div>
            <div className="mt-0.5 text-[0.74rem] text-gray-400">Update your account password</div>
          </div>
          <i className="fas fa-chevron-right text-gray-300" />
        </div>
      </div>

      <div className="px-[15px] pt-2">
        <div
          className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] border-red-200 bg-card p-3.5 shadow-card"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt text-danger" />
          <span className="text-[0.9rem] font-extrabold uppercase tracking-wide text-danger">Logout</span>
        </div>
      </div>

      <div className="mt-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.6px] text-gray-300">
        RoadAlongapo v1.0.0 · React + Supabase
      </div>
    </div>
  )
}
