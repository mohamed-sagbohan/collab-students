import { cn } from '@/lib/utils'

/** État vide réutilisable (liste vide, aucun résultat...) — icône + titre + description + action optionnelle. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('bg-card rounded-2xl border border-dashed border-border p-10 sm:p-12 text-center', className)}>
      {Icon && (
        <div className="relative w-fit mx-auto mb-5">
          <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>
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
