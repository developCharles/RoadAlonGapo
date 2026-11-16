import { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../../components/ui'
import { initials } from '../../lib/utils'

export default function BarangayProfile({ reports }) {
  const { profile, signOut } = useAuth()
  const mine = useMemo(
    () => reports.filter((r) => (r.barangay || '') === (profile?.barangay || '')),
    [reports, profile]
  )
  const verified = mine.filter((r) => r.status === 'Verified').length
  const resolved = mine.filter((r) => r.status === 'Resolved').length

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-7">
      <div className="border-b border-line bg-card px-[18px] py-5">
        <div className="mb-3 flex items-start gap-3.5">
          <div className="relative flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-[1.4rem] font-black text-primary">{initials(profile?.name)}</span>
            <div className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-primary text-[0.55rem] text-white">
              <i className="fas fa-shield-alt" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 text-[1.2rem] font-extrabold text-ink">{profile?.name}</div>
            <div className="mb-1.5 text-[0.8rem] text-muted">
              {profile?.position || 'Barangay Official'} · {profile?.barangay}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-[3px] text-[0.68rem] font-extrabold uppercase tracking-wide text-primary">
              <i className="fas fa-shield-alt" /> Barangay Official
            </div>
          </div>
        </div>

        <div className="mt-3 flex border-t border-line pt-3">
          <div className="flex-1 text-center">
            <div className="text-[1.9rem] font-black leading-none text-ink">{mine.length}</div>
            <div className="mt-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-gray-400">
              Barangay Reports
            </div>
          </div>
          <div className="flex-1 border-l-2 border-line text-center">
            <div className="text-[1.9rem] font-black leading-none text-ink">{verified}</div>
            <div className="mt-0.5 text-[0.62rem] font-extrabold uppercase tracking-wide text-gray-400">
              Verified
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
        <div
          className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3.5 shadow-card"
          onClick={signOut}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-danger-bg">
            <i className="fas fa-sign-out-alt text-[0.9rem] text-danger" />
          </div>
          <div className="flex-1 text-[0.9rem] font-bold text-danger">Sign Out</div>
        </div>
      </div>

      <div className="mt-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.6px] text-gray-300">
        RoadAlongapo v1.0.0 · Barangay Portal
      </div>
    </div>
  )
}
