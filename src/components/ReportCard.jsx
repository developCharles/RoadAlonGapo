import { getCategoryIcon, computeSeverity, SEVERITY_META, STATUS_META } from '../lib/constants'
import { timeAgo, cn } from '../lib/utils'

export default function ReportCard({ report, onClick, showReporter = false, right }) {
  const sev = computeSeverity(report)
  const sevMeta = SEVERITY_META[sev]
  const statusMeta = STATUS_META[report.status] || STATUS_META.Pending
  return (
    <div
      className="mb-2.5 flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3 shadow-card transition-transform active:scale-[0.98]"
      onClick={() => onClick?.(report)}
    >
      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gray-200">
        {report.imageUrl ? (
          <img src={report.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className={cn('fas text-[1.3rem] text-gray-300', getCategoryIcon(report.category))} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className={cn('badge', sevMeta.badge)}>{sevMeta.label}</span>
          <span className={cn('badge', statusMeta.badge)}>{statusMeta.label}</span>
        </div>
        <div className="mb-0.5 truncate text-[0.9rem] font-bold text-ink">{report.category}</div>
        <div className="flex items-center gap-1 truncate text-[0.76rem] text-muted">
          <i className="fas fa-map-marker-alt text-[0.7rem] text-primary" />
          {report.location || '—'}
        </div>
        {showReporter && report.reportedBy && (
          <div className="mt-0.5 truncate text-[0.7rem] text-gray-400">by {report.reportedByName || report.reportedBy}</div>
        )}
        <div className="mt-0.5 text-[0.68rem] font-bold uppercase text-gray-400">{timeAgo(report.createdAt)}</div>
      </div>

      {right || (
        <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
          <span className="flex items-center gap-1 text-[0.78rem] font-extrabold text-secondary">
            <i className="fas fa-thumbs-up text-[0.7rem]" /> {report.upvotes || 0}
          </span>
        </div>
      )}
    </div>
  )
}
