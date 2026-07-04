import { cn } from '@/lib/utils'

const STROKES = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  info: 'stroke-info',
  destructive: 'stroke-destructive',
}

/**
 * Anneau de progression SVG (score d'exercice, progression de cours).
 * `children` est centré dans l'anneau (pourcentage, icône…).
 */
export function ProgressRing({
  value = 0,
  max = 100,
  size = 96,
  strokeWidth = 8,
  variant = 'primary',
  ariaLabel,
  className,
  children,
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            STROKES[variant] ?? STROKES.primary,
            'transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none'
          )}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}
