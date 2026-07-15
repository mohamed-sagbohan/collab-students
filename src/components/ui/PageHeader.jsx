import { cn } from '@/lib/utils'

/**
 * En-tête de page standard : pastille (eyebrow) + titre + sous-titre,
 * avec zone d'actions optionnelle à droite. Fixe le rythme vertical
 * commun à toutes les pages (mb-6 sm:mb-8).
 */
export function PageHeader({ eyebrow, eyebrowIcon: Icon, title, description, actions, className }) {
  return (
    <div
      className={cn(
        'mb-6 sm:mb-8',
        actions && 'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4',
        className
      )}
    >
      <div>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}
