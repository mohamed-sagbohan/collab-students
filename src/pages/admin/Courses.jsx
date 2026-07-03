import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Eye, EyeOff, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'

export default function AdminCourses() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description, published, created_at,
          profiles:instructor_id (name),
          lessons (id)
        `)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const togglePublished = useMutation({
    mutationFn: async ({ id, published }) => {
      const { error } = await supabase
        .from('courses')
        .update({ published: !published })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  })

  const deleteCourse = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  })

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'Supprimer ce cours ?',
      description: `"${title}" et toutes ses leçons seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (ok) deleteCourse.mutate(id)
  }

  const published = courses?.filter((c) => c.published).length ?? 0

  return (
    <div>

      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          Administration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Cours</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading ? '—' : `${courses?.length} cours · ${published} publiés`}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours"
          description="Lancez le seed SQL pour importer le catalogue."
        />
      )}

      {!isLoading && courses?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">

          {/* Table desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cours</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formateur</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leçons</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {courses.map((course, i) => (
                  <tr
                    key={course.id}
                    style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                    className="animate-in fade-in hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{course.description}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {course.profiles?.name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-foreground">{course.lessons?.length ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePublished.mutate({ id: course.id, published: course.published })}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          course.published
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                        }`}
                      >
                        {course.published
                          ? <><Eye className="w-3 h-3" /> Publié</>
                          : <><EyeOff className="w-3 h-3" /> Brouillon</>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        aria-label={`Supprimer le cours ${course.title}`}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.profiles?.name} · {course.lessons?.length ?? 0} leçon{course.lessons?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    aria-label={`Supprimer le cours ${course.title}`}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => togglePublished.mutate({ id: course.id, published: course.published })}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    course.published
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {course.published
                    ? <><Eye className="w-3 h-3" /> Publié</>
                    : <><EyeOff className="w-3 h-3" /> Brouillon</>
                  }
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
