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
    : remaining === 0 ? 'text-red-500'
    : pct <= 25 ? 'text-red-500'
    : pct <= 50 ? 'text-amber-500'
    : 'text-emerald-500'

  const barColor = !running
    ? 'bg-muted-foreground/30'
    : remaining === 0 ? 'bg-red-500'
    : pct <= 25 ? 'bg-red-500'
    : pct <= 50 ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-1.5 font-mono font-bold text-base tabular-nums shrink-0 ${color}`}>
        <Clock className={`w-4 h-4 shrink-0 ${urgent ? 'animate-pulse' : ''}`} />
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!running && remaining === duration && (
        <span className="text-xs font-medium text-muted-foreground shrink-0">En attente</span>
      )}
      {remaining === 0 && (
        <span className="text-xs font-semibold text-red-500 shrink-0">Temps écoulé !</span>
      )}
    </div>
  )
}
