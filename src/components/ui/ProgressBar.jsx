import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const FILLS = {
  primary: 'bg-gradient-to-r from-primary/75 to-primary',
  success: 'bg-gradient-to-r from-success/75 to-success',
  warning: 'bg-gradient-to-r from-warning/75 to-warning',
  info: 'bg-gradient-to-r from-info/75 to-info',
  destructive: 'bg-gradient-to-r from-destructive/75 to-destructive',
  violet: 'bg-gradient-to-r from-violet-400 to-violet-500',
}

const SIZES = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

/**
 * Barre de progression accessible (role=progressbar + aria-valuenow).
 * Remplace les paires de divs bg-muted/bg-primary recopiées partout.
 * Le remplissage part de 0 au montage (la transition existante fait
 * l'animation) ; `sheen` ajoute un reflet balayant discret — à réserver
 * à la barre principale d'une page.
 */
export function ProgressBar({ value = 0, max = 100, variant = 'primary', size = 'md', label, sheen = false, className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  // Premier rendu à 0 % puis largeur réelle à la frame suivante :
  // la transition CSS anime le remplissage à l'arrivée sur la page.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-label={label}
      className={cn('w-full bg-muted rounded-full overflow-hidden', SIZES[size] ?? SIZES.md, className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 motion-reduce:transition-none',
          FILLS[variant] ?? FILLS.primary,
          sheen && pct > 0 && 'relative overflow-hidden progress-sheen'
        )}
        style={{ width: `${mounted ? pct : 0}%` }}
      />
    </div>
  )
}
