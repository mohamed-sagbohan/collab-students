import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Fil d'Ariane — `items` : [{ label, to? }]. Le dernier élément est la
 * page courante (aria-current), les autres sont des liens si `to` est fourni.
 */
export function Breadcrumb({ items = [], className }) {
  if (!items.length) return null
  return (
    <nav aria-label="Fil d'Ariane" className={cn('mb-4', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.to ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('truncate', isLast ? 'text-foreground font-medium' : 'text-muted-foreground')}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
