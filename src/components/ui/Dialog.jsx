import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
let openCount = 0

/**
 * Modal accessible : piège le focus dedans, ferme sur Échap ou clic sur le fond,
 * restaure le focus sur l'élément déclencheur à la fermeture, verrouille le
 * scroll du body pendant l'ouverture. Rendu dans un portal (document.body)
 * pour ne jamais être coupé par un `overflow: hidden` parent.
 */
export function Dialog({ open, onClose, title, description, labelledBy, children, className }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement
    openCount++
    document.body.style.overflow = 'hidden'

    const getFocusable = () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])
    // Focus le premier élément interactif du panneau (ou le panneau lui-même à défaut)
    ;(getFocusable()[0] ?? panelRef.current)?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      openCount--
      if (openCount === 0) document.body.style.overflow = ''
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title ? titleId : undefined)}
        tabIndex={-1}
        className={cn(
          'relative bg-card border border-border rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl',
          'animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 focus:outline-none',
          className
        )}
      >
        {title && (
          <h2 id={titleId} className="font-display text-lg font-bold tracking-tight text-foreground mb-2">{title}</h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
        )}
        {children}
      </div>
    </div>,
    document.body
  )
}
