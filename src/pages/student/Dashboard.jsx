import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle, TrendingUp, ArrowRight, Flame, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
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

  const { data: stats, isLoading } = useQuery({
    queryKey: ['progress-stats', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress')
        .select('id, completed')
        .eq('user_id', user.id)
      return {
        total: data?.length ?? 0,
        completed: data?.filter((p) => p.completed).length ?? 0,
      }
    },
    enabled: !!user,
  })

  const { data: activityData } = useQuery({
    queryKey: ['activity-streak', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercise_results')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      return data ?? []
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

  const streak = calcStreak(activityData)
  const pct = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const maxWpm = wpmHistory?.length ? Math.max(...wpmHistory.map((s) => s.wpm), 1) : 1

  return (
    <div className="max-w-4xl mx-auto">
      <OnboardingModal />

      {/* Bannière */}
      <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-6 sm:p-8 mb-6 sm:mb-8">
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
          <Link
            to="/cours"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            Voir le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 sm:h-24" />)
        ) : (
          <>
            <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{stats?.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Leçons<br className="sm:hidden" /> commencées</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{stats?.completed}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Leçons<br className="sm:hidden" /> complétées</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-3 sm:p-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-foreground">{pct}%</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">Taux de<br className="sm:hidden" /> complétion</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Barre de progression */}
      {stats?.total > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground text-sm">Progression globale</p>
            <p className="text-sm text-primary font-bold">{stats.completed}/{stats.total}</p>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{pct}% du parcours accompli</p>
        </div>
      )}

      {/* Graphique WPM */}
      {wpmHistory?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <p className="font-semibold text-foreground text-sm">Progression en dactylographie</p>
            <span className="ml-auto text-xs text-muted-foreground">
              {wpmHistory.length} session{wpmHistory.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {wpmHistory.map((s, i) => {
              const h = Math.max(4, Math.round((s.wpm / maxWpm) * 96))
              const isLast = i === wpmHistory.length - 1
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  title={`${s.wpm} mots/min`}
                >
                  <span className={`text-[10px] leading-none ${isLast ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {s.wpm}
                  </span>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-primary' : 'bg-primary/30'}`}
                    style={{ height: `${h}px` }}
                  />
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Ancienne → Récente · mots/min
          </p>
        </div>
      )}

      {stats?.total === 0 && !isLoading && (
        <div className="bg-card rounded-2xl border border-border p-8 sm:p-12 text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Commencez votre première leçon</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Explorez le catalogue et choisissez le cours qui vous correspond.</p>
          <Link
            to="/cours"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            Explorer les cours <ArrowRight className="w-4 h-4" />
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
