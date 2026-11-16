import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    timer.current = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(timer.current)
  }, [toast])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className={`toast show ${
            toast.type === 'success' ? 'toast-success' : toast.type === 'error' ? 'toast-error' : ''
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
