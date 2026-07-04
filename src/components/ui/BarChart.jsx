import { cn } from '@/lib/utils'
import { VisuallyHidden } from './VisuallyHidden'

const FILLS = {
  primary: 'fill-primary',
  success: 'fill-success',
  warning: 'fill-warning',
  info: 'fill-info',
  destructive: 'fill-destructive',
  violet: 'fill-violet-500',
}

/**
 * Petit graphique à barres SVG maison (pas de dépendance).
 * - `data` : [{ label, values: [n, …] }] — plusieurs valeurs = barres empilées
 * - `series` : [{ variant }] aligné sur values (couleurs tokens)
 * - `highlightLast` : dernière barre pleine, les autres atténuées (historique WPM)
 * - Tooltips accessibles : chaque groupe est focusable avec un <title>,
 *   et un résumé textuel masqué accompagne le graphique.
 */
export function BarChart({
  data = [],
  series = [{ variant: 'primary' }],
  valueFormatter = (v) => String(v),
  highlightLast = false,
  ariaLabel,
  className,
}) {
  if (!data.length) return null

  const BAR_W = 26
  const GAP = 12
  const PAD = 2
  const TOP = 16
  const CHART_H = 80
  const BOTTOM_LABELS = data.some((d) => d.label)
  const BOTTOM = BOTTOM_LABELS ? 16 : 4
  const width = data.length * (BAR_W + GAP) - GAP + PAD * 2
  const height = TOP + CHART_H + BOTTOM

  const totals = data.map((d) => d.values.reduce((sum, v) => sum + (v ?? 0), 0))
  const max = Math.max(...totals, 1)

  return (
    <figure className={cn('m-0', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
        {data.map((d, i) => {
          const x = PAD + i * (BAR_W + GAP)
          const isLast = i === data.length - 1
          const dimmed = highlightLast && !isLast
          let yCursor = TOP + CHART_H
          return (
            <g key={i} tabIndex={0} className="focus:outline-none focus-visible:opacity-70">
              <title>{`${d.label ? `${d.label} : ` : ''}${valueFormatter(totals[i])}`}</title>
              <rect x={x} y={TOP} width={BAR_W} height={CHART_H} rx={4} className="fill-muted" />
              {d.values.map((v, si) => {
                const h = Math.round(((v ?? 0) / max) * CHART_H)
                if (h <= 0) return null
                yCursor -= h
                const variant = series[si]?.variant ?? 'primary'
                return (
                  <rect
                    key={si}
                    x={x}
                    y={yCursor}
                    width={BAR_W}
                    height={h}
                    rx={3}
                    className={cn(FILLS[variant] ?? FILLS.primary, dimmed && 'opacity-35')}
                  />
                )
              })}
              <text
                x={x + BAR_W / 2}
                y={TOP - 5}
                textAnchor="middle"
                className={cn(
                  'text-[9px] font-bold',
                  isLast && highlightLast ? 'fill-primary' : 'fill-muted-foreground'
                )}
              >
                {valueFormatter(totals[i])}
              </text>
              {d.label && (
                <text x={x + BAR_W / 2} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <VisuallyHidden as="p">
        {(ariaLabel ? `${ariaLabel}. ` : '') +
          data.map((d, i) => `${d.label || `Barre ${i + 1}`} : ${valueFormatter(totals[i])}`).join(' · ')}
      </VisuallyHidden>
    </figure>
  )
}
