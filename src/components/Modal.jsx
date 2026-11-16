import { cn } from '../lib/utils'

export default function Modal({ open, onClose, title, children, footer, wide = false }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn('modal-card', wide && 'max-w-[560px]')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <strong className="text-[0.95rem] font-extrabold text-ink">{title}</strong>
          <button className="cursor-pointer border-0 bg-none text-lg text-muted" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex gap-2.5 border-t border-line p-3">{footer}</div>}
      </div>
    </div>
  )
}
