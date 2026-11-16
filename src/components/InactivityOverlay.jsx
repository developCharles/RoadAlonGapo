import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const LIMIT_MS = 15 * 60 * 1000
const WARN_MS = 60 * 1000

export default function InactivityOverlay() {
  const { signOut } = useAuth()
  const [remaining, setRemaining] = useState(WARN_MS)
  const deadlineRef = useRef(Date.now() + LIMIT_MS)
  const shownRef = useRef(false)

  useEffect(() => {
    const reset = () => {
      deadlineRef.current = Date.now() + LIMIT_MS
      if (shownRef.current) {
        shownRef.current = false
        setRemaining(WARN_MS)
      }
    }
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    const interval = setInterval(() => {
      const left = deadlineRef.current - Date.now()
      if (left <= WARN_MS && !shownRef.current) {
        shownRef.current = true
      }
      if (shownRef.current) {
        setRemaining(Math.max(0, left))
      }
    }, 500)
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset))
      clearInterval(interval)
    }
  }, [])

  if (!shownRef.current) return null

  const seconds = Math.ceil(remaining / 1000)

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-[340px] rounded-[20px] bg-white p-6 text-center shadow-pop">
        <i className="fas fa-clock mb-3.5 block text-[2.8rem] text-warning" />
        <h3 className="mb-2 text-lg font-extrabold text-ink">Still there?</h3>
        <p className="mb-2.5 text-[0.85rem] leading-relaxed text-muted">
          For your security you will be signed out soon.
        </p>
        <div className="mb-4 mt-2 text-[2.5rem] font-black text-danger">
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </div>
        <button
          className="mb-2.5 w-full cursor-pointer rounded-xl bg-primary-dark py-3 text-[0.95rem] font-black text-white"
          onClick={() => {
            deadlineRef.current = Date.now() + LIMIT_MS
            shownRef.current = false
            setRemaining(WARN_MS)
          }}
        >
          Stay Logged In
        </button>
        <button
          className={cn(
            'w-full cursor-pointer rounded-xl border-[1.5px] border-red-200 bg-transparent py-2.5 text-[0.9rem] font-extrabold text-danger'
          )}
          onClick={signOut}
        >
          Log Out Now
        </button>
      </div>
    </div>
  )
}
