import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function ExerciseTimer({ duration, running, onTimeUp }) {
  const [remaining, setRemaining] = useState(duration)

  useEffect(() => {
    setRemaining(duration)
  }, [duration])

  useEffect(() => {
    if (!running || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          onTimeUp?.()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = (remaining / duration) * 100
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const urgent = running && pct <= 25 && remaining > 0

  const color = !running
    ? 'text-muted-foreground'
    : remaining === 0 ? 'text-destructive'
    : pct <= 25 ? 'text-destructive'
    : pct <= 50 ? 'text-warning'
    : 'text-success'

  const barColor = !running
    ? 'bg-muted-foreground/30'
    : remaining === 0 ? 'bg-destructive'
    : pct <= 25 ? 'bg-destructive'
    : pct <= 50 ? 'bg-warning'
    : 'bg-success'

  return (
    <div className="flex items-center gap-3">
      <div
        role="timer"
        aria-label={`Temps restant : ${mins} minute${mins > 1 ? 's' : ''} et ${secs} seconde${secs > 1 ? 's' : ''}`}
        className={`flex items-center gap-1.5 font-mono font-bold text-base tabular-nums shrink-0 ${color}`}
      >
        <Clock className={`w-4 h-4 shrink-0 ${urgent ? 'animate-pulse motion-reduce:animate-none' : ''}`} aria-hidden="true" />
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      {/* Annonce vocale uniquement aux moments clés (pas chaque seconde) */}
      <span className="sr-only" aria-live="polite">
        {remaining === 0 ? 'Temps écoulé !' : urgent ? 'Attention : il reste peu de temps.' : ''}
      </span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-1000 motion-reduce:transition-none ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!running && remaining === duration && (
        <span className="text-xs font-medium text-muted-foreground shrink-0">En attente</span>
      )}
      {remaining === 0 && (
        <span className="text-xs font-semibold text-destructive shrink-0">Temps écoulé !</span>
      )}
    </div>
  )
}
