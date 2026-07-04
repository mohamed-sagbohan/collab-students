export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  )
}

/** Lignes de texte factices — la dernière est raccourcie. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

/** Carte factice (listes de cours, panneaux). */
export function SkeletonCard({ className = '' }) {
  return <Skeleton className={`h-52 rounded-2xl ${className}`} />
}

/** Avatar factice — tailles alignées sur <Avatar>. */
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8', lg: 'w-10 h-10' }
  return <Skeleton className={`${sizes[size] ?? sizes.md} rounded-full ${className}`} />
}

/** Ligne de tableau factice. */
export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" />
        </td>
      ))}
    </tr>
  )
}
