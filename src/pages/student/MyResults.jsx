import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { ClipboardList, Trophy, Keyboard, RotateCcw, ChevronRight, Target, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatCard } from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/StatusBadge'

/** Seuil de réussite d'un quiz — aligné sur le trigger de la migration 029. */
const PASS_PCT = 60

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function scoreVariant(pct) {
  if (pct >= 80) return 'success'
  if (pct >= PASS_PCT) return 'warning'
  return 'destructive'
}

export default function MyResults() {
  const { user } = useAuth()

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ['my-results', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_results')
        .select(`
          exercise_id, result_type, score_pct, wpm, accuracy, created_at,
          exercises:exercise_id (title, lesson_id, lessons:lesson_id (title, course_id))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  // Agrégation par exercice : meilleur score / meilleur WPM + nb de tentatives.
  const { quizzes, typing, bestWpm } = useMemo(() => {
    const quizMap = new Map()
    const typingMap = new Map()
    let maxWpm = 0

    for (const r of rows) {
      const ex = r.exercises
      if (!ex) continue
      const base = {
        exerciseId: r.exercise_id,
        title: ex.title,
        lessonId: ex.lesson_id,
        lessonTitle: ex.lessons?.title,
        courseId: ex.lessons?.course_id,
      }
      if (r.result_type === 'qcm') {
        const entry = quizMap.get(r.exercise_id) ?? { ...base, best: 0, attempts: 0, lastAt: r.created_at }
        entry.attempts += 1
        entry.best = Math.max(entry.best, r.score_pct ?? 0)
        quizMap.set(r.exercise_id, entry)
      } else if (r.result_type === 'dactylographie') {
        const entry = typingMap.get(r.exercise_id) ?? { ...base, bestWpm: 0, bestAccuracy: 0, sessions: 0 }
        entry.sessions += 1
        entry.bestWpm = Math.max(entry.bestWpm, r.wpm ?? 0)
        entry.bestAccuracy = Math.max(entry.bestAccuracy, r.accuracy ?? 0)
        typingMap.set(r.exercise_id, entry)
        maxWpm = Math.max(maxWpm, r.wpm ?? 0)
      }
    }
    return { quizzes: [...quizMap.values()], typing: [...typingMap.values()], bestWpm: maxWpm }
  }, [rows])

  const passed = quizzes.filter((q) => q.best >= PASS_PCT)
  const toRetry = quizzes.filter((q) => q.best < PASS_PCT)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Mes résultats</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vos scores aux quiz et vos performances de frappe, exercice par exercice.
        </p>
      </div>

      {isError && (
        <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-5 py-4 rounded-xl">
          Impossible de charger vos résultats. Vérifiez votre connexion puis rechargez la page.
        </div>
      )}

      {!isError && rows.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Aucun résultat pour l'instant"
          description="Faites les exercices des leçons : vos scores apparaîtront ici automatiquement."
          className="p-12"
        />
      )}

      {!isError && rows.length > 0 && (
        <>
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <StatCard
              icon={Trophy}
              label="Quiz réussis"
              value={`${passed.length}/${quizzes.length}`}
              color="text-success"
              bg="bg-success/10"
              border="border-success/20"
            />
            <StatCard
              icon={Target}
              label="À retravailler"
              value={toRetry.length}
              color={toRetry.length > 0 ? 'text-warning' : undefined}
              bg={toRetry.length > 0 ? 'bg-warning/10' : undefined}
              border={toRetry.length > 0 ? 'border-warning/20' : undefined}
              delay={60}
            />
            <StatCard icon={Zap} label="Record de frappe" value={bestWpm ? `${bestWpm} mots/min` : '—'} delay={120} />
          </div>

          {/* Quiz à retravailler */}
          {toRetry.length > 0 && (
            <section aria-labelledby="retry-title" className="mb-6">
              <h2 id="retry-title" className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-warning" aria-hidden="true" />
                À retravailler
              </h2>
              <div className="space-y-2">
                {toRetry.map((q) => (
                  <Link
                    key={q.exerciseId}
                    to={`/cours/${q.courseId}/lecons/${q.lessonId}`}
                    className="flex items-center gap-3 bg-warning/5 border border-warning/20 rounded-xl p-4 hover:border-warning/40 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        Leçon : {q.lessonTitle} · meilleur score {q.best}% — objectif {PASS_PCT}%
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-warning shrink-0 flex items-center gap-1">
                      Refaire le quiz
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tous les quiz */}
          {quizzes.length > 0 && (
            <section aria-labelledby="quiz-title" className="mb-6">
              <h2 id="quiz-title" className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" aria-hidden="true" />
                Mes quiz
              </h2>
              <div className="space-y-2">
                {quizzes.map((q) => (
                  <Link
                    key={q.exerciseId}
                    to={`/cours/${q.courseId}/lecons/${q.lessonId}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {q.lessonTitle} · {q.attempts} tentative{q.attempts > 1 ? 's' : ''} · dernière le {dateFmt.format(new Date(q.lastAt))}
                      </p>
                    </div>
                    <StatusBadge variant={scoreVariant(q.best)} className="shrink-0">
                      {q.best}%
                    </StatusBadge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Dactylographie */}
          {typing.length > 0 && (
            <section aria-labelledby="typing-title">
              <h2 id="typing-title" className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" aria-hidden="true" />
                Dactylographie
              </h2>
              <div className="space-y-2">
                {typing.map((t) => (
                  <Link
                    key={t.exerciseId}
                    to={`/cours/${t.courseId}/lecons/${t.lessonId}`}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {t.lessonTitle} · {t.sessions} session{t.sessions > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-primary">{t.bestWpm} mots/min</p>
                      <p className="text-[10px] text-muted-foreground">{t.bestAccuracy}% de précision</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
