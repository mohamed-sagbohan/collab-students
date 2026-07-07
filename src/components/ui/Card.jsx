import { cn } from '@/lib/utils'

const PADDINGS = {
  none: '',
  sm: 'p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

/**
 * Carte de base — bordure, fond, radius et ombre cohérents partout.
 * `interactive` ajoute l'élévation au survol (désactivée si l'utilisateur
 * préfère réduire les animations).
 */
export function Card({ as: Tag = 'div', interactive = false, padding = 'md', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'bg-card border border-border rounded-2xl shadow-card',
        PADDINGS[padding] ?? PADDINGS.md,
        interactive &&
          'transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
