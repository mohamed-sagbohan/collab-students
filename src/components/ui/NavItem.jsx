import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

/**
 * Item de navigation unifié (le pattern actif/inactif était dupliqué
 * entre Navbar et AdminLayout). Trois variantes :
 *  - `tab`    : onglet de la navbar apprenant (soulignement)
 *  - `pill`   : item de la sidebar formateur/admin (pastille)
 *  - `bottom` : item de la bottom nav mobile (icône + libellé empilés)
 */
const BASE = {
  tab: 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors',
  pill: 'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium border transition-colors',
  bottom:
    'flex flex-col items-center justify-center gap-1 flex-1 min-h-11 min-w-11 py-1.5 rounded-2xl text-[11px] font-medium transition-colors',
}

const ACTIVE = {
  tab: 'bg-primary/10 text-primary',
  pill: 'bg-primary/10 text-primary border-primary/20',
  bottom: 'text-primary',
}

const INACTIVE = {
  tab: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  pill: 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground',
  bottom: 'text-muted-foreground hover:text-foreground',
}

const ICON = {
  tab: 'w-4 h-4',
  pill: 'w-4 h-4',
  bottom: 'w-5 h-5',
}

export function NavItem({ to, icon: Icon, label, variant = 'tab', end, badge, onClick, className, labelClassName }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(BASE[variant], isActive ? ACTIVE[variant] : INACTIVE[variant], className)
      }
    >
      {Icon && <Icon className={cn(ICON[variant], 'shrink-0')} aria-hidden="true" />}
      <span className={labelClassName}>{label}</span>
      {badge}
    </NavLink>
  )
}
