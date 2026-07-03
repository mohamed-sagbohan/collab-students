import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Zap, Target, Users, Clock, Wifi, WifiOff, Keyboard, CheckCircle, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { EmptyState } from '../../components/ui/EmptyState'

function exportResultsCSV(results) {
  if (!results?.length) return
  const headers = ['date', 'apprenant', 'type', 'exercice', 'lecon', 'cours', 'wpm', 'precision', 'score_pct', 'duree_sec']
  const rows = results.map((r) => [
    new Date(r.created_at).toLocaleString('fr-FR'),
    r.profiles?.name ?? '',
    r.result_type,
    r.exercises?.title ?? '',
    r.exercises?.lessons?.title ?? '',
    r.exercises?.lessons?.courses?.title ?? '',
    r.wpm ?? '',
    r.accuracy ?? '',
    r.score_pct ?? '',
    r.elapsed_sec ?? '',
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => (String(v).includes(',') ? `"${v}"` : v)).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `learnit-suivi-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

const RESULT_QUERY = `
  id, result_type, score_pct, wpm, accuracy, elapsed_sec, created_at,
  profiles:user_id (name),
  exercises:exercise_id (
    title,
    lessons:lesson_id (title, courses:course_id (title))
  )
`

function ScoreBadge({ result }) {
  if (result.result_type === 'dactylographie') {
    const wpm = result.wpm ?? 0
    const color = wpm >= 50 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      : wpm >= 30 ? 'text-primary bg-primary/10 border-primary/20'
      : wpm >= 15 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-red-500 bg-red-500/10 border-red-500/20'
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
          <Zap className="w-3 h-3" /> {wpm} wpm
        </span>
        <span className="text-xs text-muted-foreground">{result.accuracy ?? 0}%</span>
      </div>
    )
  }
  const score = result.score_pct ?? 0
  const color = score >= 80 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    : score >= 50 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    : 'text-red-500 bg-red-500/10 border-red-500/20'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${color}`}>
      <Target className="w-3 h-3" /> {score}%
    </span>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `il y a ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  return `il y a ${h}h`
}

function initials(name) {
  return (name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function LiveMonitor() {
  const [connected, setConnected] = useState(false)
  const [newIds, setNewIds] = useState(new Set())
  const queryClient = useQueryClient()

  const { data: results, isLoading } = useQuery({
    queryKey: ['live-monitor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_results')
        .select(RESULT_QUERY)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 30_000,
  })

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('live-monitor')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'exercise_results' }, async (payload) => {
        const { data } = await supabase
          .from('exercise_results')
          .select(RESULT_QUERY)
          .eq('id', payload.new.id)
          .single()
        if (data) {
          setNewIds((prev) => new Set([...prev, data.id]))
          setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(data.id); return s }), 3000)
          queryClient.setQueryData(['live-monitor'], (old) => old ? [data, ...old].slice(0, 100) : [data])
        }
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  const stats = useMemo(() => {
    if (!results?.length) return { total: 0, todayCount: 0, avgWpm: 0, avgScore: 0, activeStudents: 0 }
    const today = new Date().toDateString()
    const todayResults = results.filter((r) => new Date(r.created_at).toDateString() === today)
    const dactyloResults = results.filter((r) => r.result_type === 'dactylographie' && r.wpm)
    const qcmResults = results.filter((r) => r.result_type === 'qcm' && r.score_pct !== null)
    const avgWpm = dactyloResults.length ? Math.round(dactyloResults.reduce((s, r) => s + r.wpm, 0) / dactyloResults.length) : 0
    const avgScore = qcmResults.length ? Math.round(qcmResults.reduce((s, r) => s + r.score_pct, 0) / qcmResults.length) : 0
    const activeStudents = new Set(results.map((r) => r.profiles?.name)).size
    return { total: results.length, todayCount: todayResults.length, avgWpm, avgScore, activeStudents }
  }, [results])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            Suivi en direct
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Activité des apprenants</h1>
          <p className="text-muted-foreground mt-1 text-sm">Résultats d'exercices en temps réel.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportResultsCSV(results)}
            disabled={!results?.length}
            className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-3.5 py-2 rounded-xl text-sm font-semibold hover:border-primary/40 disabled:opacity-40 transition-colors"
          >
            <Download className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>
          <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border ${
            connected
              ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
              : 'text-muted-foreground bg-muted border-border'
          }`}>
            {connected
              ? <><Wifi className="w-4 h-4" /><span>En direct</span><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></>
              : <><WifiOff className="w-4 h-4" /><span>Connexion…</span></>
            }
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 sm:h-28" />)
        ) : (
          [
            { label: "Résultats aujourd'hui", value: stats.todayCount, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { label: 'Apprenants actifs', value: stats.activeStudents, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { label: 'WPM moyen (dactylo)', value: stats.avgWpm || '—', icon: Keyboard, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
            { label: 'Score moyen (QCM)', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map((card, i) => <StatCard key={card.label} {...card} delay={i * 60} />)
        )}
      </div>

      {/* Feed */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground text-sm">Dernières soumissions</h2>
          <span className="text-xs text-muted-foreground">{results?.length ?? 0} résultats</span>
        </div>

        {isLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}

        {!isLoading && (!results || results.length === 0) && (
          <EmptyState
            icon={Activity}
            title="Aucune activité pour l'instant"
            description="Les résultats des apprenants apparaîtront ici en temps réel dès qu'ils soumettront un exercice."
            className="border-0 rounded-none p-10 sm:p-14"
          />
        )}

        {!isLoading && results && results.length > 0 && (
          <div className="divide-y divide-border/50">
            {results.map((result) => {
              const isNew = newIds.has(result.id)
              const courseName = result.exercises?.lessons?.courses?.title
              const lessonName = result.exercises?.lessons?.title
              const exerciseName = result.exercises?.title

              return (
                <div
                  key={result.id}
                  className={`flex items-center gap-3 px-4 sm:px-6 py-3.5 transition-colors duration-500 ${
                    isNew ? 'bg-primary/5 border-l-4 border-primary animate-in fade-in slide-in-from-top-2' : 'hover:bg-muted/30 border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {initials(result.profiles?.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {result.profiles?.name ?? 'Apprenant'}
                      </span>
                      {isNew && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.result_type === 'dactylographie'
                        ? <><Keyboard className="w-3 h-3 inline mr-1" />Dactylo</>
                        : <><CheckCircle className="w-3 h-3 inline mr-1" />QCM</>
                      }
                      {exerciseName && <> · <span className="text-foreground/70">{exerciseName}</span></>}
                      {courseName && <> · <span className="hidden sm:inline">{courseName}</span></>}
                    </p>
                  </div>

                  {/* Score + temps */}
                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreBadge result={result} />
                    <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(result.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
