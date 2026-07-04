import { cn } from '@/lib/utils'

/**
 * Primitives de tableau — harmonisent les trois tables admin/formateur
 * (en-tête, zébrage subtil, survol, version mobile en cartes) sans
 * imposer de structure de données.
 *
 *   <TableShell stickyHeader>
 *     <Table>
 *       <THead sticky><TH>…</TH></THead>
 *       <TBody><TR><TD>…</TD></TR></TBody>
 *     </Table>
 *   </TableShell>
 *   <MobileCards>…cartes sm:hidden…</MobileCards>
 */

/** Zone desktop scrollable ; stickyHeader borne la hauteur pour l'en-tête collant. */
export function TableShell({ stickyHeader = false, className, children }) {
  return (
    <div
      className={cn(
        'hidden sm:block overflow-x-auto',
        stickyHeader && 'max-h-[70vh] overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

export function Table({ className, children }) {
  return <table className={cn('w-full text-sm', className)}>{children}</table>
}

export function THead({ sticky = false, children }) {
  return (
    <thead className={cn(sticky && 'sticky top-0 z-10 bg-card')}>
      <tr className="bg-muted/50 border-b border-border">{children}</tr>
    </thead>
  )
}

export function TH({ align = 'left', className, children }) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider',
        align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left',
        className
      )}
    >
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-border/50">{children}</tbody>
}

export function TR({ highlight = false, delay, className, children }) {
  return (
    <tr
      style={delay != null ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        'even:bg-muted/20 hover:bg-muted/30 transition-colors animate-in fade-in motion-reduce:animate-none',
        highlight && 'bg-primary/5',
        className
      )}
    >
      {children}
    </tr>
  )
}

export function TD({ align, className, children }) {
  return (
    <td
      className={cn(
        'px-6 py-4',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  )
}

/** Version mobile : liste de cartes empilées (le tableau est masqué en mobile). */
export function MobileCards({ className, children }) {
  return <div className={cn('sm:hidden divide-y divide-border/50', className)}>{children}</div>
}
