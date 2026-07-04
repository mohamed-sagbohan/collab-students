import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RotateCcw, Target, Zap, Clock, Lightbulb, MessageSquare, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'

const LEVELS = [
  { min: 0,  max: 14, label: 'Débutant',      color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     emoji: '🐢' },
  { min: 15, max: 29, label: 'Intermédiaire',  color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   emoji: '🚶' },
  { min: 30, max: 49, label: 'Avancé',         color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/20',     emoji: '🚴' },
  { min: 50, max: Infinity, label: 'Expert',   color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', emoji: '🚀' },
]

function getLevel(wpm) {
  return LEVELS.find((l) => wpm >= l.min && wpm <= l.max) ?? LEVELS[0]
}

function calcResult(typed, text, startTime) {
  const elapsedMs = startTime ? Date.now() - startTime : 1000
  const elapsedMin = elapsedMs / 1000 / 60

  let correct = 0
  const len = Math.min(typed.length, text.length)
  for (let i = 0; i < len; i++) {
    if (typed[i] === text[i]) correct++
  }

  const wpm = elapsedMin > 0 ? Math.max(0, Math.round((correct / 5) / elapsedMin)) : 0
  const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0
  const elapsedSec = Math.round(elapsedMs / 1000)

  return { wpm, accuracy, level: getLevel(wpm), correct, typed: typed.length, total: text.length, elapsedSec }
}

/* ── Appréciation et recommandations ────────────────────────── */
function getAppreciation(wpm, accuracy) {
  let message = ''
  const tips = []

  if (wpm >= 50 && accuracy >= 90) {
    message = "Performance exceptionnelle ! Vous maîtrisez parfaitement la dactylographie."
  } else if (wpm >= 50 && accuracy < 90) {
    message = "Vitesse remarquable ! Un peu plus de concentration sur la précision et vous serez parfait(e)."
  } else if (wpm >= 30 && accuracy >= 85) {
    message = "Très bon travail ! Vous avez atteint un niveau solide. Continuez à progresser !"
  } else if (wpm >= 30 && accuracy < 85) {
    message = "Belle vitesse ! Travaillez la précision pour consolider votre niveau Avancé."
  } else if (wpm >= 15 && accuracy >= 80) {
    message = "Bonne progression ! Vous êtes sur la bonne voie. La pratique régulière fera la différence."
  } else if (wpm >= 15 && accuracy < 80) {
    message = "Bon début ! Concentrez-vous d'abord sur la précision avant d'augmenter la vitesse."
  } else if (accuracy >= 75) {
    message = "Bon départ ! Votre précision est encourageante. Pratiquez chaque jour pour progresser."
  } else {
    message = "Ne vous découragez pas ! Chaque exercice vous fait progresser. La régularité est la clé."
  }

  if (accuracy < 70) {
    tips.push({ icon: '🎯', text: "Ralentissez et lisez le texte 2-3 mots à l'avance avant de taper. La précision d'abord, la vitesse viendra ensuite." })
  } else if (accuracy < 85) {
    tips.push({ icon: '👀', text: "Lisez un mot en avance pendant que vous tapez le mot actuel. Cela réduit les erreurs naturellement." })
  } else {
    tips.push({ icon: '✅', text: "Excellente précision ! Essayez maintenant d'augmenter votre cadence progressivement." })
  }

  if (wpm < 15) {
    tips.push({ icon: '⌨️', text: "Évitez de regarder le clavier. Posez vos doigts sur les touches de base (F et J ont des repères tactiles) et mémorisez leur position." })
  } else if (wpm < 30) {
    tips.push({ icon: '🖐️', text: "Utilisez tous vos doigts, pas seulement l'index. Chaque doigt est responsable de certaines touches — apprenez le placement de base." })
  } else if (wpm < 50) {
    tips.push({ icon: '🔁', text: "Entraînez-vous sur des textes variés : chiffres, symboles, majuscules. Cela développe la mémoire musculaire." })
  } else {
    tips.push({ icon: '🏆', text: "Pour aller encore plus loin, entraînez-vous sur des textes longs et techniques. Essayez aussi la vitesse avec des textes anglais." })
  }

  tips.push({ icon: '📅', text: "10 minutes de pratique quotidienne suffisent pour progresser d'un niveau en quelques semaines." })

  return { message, tips }
}

/* ── Historique WPM ──────────────────────────────────────────── */
function WpmHistoryBar({ exerciseId, userId, currentWpm }) {
  const { data: sessions } = useQuery({
    queryKey: ['wpm-history', exerciseId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercise_results')
        .select('wpm, created_at')
        .eq('exercise_id', exerciseId)
        .eq('user_id', userId)
        .eq('result_type', 'dactylographie')
        .not('wpm', 'is', null)
        .order('created_at', { ascending: false })
        .limit(9)
      return data ?? []
    },
    enabled: !!exerciseId && !!userId,
  })

  if (!sessions?.length) return null

  const reversed = [...sessions].reverse()
  const maxWpm = Math.max(...reversed.map((s) => s.wpm), currentWpm, 1)

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-amber-500" />
        <p className="text-sm font-bold text-foreground">Progression sur cet exercice</p>
        <span className="ml-auto text-[10px] text-muted-foreground">{reversed.length + 1} sessions</span>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {reversed.map((s, i) => {
          const h = Math.max(4, Math.round((s.wpm / maxWpm) * 80))
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${s.wpm} mots/min`}>
              <span className="text-[10px] text-muted-foreground leading-none">{s.wpm}</span>
              <div className="w-full bg-muted rounded-t-sm transition-all" style={{ height: `${h}px` }} />
            </div>
          )
        })}
        {/* Session actuelle (surlignée) */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0" title={`${currentWpm} mots/min — cette session`}>
          <span className="text-[10px] text-primary font-bold leading-none">{currentWpm}</span>
          <div
            className="w-full bg-primary rounded-t-sm transition-all"
            style={{ height: `${Math.max(4, Math.round((currentWpm / maxWpm) * 80))}px` }}
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">Sessions précédentes → Session actuelle</p>
    </div>
  )
}

/* ── Résultats ───────────────────────────────────────────────── */
function TypingResults({ result, text, typed, onRetry, exerciseId, userId }) {
  const { wpm, accuracy, level, elapsedSec } = result
  const { message, tips } = getAppreciation(wpm, accuracy)
  const nextLevel = LEVELS[LEVELS.findIndex((l) => l.label === level.label) + 1]

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Badge niveau + appréciation */}
      <div className={`${level.bg} border ${level.border} rounded-2xl p-5`}>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-4xl animate-in zoom-in duration-500">{level.emoji}</span>
          <div>
            <p className={`text-xl font-extrabold ${level.color}`}>{level.label}</p>
            <p className="text-sm text-muted-foreground">Votre niveau de frappe</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MessageSquare className={`w-4 h-4 shrink-0 mt-0.5 ${level.color}`} />
          <p className="text-sm text-foreground font-medium leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <p className={`text-3xl font-extrabold ${level.color}`}>{wpm}</p>
          <p className="text-xs text-muted-foreground mt-1">mots / min</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Target className={`w-5 h-5 ${accuracy >= 90 ? 'text-emerald-500' : accuracy >= 70 ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-3xl font-extrabold ${accuracy >= 90 ? 'text-emerald-500' : accuracy >= 70 ? 'text-amber-500' : 'text-red-500'}`}>{accuracy}%</p>
          <p className="text-xs text-muted-foreground mt-1">précision</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="flex justify-center mb-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-extrabold text-foreground">{elapsedSec}s</p>
          <p className="text-xs text-muted-foreground mt-1">temps</p>
        </div>
      </div>

      {/* Progression vers le niveau suivant */}
      {nextLevel && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-muted-foreground">Progression vers {nextLevel.label}</span>
            <span className="text-primary">{Math.max(0, nextLevel.min - wpm)} mots/min manquants</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            {(() => {
              const idx = LEVELS.findIndex((l) => l.label === level.label)
              const cur = LEVELS[idx]
              const pct = Math.min(100, ((wpm - cur.min) / (nextLevel.min - cur.min)) * 100)
              return <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            })()}
          </div>
        </div>
      )}

      {/* Historique WPM */}
      {exerciseId && userId && (
        <WpmHistoryBar exerciseId={exerciseId} userId={userId} currentWpm={wpm} />
      )}

      {/* Recommandations */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-bold text-foreground">Conseils pour progresser</p>
        </div>
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5 shrink-0">{tip.icon}</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>

      {/* Détail de la frappe */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Détail caractère par caractère</p>
        <div className="font-mono text-sm leading-loose break-words">
          {text.split('').map((char, i) => {
            if (i >= typed.length) return <span key={i} className="text-muted-foreground/40">{char}</span>
            return (
              <span key={i} className={typed[i] === char ? 'text-emerald-500' : 'bg-red-500/20 text-red-500 rounded'}>
                {char}
              </span>
            )
          })}
        </div>
      </div>

      <Button size="lg" onClick={onRetry} className="w-full">
        <RotateCcw className="w-4 h-4" aria-hidden="true" /> Réessayer
      </Button>
    </div>
  )
}

/* ── Composant principal ─────────────────────────────────────── */
export default function TypingExercise({ text, timeUp, onComplete, onStart, exerciseId, userId }) {
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState(null)
  const [elapsedDisplay, setElapsedDisplay] = useState(0)
  const textareaRef = useRef(null)
  const startTimeRef = useRef(null)
  const typedRef = useRef('')
  const displayIntervalRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (startTime && !finished) {
      displayIntervalRef.current = setInterval(() => {
        setElapsedDisplay(Math.round((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(displayIntervalRef.current)
  }, [startTime, finished])

  const finish = useCallback((currentTyped, currentStartTime) => {
    clearInterval(displayIntervalRef.current)
    const res = calcResult(currentTyped, text, currentStartTime)
    setResult(res)
    setFinished(true)
    onComplete?.(res)
  }, [text, onComplete])

  useEffect(() => {
    if (timeUp && !finished) {
      finish(typedRef.current, startTimeRef.current)
    }
  }, [timeUp, finished, finish])

  const handleInput = (e) => {
    const val = e.target.value
    if (val.length > text.length) return

    if (!startTimeRef.current && val.length > 0) {
      startTimeRef.current = Date.now()
      setStartTime(startTimeRef.current)
      onStart?.()
    }

    typedRef.current = val
    setTyped(val)

    if (val.length === text.length) {
      finish(val, startTimeRef.current)
    }
  }

  const handleRetry = () => {
    clearInterval(displayIntervalRef.current)
    setTyped('')
    typedRef.current = ''
    setStartTime(null)
    setElapsedDisplay(0)
    startTimeRef.current = null
    setFinished(false)
    setResult(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  if (finished && result) {
    return (
      <TypingResults
        result={result}
        text={text}
        typed={typed}
        onRetry={handleRetry}
        exerciseId={exerciseId}
        userId={userId}
      />
    )
  }

  const progress = text.length > 0 ? (typed.length / text.length) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Texte de référence */}
      <div
        className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5 font-mono text-sm sm:text-base leading-loose break-words select-none cursor-text"
        onClick={() => textareaRef.current?.focus()}
      >
        {text.split('').map((char, i) => {
          let cls = 'text-muted-foreground'
          if (i < typed.length) {
            cls = typed[i] === char
              ? 'text-emerald-500'
              : 'bg-red-500/20 text-red-500 rounded-sm'
          } else if (i === typed.length) {
            cls = 'bg-primary/30 text-foreground border-b-2 border-primary'
          }
          return (
            <span key={i} className={cls}>
              {char === ' ' && i < typed.length
                ? <span className={typed[i] === ' ' ? '' : 'bg-red-500/20'}>&nbsp;</span>
                : char}
            </span>
          )
        })}
      </div>

      {/* Progression */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>{typed.length} / {text.length} caractères</span>
          {startTime
            ? <span className="text-primary font-medium">⏱ {elapsedDisplay}s</span>
            : <span className="text-amber-500">⌨️ Commencez à taper pour démarrer le chrono</span>
          }
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Zone de saisie */}
      <textarea
        ref={textareaRef}
        value={typed}
        onChange={handleInput}
        disabled={finished}
        placeholder="Cliquez ici et commencez à taper le texte ci-dessus..."
        className="w-full font-mono text-sm p-4 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-foreground placeholder:text-muted-foreground transition-all"
        rows={4}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
      />
    </div>
  )
}
