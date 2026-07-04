import { useQuery } from '@tanstack/react-query'
import { BarChart3, Users, BookOpen, Zap, Target, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart } from '../../components/ui/BarChart'
import { ProgressBar } from '../../components/ui/ProgressBar'

function exportCSV(rows, filename) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      headers.map((h) => {
        const v = r[h] ?? ''
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
      }).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function MiniBar({ value, max, variant, label }) {
  return (
    <div className="flex items-center gap-3">
      <ProgressBar value={value} max={max} variant={variant} size="sm" label={label} className="flex-1" />
      <span className="text-xs font-bold text-foreground w-6 text-right shrink-0">{value}</span>
    </div>
  )
}

export default function AdminAnalytics() {
  // Résultats des 7 derniers jours
  const { data: dailyStats, isLoading: loadingDaily } = useQuery({
    queryKey: ['analytics-daily'],
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data } = await supabase
        .from('exercise_results')
        .select('created_at, result_type, wpm, score_pct')
        .gte('created_at', since)
        .order('created_at')

      if (!data) return []
      const byDay = {}
      data.forEach((r) => {
        const day = new Date(r.created_at).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
        if (!byDay[day]) byDay[day] = { day, total: 0, dactylo: 0, qcm: 0 }
        byDay[day].total++
        if (r.result_type === 'dactylographie') byDay[day].dactylo++
        else byDay[day].qcm++
      })
      return Object.values(byDay)
    },
  })

  // Stats globales
  const { data: globalStats, isLoading: loadingGlobal } = useQuery({
    queryKey: ['analytics-global'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: totalExercises },
        { count: totalResults },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('exercise_results').select('*', { count: 'exact', head: true }),
        supabase.from('progress').select('*', { count: 'exact', head: true }).eq('completed', true),
      ])
      return { totalUsers, totalCourses, totalExercises, totalResults }
    },
  })

  // Top cours par leçons complétées
  const { data: topCourses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['analytics-top-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress')
        .select('lesson_id, lessons:lesson_id(course_id, courses:course_id(title))')
        .eq('completed', true)

      if (!data) return []
      const byCourse = {}
      data.forEach((p) => {
        const title = p.lessons?.courses?.title
        if (!title) return
        byCourse[title] = (byCourse[title] ?? 0) + 1
      })
      return Object.entries(byCourse)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    },
  })

  // Apprenants les plus actifs
  const { data: topStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['analytics-top-students'],
    queryFn: async () => {
      const { data } = await supabase
        .from('exercise_results')
        .select('user_id, profiles:user_id(name)')
        .order('created_at', { ascending: false })
        .limit(500)

      if (!data) return []
      const byUser = {}
      data.forEach((r) => {
        const name = r.profiles?.name ?? 'Inconnu'
        byUser[name] = (byUser[name] ?? 0) + 1
      })
      return Object.entries(byUser)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    },
  })

  async function handleExportAll() {
    const { data } = await supabase
      .from('exercise_results')
      .select(`
        id, result_type, score_pct, wpm, accuracy, elapsed_sec, created_at,
        profiles:user_id(name),
        exercises:exercise_id(title, lessons:lesson_id(title, courses:course_id(title)))
      `)
      .order('created_at', { ascending: false })
      .limit(5000)

    const rows = (data ?? []).map((r) => ({
      date: new Date(r.created_at).toLocaleString('fr-FR'),
      apprenant: r.profiles?.name ?? '',
      type: r.result_type,
      exercice: r.exercises?.title ?? '',
      lecon: r.exercises?.lessons?.title ?? '',
      cours: r.exercises?.lessons?.courses?.title ?? '',
      wpm: r.wpm ?? '',
      precision: r.accuracy ?? '',
      score_pct: r.score_pct ?? '',
      duree_sec: r.elapsed_sec ?? '',
    }))
    exportCSV(rows, `learnit-resultats-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const maxCourse = topCourses.length ? topCourses[0].count : 1
  const maxStudent = topStudents.length ? topStudents[0].count : 1

  const isLoading = loadingGlobal || loadingDaily || loadingCourses || loadingStudents

  return (
    <div>
      {/* Header */}
      <PageHeader
        eyebrow="Analytics"
        eyebrowIcon={BarChart3}
        title="Statistiques de la plateforme"
        description="Vue d'ensemble de l'activité des apprenants."
        actions={
          <Button variant="secondary" onClick={handleExportAll}>
            <Download className="w-4 h-4 text-primary" aria-hidden="true" />
            Exporter tout (CSV)
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : [
          { label: 'Utilisateurs', value: globalStats?.totalUsers ?? 0,    icon: Users,     color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
          { label: 'Cours publiés',  value: globalStats?.totalCourses ?? 0,  icon: BookOpen,  color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20' },
          { label: 'Exercices faits',value: globalStats?.totalExercises ?? 0,icon: Zap,       color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20' },
          { label: 'Leçons complétées',value: globalStats?.totalResults ?? 0,icon: Target,    color: 'text-success',bg: 'bg-success/10',border: 'border-success/20' },
        ].map((card, i) => <StatCard key={card.label} {...card} delay={i * 60} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Activité 7 jours */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-1 duration-500">
          <h2 className="font-bold text-foreground text-sm mb-4">Activité — 7 derniers jours</h2>
          {loadingDaily ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
          ) : dailyStats?.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucune donnée sur cette période.</p>
          ) : (
            <div>
              <BarChart
                data={dailyStats.map((d) => ({ label: d.day.split(' ')[0], values: [d.dactylo, d.qcm] }))}
                series={[{ variant: 'primary' }, { variant: 'warning' }]}
                ariaLabel="Nombre d'exercices réalisés par jour sur les 7 derniers jours, dactylographie et QCM empilés"
              />
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" aria-hidden="true" /><span className="text-xs text-muted-foreground">Dactylo</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-warning" aria-hidden="true" /><span className="text-xs text-muted-foreground">QCM</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Top cours */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: '80ms' }}>
          <h2 className="font-bold text-foreground text-sm mb-4">Top cours (leçons complétées)</h2>
          {loadingCourses ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : topCourses.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucune donnée disponible pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {topCourses.map((c, i) => (
                <div key={c.title}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-primary w-4 shrink-0">#{i + 1}</span>
                      <span className="text-xs text-foreground truncate">{c.title}</span>
                    </div>
                  </div>
                  <MiniBar value={c.count} max={maxCourse} variant="primary" label={`Leçons complétées : ${c.title}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top apprenants */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: '160ms' }}>
          <h2 className="font-bold text-foreground text-sm mb-4">Apprenants les plus actifs</h2>
          {loadingStudents ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : topStudents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Aucune donnée disponible pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {topStudents.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-violet-400 w-4 shrink-0">#{i + 1}</span>
                      <span className="text-xs text-foreground truncate">{s.name}</span>
                    </div>
                  </div>
                  <MiniBar value={s.count} max={maxStudent} variant="violet" label={`Exercices réalisés : ${s.name}`} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
