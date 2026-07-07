import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, Zap, Target, Users, Clock, Wifi, WifiOff, Keyboard, CheckCircle, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useOnlineStudents } from '../../hooks/useChat'
import { Skeleton } from '../../components/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PageHeader } from '../../components/ui/PageHeader'

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
    const variant = wpm >= 50 ? 'success' : wpm >= 30 ? 'primary' : wpm >= 15 ? 'warning' : 'destructive'
    return (
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge variant={variant} icon={Zap} className="font-bold">
          {wpm} wpm
        </StatusBadge>
        <span className="text-xs text-muted-foreground">{result.accuracy ?? 0}%</span>
      </div>
    )
  }
  const score = result.score_pct ?? 0
  const variant = score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive'
  return (
    <StatusBadge variant={variant} icon={Target} className="font-bold shrink-0">
      {score}%
    </StatusBadge>
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

export default function LiveMonitor() {
  const [connected, setConnected] = useState(false)
  const [newIds, setNewIds] = useState(new Set())
  const queryClient = useQueryClient()
  // Présence réelle (heartbeat < 3 min), rafraîchie par realtime + poll 20 s.
  const { data: onlineCount, isLoading: loadingOnline } = useOnlineStudents()

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
    if (!results?.length) return { total: 0, todayCount: 0, avgWpm: 0, avgScore: 0 }
    const today = new Date().toDateString()
    const todayResults = results.filter((r) => new Date(r.created_at).toDateString() === today)
    const dactyloResults = results.filter((r) => r.result_type === 'dactylographie' && r.wpm)
    const qcmResults = results.filter((r) => r.result_type === 'qcm' && r.score_pct !== null)
    const avgWpm = dactyloResults.length ? Math.round(dactyloResults.reduce((s, r) => s + r.wpm, 0) / dactyloResults.length) : 0
    const avgScore = qcmResults.length ? Math.round(qcmResults.reduce((s, r) => s + r.score_pct, 0) / qcmResults.length) : 0
    return { total: results.length, todayCount: todayResults.length, avgWpm, avgScore }
  }, [results])

  return (
    <div>
      {/* Header */}
      <PageHeader
        eyebrow="Suivi en direct"
        title="Activité des apprenants"
        description="Résultats d'exercices en temps réel."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => exportResultsCSV(results)}
              disabled={!results?.length}
              aria-label="Exporter les résultats en CSV"
            >
              <Download className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </Button>
            <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border ${
              connected
                ? 'text-success bg-success/10 border-success/20'
                : 'text-muted-foreground bg-muted border-border'
            }`}>
              {connected
                ? <><Wifi className="w-4 h-4" aria-hidden="true" /><span>En direct</span><span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" /></>
                : <><WifiOff className="w-4 h-4" aria-hidden="true" /><span>Connexion…</span></>
              }
            </div>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 sm:h-28" />)
        ) : (
          [
            { label: "Résultats aujourd'hui", value: stats.todayCount, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            {
              label: 'Apprenants en ligne',
              value: loadingOnline ? '—' : onlineCount ?? 0,
              icon: Users,
              color: 'text-violet-500',
              bg: 'bg-violet-500/10',
              border: 'border-violet-500/20',
              trailing: <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" aria-hidden="true" title="Mis à jour en temps réel" />,
            },
            { label: 'WPM moyen (dactylo)', value: stats.avgWpm || '—', icon: Keyboard, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
            { label: 'Score moyen (QCM)', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: Target, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
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
                  <Avatar name={result.profiles?.name} className="w-9 h-9" />

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
