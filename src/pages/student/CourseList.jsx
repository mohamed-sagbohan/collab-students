import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { BookOpen, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { accentFor } from '../../lib/accents'

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'in-progress', label: 'En cours' },
  { id: 'done', label: 'Terminés' },
  { id: 'new', label: 'Nouveaux' },
]

export default function CourseList() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('catalog')

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, lessons(count)')
        .eq('published', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  // Progression de l'apprenant, agrégée par cours côté client (lecture seule)
  const { data: progressRows = [] } = useQuery({
    queryKey: ['my-course-progress', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress')
        .select('lesson_id, completed, lessons:lesson_id(course_id)')
        .eq('user_id', user.id)
      return data ?? []
    },
    enabled: !!user,
  })

  const doneByCourse = useMemo(() => {
    const map = {}
    progressRows.forEach((p) => {
      const cid = p.lessons?.course_id
      if (!cid || !p.completed) return
      map[cid] = (map[cid] ?? 0) + 1
    })
    return map
  }, [progressRows])

  const visibleCourses = useMemo(() => {
    let list = courses ?? []
    if (filter !== 'all') {
      list = list.filter((c) => {
        const count = c.lessons?.[0]?.count ?? 0
        const done = doneByCourse[c.id] ?? 0
        if (filter === 'new') return done === 0
        if (filter === 'done') return count > 0 && done >= count
        return done > 0 && done < count // en cours
      })
    }
    if (sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    }
    return list
  }, [courses, filter, sort, doneByCourse])

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Catalogue de cours</h1>
        <p className="text-muted-foreground mt-1 text-sm">Choisissez un cours pour commencer à apprendre.</p>
      </div>

      {/* Filtres + tri (100 % côté client) */}
      {!isLoading && !error && courses?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5 sm:mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                'px-4 min-h-11 rounded-full text-sm font-medium border transition-colors',
                filter === f.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
              )}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Trier
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 bg-card border border-border rounded-xl px-3 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="catalog">Ordre du catalogue</option>
              <option value="title">Titre A → Z</option>
            </select>
          </label>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-5 py-4 rounded-xl">
          Impossible de charger les cours. Vérifiez votre connexion.
        </div>
      )}

      {!isLoading && !error && courses?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours disponible"
          description="Les formateurs n'ont pas encore publié de cours."
          className="p-12"
        />
      )}

      {!isLoading && !error && courses?.length > 0 && visibleCourses.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours dans cette catégorie"
          description="Modifiez le filtre pour voir les autres cours."
          action={
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Afficher tous les cours
            </button>
          }
        />
      )}

      {!isLoading && !error && visibleCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visibleCourses.map((course, i) => {
            const accent = accentFor(i)
            const count = course.lessons?.[0]?.count ?? 0
            const done = doneByCourse[course.id] ?? 0
            const finished = count > 0 && done >= count

            return (
              <Link
                key={course.id}
                to={`/cours/${course.id}`}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-2 bg-card border border-border rounded-3xl overflow-hidden shadow-card hover:border-primary/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {/* Header carte */}
                <div className={`${accent.bg} border-b ${accent.border} p-5 flex items-center justify-between`}>
                  <div className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center`}>
                    <BookOpen className={`w-5 h-5 ${accent.icon}`} />
                  </div>
                  <span className={`text-xs font-semibold ${accent.icon} flex items-center gap-1.5`}>
                    <Clock className="w-3 h-3" />
                    {count} leçon{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Contenu */}
                <div className="p-5">
                  <h2 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  )}
                  {/* Progression de l'apprenant sur ce cours */}
                  {done > 0 && !finished && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          {done}/{count} leçon{done > 1 ? 's' : ''} terminée{done > 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {count > 0 ? Math.round((done / count) * 100) : 0}%
                        </span>
                      </div>
                      <ProgressBar value={done} max={count} size="sm" label={`Progression du cours ${course.title}`} />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {finished ? (
                      <StatusBadge variant="success" icon={CheckCircle}>Terminé</StatusBadge>
                    ) : done > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${accent.dot}`} aria-hidden="true" />
                        <span className="text-xs text-muted-foreground font-medium">En cours</span>
                      </div>
                    ) : (
                      <StatusBadge variant="primary">Nouveau</StatusBadge>
                    )}
                    <span className="text-xs text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {finished ? 'Revoir' : done > 0 ? 'Continuer' : 'Commencer'}
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
