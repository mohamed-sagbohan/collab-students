import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  info: 'bg-info/10 text-info border-info/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  neutral: 'bg-muted text-muted-foreground border-transparent',
}

/**
 * Pastille de statut sémantique (le triplet bg-X/10 + border-X/20 + text-X
 * était recopié partout avec des couleurs en dur).
 */
export function StatusBadge({ variant = 'neutral', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        VARIANTS[variant] ?? VARIANTS.neutral,
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Statut publié / brouillon d'un cours — même rendu partout. */
export function PublishBadge({ published, className }) {
  return published ? (
    <StatusBadge variant="success" icon={Eye} className={className}>
      Publié
    </StatusBadge>
  ) : (
    <StatusBadge variant="warning" icon={EyeOff} className={className}>
      Brouillon
    </StatusBadge>
  )
}
