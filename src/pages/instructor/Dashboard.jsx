import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { BookOpen, Eye, EyeOff, PlusCircle, Activity, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { StatCard } from '../../components/ui/StatCard'

export default function InstructorDashboard() {
  // Charge tous les cours publiés accessibles (pas seulement ceux du formateur)
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-all-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description, published, created_at,
          lessons(count),
          profiles:instructor_id (name)
        `)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  // Compte les résultats d'exercices globaux pour ce tableau de bord
  const { data: activityStats } = useQuery({
    queryKey: ['instructor-activity-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const [totalRes, todayRes, studentsRes] = await Promise.all([
        supabase.from('exercise_results').select('id', { count: 'exact', head: true }),
        supabase.from('exercise_results').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('exercise_results').select('user_id'),
      ])
      const uniqueStudents = new Set(studentsRes.data?.map((r) => r.user_id) ?? []).size
      return {
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        students: uniqueStudents,
      }
    },
  })

  const published = courses?.filter((c) => c.published).length ?? 0

  return (
    <div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            Espace formateur
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1 text-sm">Vue d'ensemble du catalogue et des apprenants.</p>
        </div>
        <Link
          to="/formateur/suivi"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 shrink-0"
        >
          <Activity className="w-4 h-4" />
          Suivi en direct
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 sm:h-28" />)
        ) : (
          [
            { label: 'Cours au total', value: courses?.length ?? 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { label: 'Cours publiés', value: published, icon: Eye, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: "Exercices aujourd'hui", value: activityStats?.today ?? 0, icon: Activity, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
            { label: 'Apprenants actifs', value: activityStats?.students ?? 0, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          ].map((card, i) => <StatCard key={card.label} {...card} delay={i * 60} />)
        )}
      </div>

      {/* Lien vers le suivi */}
      <Link
        to="/formateur/suivi"
        className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 mb-6 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/8 transition-all duration-200 group"
      >
        <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground">Suivi en direct des exercices</p>
          <p className="text-sm text-muted-foreground mt-0.5">Voyez les résultats des apprenants en temps réel.</p>
        </div>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          Ouvrir →
        </span>
      </Link>

      {/* Liste des cours */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && courses?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">Catalogue de cours ({courses.length})</h2>
          </div>

          {/* Table desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cours</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formateur</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leçons</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {courses.map((course, i) => (
                  <tr
                    key={course.id}
                    style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                    className="animate-in fade-in hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{course.title}</p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{course.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {course.profiles?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-lg font-medium border border-border">
                        <BookOpen className="w-3 h-3" />
                        {course.lessons?.[0]?.count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        course.published
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {course.published
                          ? <><Eye className="w-3 h-3" /> Publié</>
                          : <><EyeOff className="w-3 h-3" /> Brouillon</>
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="sm:hidden divide-y divide-border/50">
            {courses.map((course) => (
              <div key={course.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-foreground text-sm leading-snug">{course.title}</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    course.published
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {course.published ? <><Eye className="w-3 h-3" />Publié</> : <><EyeOff className="w-3 h-3" />Brouillon</>}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {course.lessons?.[0]?.count ?? 0} leçon{(course.lessons?.[0]?.count ?? 0) !== 1 ? 's' : ''}
                  </span>
                  {course.profiles?.name && <><span>·</span><span>{course.profiles.name}</span></>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
