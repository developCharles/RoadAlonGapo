import { cn } from '../lib/utils'

export default function BottomSheet({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet open">
        <div className="sheet-handle" onClick={onClose}>
          <div className="sheet-handle-bar" />
        </div>
        <div className="sheet-title">{title}</div>
        <div className="sheet-scroll">{children}</div>
        {footer && <div className="flex gap-2.5 border-t border-line bg-card p-3.5">{footer}</div>}
      </div>
    </>
  )
}
