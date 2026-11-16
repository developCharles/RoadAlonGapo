import { STATUS_META, SEVERITY_META } from '../lib/constants'
import { cn, initials } from '../lib/utils'

export function Spinner({ className = '' }) {
  return (
    <div
      className={cn('h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary', className)}
    />
  )
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner />
      <p className="text-[0.85rem] font-bold text-muted">{label}</p>
    </div>
  )
}

export function StatCard({ icon, iconClass = '', label, value, valueClass = '' }) {
  return (
    <div className="stat-card">
      {icon && <div className={cn('stat-card-icon', iconClass)}>{icon}</div>}
      <div className="stat-label">{label}</div>
      <div className={cn('stat-value', valueClass)}>{value}</div>
    </div>
  )
}

export function Badge({ tone = 'gray', children }) {
  const tones = {
    green: 'bg-success-bg text-success',
    red: 'bg-danger-bg text-danger',
    orange: 'bg-warning-bg text-warning',
    blue: 'bg-info-bg text-info',
    gray: 'bg-canvas text-muted',
    fb: 'bg-firebase-bg text-firebase-dark'
  }
  return <span className={cn('badge', tones[tone] || tones.gray)}>{children}</span>
}

export function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending
  return <span className={cn('badge', meta.badge)}>{meta.label}</span>
}

export function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.low
  return <span className={cn('badge', meta.badge)}>{meta.label}</span>
}

export function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <span>{children}</span>
      {action}
    </div>
  )
}

export function EmptyState({ icon = 'fa-inbox', title, sub }) {
  return (
    <div className="flex flex-col items-center px-5 py-16 text-center text-gray-300">
      <i className={cn('fas mb-3.5 block text-[3rem]', icon)} />
      {title && <p className="text-[0.88rem] font-bold text-gray-400">{title}</p>}
      {sub && <p className="mt-1 text-[0.78rem] text-gray-400">{sub}</p>}
    </div>
  )
}

export function Avatar({ name, className = '' }) {
  return (
    <div
      className={cn(
        'flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-info-bg text-[0.85rem] font-extrabold text-info',
        className
      )}
    >
      {initials(name)}
    </div>
  )
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-2.5"
      onClick={() => onChange?.(!on)}
    >
      <span
        className={cn(
          'relative h-[22px] w-[38px] flex-shrink-0 rounded-[11px] transition-colors',
          on ? 'bg-success' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all',
            on ? 'left-[19px]' : 'left-[3px]'
          )}
        />
      </span>
      {label && <span className="text-[0.85rem] font-bold text-ink">{label}</span>}
    </button>
  )
}
