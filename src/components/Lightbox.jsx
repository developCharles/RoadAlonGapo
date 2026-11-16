export default function Lightbox({ src, onClose, alt = '' }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/85 p-4" onClick={onClose}>
      <button
        className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 text-white"
        onClick={onClose}
      >
        <i className="fas fa-times" />
      </button>
      <img src={src} alt={alt} className="max-h-[82vh] max-w-[94vw] rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}
