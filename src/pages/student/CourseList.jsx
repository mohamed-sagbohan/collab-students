import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { BookOpen, ArrowRight, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

const CARD_ACCENTS = [
  { bg: 'bg-primary/10', border: 'border-primary/20', icon: 'text-primary', dot: 'bg-primary' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-500', dot: 'bg-amber-500' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-500', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-500', dot: 'bg-violet-500' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'text-rose-500', dot: 'bg-rose-500' },
  { bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: 'text-sky-500', dot: 'bg-sky-500' },
]

export default function CourseList() {
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

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Catalogue de cours</h1>
        <p className="text-muted-foreground mt-1 text-sm">Choisissez un cours pour commencer à apprendre.</p>
      </div>

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

      {!isLoading && !error && courses?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {courses.map((course, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
            const count = course.lessons?.[0]?.count ?? 0

            return (
              <Link
                key={course.id}
                to={`/cours/${course.id}`}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-2 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
                      <span className="text-xs text-muted-foreground font-medium">Disponible</span>
                    </div>
                    <span className="text-xs text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Commencer <ArrowRight className="w-3 h-3" />
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
