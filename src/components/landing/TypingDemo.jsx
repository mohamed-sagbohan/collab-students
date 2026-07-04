import { useEffect, useState } from 'react'

const SENTENCE = 'Bonjour, je progresse à mon rythme !'
const PAUSE_TICKS = 14 // ~2 s de pause une fois la phrase terminée

/**
 * Mini-démo animée de l'exercice de frappe (mockup du hero de la landing).
 * Purement décorative (aria-hidden) ; si l'utilisateur préfère réduire les
 * animations, la phrase est affichée entièrement tapée, sans boucle.
 */
export default function TypingDemo() {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [count, setCount] = useState(reduced ? SENTENCE.length : 0)

  useEffect(() => {
    if (reduced) return
    let tick = 0
    const id = setInterval(() => {
      tick++
      if (tick > SENTENCE.length + PAUSE_TICKS) {
        tick = 0
        setCount(0)
        return
      }
      setCount(Math.min(tick, SENTENCE.length))
    }, 140)
    return () => clearInterval(id)
  }, [reduced])

  const pct = Math.round((count / SENTENCE.length) * 100)

  return (
    <div aria-hidden="true">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Exercice de frappe
      </p>
      <div className="bg-muted rounded-xl p-3.5 font-mono text-sm leading-relaxed mb-3 select-none">
        {SENTENCE.split('').map((char, i) => (
          <span
            key={i}
            className={
              i < count
                ? 'text-success'
                : i === count && !reduced
                  ? 'bg-primary/30 border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground/50'
            }
          >
            {char}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150 motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-primary shrink-0 tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}
