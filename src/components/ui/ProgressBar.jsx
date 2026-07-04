import { cn } from '@/lib/utils'

const FILLS = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
  violet: 'bg-violet-500',
}

const SIZES = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

/**
 * Barre de progression accessible (role=progressbar + aria-valuenow).
 * Remplace les paires de divs bg-muted/bg-primary recopiées partout.
 */
export function ProgressBar({ value = 0, max = 100, variant = 'primary', size = 'md', label, className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
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
          FILLS[variant] ?? FILLS.primary
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
