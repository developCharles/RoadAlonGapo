import { useState } from 'react'
import HazardMap from './HazardMap'
import Lightbox from './Lightbox'
import { Badge, SeverityBadge, StatusPill } from './ui'
import { getCategoryIcon, computeSeverity, STAGES, getStageIndex } from '../lib/constants'
import { cn, timeAgo } from '../lib/utils'

function ProgressTracker({ report }) {
  const idx = getStageIndex(report)
  if (idx < 0) return null
  return (
    <div className="mb-4 flex items-center">
      {STAGES.map((stage, i) => {
        const done = i < idx || (idx === STAGES.length - 1 && i === idx)
        const active = i === idx && idx !== STAGES.length - 1
        return (
          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 text-[0.55rem]',
                  done && 'border-success bg-success text-white',
                  active && 'border-primary bg-primary text-white',
                  !done && !active && 'border-line bg-white text-gray-300'
                )}
              >
                <i className={cn('fas', done ? 'fa-check' : stage.icon)} />
              </div>
              <div
                className={cn(
                  'mt-1 text-center text-[0.55rem] font-bold uppercase leading-tight',
                  done ? 'text-success' : active ? 'text-primary' : 'text-gray-400'
                )}
              >
                {stage.label}
              </div>
            </div>
            {i < STAGES.length - 1 && <div className={cn('mx-1 mb-4 h-0.5 flex-1', i < idx ? 'bg-success' : 'bg-line')} />}
          </div>
        )
      })}
    </div>
  )
}

export default function ReportDetail({ report, children, footer }) {
  const [lightbox, setLightbox] = useState(null)
  const sev = computeSeverity(report)
  const stageIdx = getStageIndex(report)
  const images = [report.imageUrl, ...(report.communityImages || []), report.resolveImageUrl].filter(Boolean)

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2.5">
        <StatusPill status={report.status} />
        <SeverityBadge severity={sev} />
        <span className="text-[0.78rem] font-semibold text-gray-400">#{String(report.id).slice(0, 8)}</span>
      </div>

      <h2 className="mb-2 text-[1.4rem] font-black leading-tight text-ink">{report.category}</h2>
      <div className="mb-4 flex items-center gap-1.5 text-[0.82rem] text-muted">
        <i className="fas fa-user-circle text-primary" />
        {report.reportedByName || report.reportedBy || 'Citizen'}
      </div>

      <div
        className="relative mb-4 flex h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[14px] bg-gray-200"
        onClick={() => images[0] && setLightbox(images[0])}
      >
        {images[0] ? (
          <img src={images[0]} alt="" className="h-full w-full object-cover" />
        ) : (
          <>
            <i className={cn('fas mb-2 text-[2.5rem] text-gray-400', getCategoryIcon(report.category))} />
            <p className="text-[0.82rem] font-semibold text-gray-400">No evidence photo</p>
          </>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-lg bg-black/50 px-2 py-1 text-[0.66rem] font-extrabold text-white">
            +{images.length - 1} more
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-16 w-16 flex-shrink-0 cursor-pointer rounded-lg border-[1.5px] border-line object-cover"
              onClick={() => setLightbox(src)}
            />
          ))}
        </div>
      )}

      <div className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">Location</div>
      <div className="mb-1.5 h-[150px] overflow-hidden rounded-xl bg-gray-200">
        {Number.isFinite(Number(report.lat)) && Number.isFinite(Number(report.lng)) ? (
          <HazardMap
            reports={[report]}
            center={[Number(report.lat), Number(report.lng)]}
            zoom={15}
            dragging={false}
            scrollWheelZoom={false}
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[0.8rem] text-gray-400">No coordinates</div>
        )}
      </div>
      <div className="mb-4 text-[0.82rem] text-muted">
        <i className="fas fa-map-marker-alt mr-1 text-primary" />
        {report.location || '—'}
      </div>

      <div className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">Description</div>
      <div className="mb-4 rounded-r-[10px] border-l-4 border-primary bg-[#f5f8ff] px-4 py-3.5">
        <p className="text-[0.86rem] leading-relaxed text-ink">{report.description || 'No description provided.'}</p>
      </div>

      <div className="mb-4 flex gap-2.5">
        <div className="flex-1 rounded-[10px] bg-card px-3.5 py-2.5 shadow-card">
          <i className="fas fa-thumbs-up text-primary" />
          <div className="text-[0.62rem] font-bold uppercase tracking-wide text-gray-400">Upvotes</div>
          <div className="text-[0.85rem] font-extrabold text-ink">{report.upvotes || 0}</div>
        </div>
        <div className="flex-1 rounded-[10px] bg-card px-3.5 py-2.5 shadow-card">
          <i className="fas fa-clock text-primary" />
          <div className="text-[0.62rem] font-bold uppercase tracking-wide text-gray-400">Reported</div>
          <div className="text-[0.85rem] font-extrabold text-ink">{timeAgo(report.createdAt)}</div>
        </div>
      </div>

      {report.assignedTeam && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-info-bg px-3.5 py-3">
          <i className="fas fa-users text-info" />
          <div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-wide text-info">Assigned Team</div>
            <div className="text-[0.85rem] font-bold text-ink">{report.assignedTeam}</div>
          </div>
        </div>
      )}

      <ProgressTracker report={report} />

      {report.workDescription && (
        <div className="mb-4">
          <div className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">Work Notes</div>
          <div className="rounded-xl bg-gray-50 px-3.5 py-3 text-[0.85rem] leading-relaxed text-ink">
            {report.workDescription}
          </div>
        </div>
      )}

      {report.barangayRemarks && (
        <div className="mb-4">
          <div className="mb-1.5 text-[0.7rem] font-extrabold uppercase tracking-wide text-gray-400">
            Barangay Remarks
          </div>
          <div className="rounded-xl bg-warning-bg px-3.5 py-3 text-[0.85rem] leading-relaxed text-ink">
            {report.barangayRemarks}
          </div>
        </div>
      )}

      {children}

      {footer && <div className="mt-4 flex gap-2.5">{footer}</div>}

      {stageIdx >= 0 && <div className="mt-3 text-right text-[0.68rem] font-semibold text-gray-400">Stage {stageIdx + 1} of {STAGES.length}</div>}

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} alt={report.category} />
    </div>
  )
}
