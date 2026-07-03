import { cn } from '@/lib/utils'

/** État vide réutilisable (liste vide, aucun résultat...) — icône + titre + description + action optionnelle. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border p-10 sm:p-12 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
      )}
      <p className="font-bold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
