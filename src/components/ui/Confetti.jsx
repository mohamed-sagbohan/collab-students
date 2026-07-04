import { useEffect, useMemo, useState } from 'react'

const COLORS = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info']

/**
 * Confettis légers en CSS pur (réussite d'exercice). À placer dans un
 * conteneur `relative` ; ne rend rien si l'utilisateur préfère réduire
 * les animations.
 */
export function Confetti({ active = false, pieces = 24, duration = 2000 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [active, duration])

  const items = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        fall: 1.2 + Math.random() * 0.8,
        size: 5 + Math.random() * 5,
        color: COLORS[i % COLORS.length],
      })),
    [pieces]
  )

  if (!visible) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p, i) => (
        <span
          key={i}
          className={`absolute -top-2 rounded-sm ${p.color}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            animation: `confetti-fall ${p.fall}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  )
}
