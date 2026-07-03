import { Link } from 'react-router'
import { cn } from '@/lib/utils'

/**
 * Carte de statistique réutilisée sur tous les tableaux de bord (étudiant,
 * formateur, admin, analytics, suivi en direct). Devient un lien si `to` est
 * fourni. `loading` affiche un tiret plutôt qu'un skeleton séparé, pour éviter
 * un saut de mise en page pendant le chargement.
 */
export function StatCard({ icon: Icon, label, value, color = 'text-primary', bg = 'bg-primary/10', border = 'border-primary/20', to, loading, delay = 0, trailing }) {
  const content = (
    <div className={cn('bg-card rounded-2xl border p-4 sm:p-5 h-full', border, to && 'group')}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={cn('w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center', bg, border)}>
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', color)} aria-hidden="true" />
        </div>
        {trailing}
      </div>
      <p className={cn('text-2xl sm:text-3xl font-extrabold', color)}>{loading ? '—' : value}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-snug">{label}</p>
    </div>
  )

  const wrapperProps = {
    style: { animationDelay: `${delay}ms` },
    className: 'animate-in fade-in slide-in-from-bottom-1',
  }

  if (to) return <Link to={to} {...wrapperProps}>{content}</Link>
  return <div {...wrapperProps}>{content}</div>
}
