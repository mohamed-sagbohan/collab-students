import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'

/** Découpe « 78% » ou « 5 j » → [78, '%'] / [5, ' j'] pour animer la partie numérique. */
function splitValue(value) {
  if (typeof value === 'number' && Number.isInteger(value)) return [value, '']
  if (typeof value === 'string') {
    const m = value.match(/^(\d+)(\D.*)?$/)
    if (m) return [Number(m[1]), m[2] ?? '']
  }
  return [null, '']
}

/**
 * Carte de statistique réutilisée sur tous les tableaux de bord (étudiant,
 * formateur, admin, analytics, suivi en direct). Devient un lien si `to` est
 * fourni. `loading` affiche un tiret plutôt qu'un skeleton séparé, pour éviter
 * un saut de mise en page pendant le chargement. La partie numérique de la
 * valeur est comptée depuis 0 à l'arrivée (sauf reduced-motion).
 */
export function StatCard({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10', border = 'border-primary/20', to, loading, delay = 0, trailing }) {
  const [num, suffix] = loading ? [null, ''] : splitValue(value)
  const animated = useCountUp(num)

  const shown = loading ? '—' : num === null ? value : `${animated}${suffix}`

  const content = (
    <div
      className={cn(
        'relative overflow-hidden bg-card rounded-2xl border p-4 sm:p-5 h-full shadow-card',
        border,
        to &&
          'transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-card-hover motion-reduce:transition-none motion-reduce:group-hover:translate-y-0'
      )}
    >
      {/* Halo décoratif dans le coin, teinté comme l'icône */}
      <div aria-hidden="true" className={cn('absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-60 pointer-events-none', bg)} />

      <div className="relative flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center',
            bg,
            border,
            to && 'transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100'
          )}
        >
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', color)} aria-hidden="true" />
        </div>
        {trailing}
      </div>
      <p className={cn('relative text-2xl sm:text-3xl font-extrabold tabular-nums', color)}>{shown}</p>
      <p className="relative text-xs text-muted-foreground mt-1 leading-snug">{label}</p>
    </div>
  )

  const wrapperProps = {
    style: { animationDelay: `${delay}ms` },
    className: 'animate-in fade-in slide-in-from-bottom-1',
  }

  if (to) return <Link to={to} {...wrapperProps} className={cn(wrapperProps.className, 'group block h-full')}>{content}</Link>
  return <div {...wrapperProps}>{content}</div>
}
