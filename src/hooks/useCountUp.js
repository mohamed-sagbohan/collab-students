import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Anime un entier de sa valeur précédente vers `target` (~0,8 s, ease-out).
 * Renvoie la cible telle quelle si elle n'est pas un nombre fini ou si
 * l'utilisateur préfère réduire les animations.
 */
export function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!Number.isFinite(target) || prefersReducedMotion()) {
      setDisplay(target)
      return
    }
    const from = fromRef.current
    if (from === target) {
      setDisplay(target)
      return
    }
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}
