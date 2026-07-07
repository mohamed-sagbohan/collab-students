import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle, TrendingUp, ArrowRight, Flame, Zap, PlayCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { buttonVariants } from '../../components/ui/Button'
import { StatCard } from '../../components/ui/StatCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { BarChart } from '../../components/ui/BarChart'
import BadgeGrid from '../../components/BadgeGrid'
import OnboardingModal from '../../components/OnboardingModal'

function calcStreak(results) {
  if (!results?.length) return 0
  const days = [...new Set(results.map((r) => r.created_at.slice(0, 10)))].sort((a, b) => b.localeCompare(a))
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (days[0] !== today && days[0] !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1])
    const curr = new Date(days[i])
    if (Math.round((prev - curr) / 86400000) === 1) streak++
    else break
  }
  return streak
}

export default function StudentDashboard() {
  const { user, profile } = useAuth()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  // Dénominateur = TOUTES les leçons visibles (cours publiés, via RLS),
  // pas seulement celles déjà marquées : le taux reflète le vrai parcours.
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: async () => {
      const [lessonsRes, progressRes] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }),
        supabase.from('progress').select('id, completed').eq('user_id', user.id),
      ])
      return {
        totalLessons: lessonsRes.count ?? 0,
        completed: progressRes.data?.filter((p) => p.completed).length ?? 0,
      }
    },
    enabled: !!user,
  })

  // La flamme compte toute activité : exercices ET leçons complétées.
  const { data: activityData } = useQuery({
    queryKey: ['activity-streak', user?.id],
    queryFn: async () => {
      const [exRes, progRes] = await Promise.all([
        supabase
          .from('exercise_results')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('progress')
          .select('completed_at')
          .eq('user_id', user.id)
          .eq('completed', true)
          .not('completed_at', 'is', null),
      ])
      return [
        ...(exRes.data ?? []),
        ...(progRes.data ?? []).map((p) => ({ created_at: p.completed_at })),
      ]
    },
    enabled: !!user,
  })

  const { data: wpmHistory } = useQuery({
    queryKey: ['wpm-dashboard', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercise_results')
        .select('wpm, created_at')
        .eq('user_id', user.id)
        .eq('result_type', 'dactylographie')
        .not('wpm', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)
      return (data ?? []).reverse()
    },
    enabled: !!user,
  })

  // Carte « Reprendre » : pointe la PROCHAINE leçon à faire du dernier
  // cours travaillé (pas la dernière terminée — on avance, on ne relit pas).
  const { data: resume } = useQuery({
    queryKey: ['last-activity', user?.id],
    queryFn: async () => {
      const { data: last } = await supabase
        .from('progress')
        .select('lesson_id, completed_at, lessons:lesson_id(id, title, course_id, courses:course_id(title))')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const courseId = last?.lessons?.course_id
      if (!courseId) return null

      const [lessonsRes, progRes] = await Promise.all([
        supabase.from('lessons').select('id, title, order_index').eq('course_id', courseId).order('order_index'),
        supabase.from('progress').select('lesson_id, completed').eq('user_id', user.id),
      ])
      const doneSet = new Set((progRes.data ?? []).filter((p) => p.completed).map((p) => p.lesson_id))
      const nextLesson = (lessonsRes.data ?? []).find((l) => !doneSet.has(l.id)) ?? null

      return {
        courseId,
        courseTitle: last.lessons.courses?.title,
        nextLesson, // null = cours terminé
      }
    },
    enabled: !!user,
  })

  const streak = calcStreak(activityData)
  const pct = stats?.totalLessons ? Math.round((stats.completed / stats.totalLessons) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto">
      <OnboardingModal />

      {/* Bannière */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-6 sm:p-8 mb-6 sm:mb-8 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 right-24 w-32 h-32 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {streak > 0 ? (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                <Flame className="w-3 h-3" />
                {streak} jour{streak > 1 ? 's' : ''} de suite
              </div>
            ) : (
              <div className="inline-flex items-center bg-muted text-muted-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                {greeting}
              </div>
            )}
            {streak > 0 && (
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {greeting}
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">{profile?.name} 👋</h1>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm">Continuez votre apprentissage là où vous vous êtes arrêté.</p>
          <Link to="/cours" className={buttonVariants()}>
            Voir le catalogue <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          {/* Progression globale intégrée au héros */}
          {stats?.totalLessons > 0 && stats?.completed > 0 && (
            <div className="mt-6 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">Progression globale</p>
                <p className="text-xs text-primary font-bold">{stats.completed}/{stats.totalLessons} leçons · {pct}%</p>
              </div>
              <ProgressBar value={stats.completed} max={stats.totalLessons} size="lg" sheen label="Progression globale du parcours" />
            </div>
          )}
        </div>
      </div>

      {/* Erreur de chargement */}
      {isError && (
        <div role="alert" className="flex items-center gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm px-5 py-4 rounded-xl mb-5 sm:mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Impossible de charger vos statistiques. Vérifiez votre connexion puis rechargez la page.
        </div>
      )}

      {/* Reprise rapide : directement la prochaine leçon à faire */}
      {resume && (
        <Link
          to={
            resume.nextLesson
              ? `/cours/${resume.courseId}/lecons/${resume.nextLesson.id}`
              : '/cours'
          }
          className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 shadow-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group"
        >
          <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">
              {resume.nextLesson ? 'Continuer là où vous en étiez' : 'Cours terminé, bravo !'}
            </p>
            <p className="font-bold text-foreground text-sm truncate">{resume.courseTitle}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {resume.nextLesson
                ? `Prochaine leçon : ${resume.nextLesson.title}`
                : 'Choisissez votre prochain cours dans le catalogue.'}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" aria-hidden="true" />
        </Link>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 sm:h-24" />)
        ) : (
          <>
            <StatCard icon={BookOpen} label="Leçons au programme" value={stats?.totalLessons ?? 0} />
            <StatCard
              icon={CheckCircle}
              label="Leçons complétées"
              value={stats?.completed ?? 0}
              color="text-success"
              bg="bg-success/10"
              border="border-success/20"
              delay={60}
            />
            <StatCard
              icon={TrendingUp}
              label="Progression"
              value={`${pct}%`}
              color="text-warning"
              bg="bg-warning/10"
              border="border-warning/20"
              delay={120}
            />
          </>
        )}
      </div>

      {/* Graphique WPM */}
      {wpmHistory?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
            <p className="font-semibold text-foreground text-sm">Progression en dactylographie</p>
            <span className="ml-auto text-xs text-muted-foreground">
              {wpmHistory.length} session{wpmHistory.length > 1 ? 's' : ''}
            </span>
          </div>
          <BarChart
            data={wpmHistory.map((s) => ({ label: '', values: [s.wpm] }))}
            highlightLast
            ariaLabel="Progression en dactylographie, en mots par minute, de la plus ancienne à la plus récente session"
          />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Ancienne → Récente · mots/min
          </p>
        </div>
      )}

      {stats?.completed === 0 && !isLoading && (
        <div className="bg-card rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center mb-6 sm:mb-8">
          <div className="relative w-fit mx-auto mb-5">
            <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Commencez votre première leçon</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Explorez le catalogue et choisissez le cours qui vous correspond.</p>
          <Link to="/cours" className={buttonVariants()}>
            Explorer les cours <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Badges */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <BadgeGrid />
      </div>

    </div>
  )
}
