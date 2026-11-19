import { useEffect } from 'react'

export default function Lightbox({ src, onClose, alt = '' }) {
  useEffect(() => {
    if (!src) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [src, onClose])

  if (!src) return null

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt ? `${alt} photo` : 'Photo viewer'}
    >
      <button
        type="button"
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 text-white transition-colors hover:bg-white/25 sm:right-6 sm:top-6"
        onClick={onClose}
        aria-label="Close photo viewer"
      >
        <i className="fas fa-times" />
      </button>

      <div
        className="flex max-h-[90dvh] w-full max-w-[min(88vw,760px)] flex-col items-center gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[min(58vh,520px)] w-auto max-w-full rounded-xl object-contain shadow-pop"
        />
        {alt && (
          <p className="max-w-full truncate text-center text-[0.78rem] font-semibold text-white/70">
            {alt}
          </p>
        )}
      </div>
    </div>
  )
}
