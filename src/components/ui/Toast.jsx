import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Système de toasts maison — retours transitoires de mutations
 * (succès / erreur / info), aria-live, auto-dismiss, max 3 empilés.
 *
 *   const toast = useToast()
 *   toast.success('Leçon enregistrée !')
 *   toast.error("Impossible d'enregistrer. Réessayez.")
 */
const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle, iconClass: 'text-success', accentClass: 'border-success/30' },
  error: { icon: AlertCircle, iconClass: 'text-destructive', accentClass: 'border-destructive/30' },
  info: { icon: Info, iconClass: 'text-info', accentClass: 'border-info/30' },
}

let nextId = 0

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, iconClass, accentClass } = VARIANTS[toast.variant] ?? VARIANTS.info
  const timerRef = useRef(null)

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onDismiss(toast.id), toast.duration)
  }, [toast.id, toast.duration, onDismiss])

  const pauseTimer = useCallback(() => clearTimeout(timerRef.current), [])

  useEffect(() => {
    startTimer()
    return pauseTimer
  }, [startTimer, pauseTimer])

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocus={pauseTimer}
      onBlur={startTimer}
      className={cn(
        'pointer-events-auto flex items-start gap-3 bg-card border rounded-2xl shadow-2xl px-4 py-3.5',
        'animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none',
        accentClass
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconClass)} aria-hidden="true" />
      <p className="flex-1 text-sm text-foreground py-0.5">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="shrink-0 p-2.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((variant, message, opts = {}) => {
    const id = ++nextId
    const duration = opts.duration ?? (variant === 'error' ? 6000 : 4000)
    // Max 3 toasts affichés — on écarte le plus ancien.
    setToasts((list) => [...list.slice(-2), { id, variant, message, duration }])
    return id
  }, [])

  const api = useMemo(
    () => ({
      success: (message, opts) => push('success', message, opts),
      error: (message, opts) => push('error', message, opts),
      info: (message, opts) => push('info', message, opts),
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          role="region"
          aria-label="Notifications"
          className="fixed z-[120] bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé dans <ToastProvider>')
  return ctx
}
