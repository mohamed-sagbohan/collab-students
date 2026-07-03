import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Dialog } from './Dialog'
import { Button } from './Button'

const ConfirmContext = createContext(null)

/**
 * Fournit une confirmation accessible et promise-based (`await confirm({...})`)
 * à toute l'appli, à la place de `window.confirm()` — modale stylée, cohérente
 * avec le design system, testable, et qui ne bloque pas le thread JS.
 * À monter une seule fois près de la racine (voir main.jsx).
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((options) => {
    setState(options)
    return new Promise((resolve) => { resolver.current = resolve })
  }, [])

  function settle(result) {
    setState(null)
    resolver.current?.(result)
    resolver.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={!!state} onClose={() => settle(false)} title={state?.title} className="max-w-sm">
        <div className="flex items-start gap-3 mb-6">
          {state?.danger && (
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{state?.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => settle(false)}>
            {state?.cancelLabel ?? 'Annuler'}
          </Button>
          <Button variant={state?.danger ? 'destructive' : 'primary'} className="flex-1" onClick={() => settle(true)}>
            {state?.confirmLabel ?? 'Confirmer'}
          </Button>
        </div>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

/** Retourne `confirm(options) => Promise<boolean>`. */
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm doit être utilisé à l\'intérieur de <ConfirmProvider>')
  return ctx
}
