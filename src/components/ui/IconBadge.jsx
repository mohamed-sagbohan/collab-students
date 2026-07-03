import { cn } from '@/lib/utils'

const SIZE = {
  sm: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
  md: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
  lg: { box: 'w-16 h-16 rounded-2xl', icon: 'w-7 h-7' },
}

/** Icône dans un carré arrondi teinté — motif répété dans les en-têtes (auth, sections, cartes vides). */
export function IconBadge({ icon: Icon, size = 'md', color = 'text-primary', bg = 'bg-primary/10', border, className }) {
  const s = SIZE[size] ?? SIZE.md
  return (
    <div className={cn(s.box, bg, border && `border ${border}`, 'flex items-center justify-center shrink-0', className)}>
      <Icon className={cn(s.icon, color)} aria-hidden="true" />
    </div>
  )
}
