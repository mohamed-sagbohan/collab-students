import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Eye, EyeOff, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'
import { PageHeader } from '../../components/ui/PageHeader'
import { TableShell, Table, THead, TH, TBody, TR, TD, MobileCards } from '../../components/ui/Table'

export default function AdminCourses() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success(variables.published ? 'Cours dépublié.' : 'Cours publié !')
    },
    onError: () => toast.error('Impossible de modifier la publication. Réessayez.'),
  })

  const deleteCourse = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Cours supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer le cours. Réessayez.'),
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

      <PageHeader
        eyebrow="Administration"
        title="Cours"
        description={isLoading ? '—' : `${courses?.length} cours · ${published} publiés`}
      />

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
        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-card">

          {/* Table desktop */}
          <TableShell stickyHeader>
            <Table>
              <THead sticky>
                <TH>Cours</TH>
                <TH>Formateur</TH>
                <TH align="center">Leçons</TH>
                <TH align="center">Statut</TH>
                <TH align="right"><span className="sr-only">Actions</span></TH>
              </THead>
              <TBody>
                {courses.map((course, i) => (
                  <TR key={course.id} delay={Math.min(i, 12) * 30}>
                    <TD>
                      <p className="font-semibold text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{course.description}</p>
                    </TD>
                    <TD className="text-muted-foreground text-sm">
                      {course.profiles?.name ?? '—'}
                    </TD>
                    <TD align="center">
                      <span className="text-sm font-bold text-foreground">{course.lessons?.length ?? 0}</span>
                    </TD>
                    <TD align="center">
                      <button
                        onClick={() => togglePublished.mutate({ id: course.id, published: course.published })}
                        aria-label={course.published ? `Dépublier le cours ${course.title}` : `Publier le cours ${course.title}`}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          course.published
                            ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                            : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
                        }`}
                      >
                        {course.published
                          ? <><Eye className="w-3 h-3" aria-hidden="true" /> Publié</>
                          : <><EyeOff className="w-3 h-3" aria-hidden="true" /> Brouillon</>
                        }
                      </button>
                    </TD>
                    <TD align="right">
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        aria-label={`Supprimer le cours ${course.title}`}
                        className="inline-flex items-center justify-center w-11 h-11 -my-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>

          {/* Cards mobile */}
          <MobileCards>
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
                    className="inline-flex items-center justify-center w-11 h-11 -m-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <button
                  onClick={() => togglePublished.mutate({ id: course.id, published: course.published })}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    course.published
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-warning/10 text-warning border-warning/20'
                  }`}
                >
                  {course.published
                    ? <><Eye className="w-3 h-3" /> Publié</>
                    : <><EyeOff className="w-3 h-3" /> Brouillon</>
                  }
                </button>
              </div>
            ))}
          </MobileCards>

        </div>
      )}

    </div>
  )
}
