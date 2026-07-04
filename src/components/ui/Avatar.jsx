import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

/**
 * Avatar à initiales avec le dégradé de marque (seul endroit où le
 * dégradé primary → amber est défini — ne pas le recopier ailleurs).
 * aria-hidden : le nom est toujours affiché à côté dans l'UI.
 */
export function Avatar({ name, size = 'md', className }) {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      aria-hidden="true"
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-primary-foreground font-bold shrink-0 select-none',
        SIZES[size] ?? SIZES.md,
        className
      )}
    >
      {initials}
    </span>
  )
}
