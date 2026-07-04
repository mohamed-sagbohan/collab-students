import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router'
import { BookOpen, Plus, Eye, EyeOff, Trash2, Pencil, PlusCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { accentFor } from '../../lib/accents'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { buttonVariants } from '../../components/ui/Button'
import { PublishBadge } from '../../components/ui/StatusBadge'
import { useToast } from '../../components/ui/Toast'

export default function CourseEditor() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const location = useLocation()
  const confirm = useConfirm()
  const toast = useToast()
  const isAdmin = profile?.role === 'admin'
  const base = isAdmin ? '/admin/editeur' : '/formateur/editeur'

  const { data: courses, isLoading } = useQuery({
    queryKey: ['editor-courses', user?.id],
    queryFn: async () => {
      let q = supabase
        .from('courses')
        .select('id, title, description, published, created_at, lessons(id)')
        .order('created_at', { ascending: false })

      if (!isAdmin) {
        q = q.eq('instructor_id', user.id)
      }

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })

  const togglePublished = useMutation({
    mutationFn: async ({ id, published }) => {
      const { error } = await supabase.from('courses').update({ published: !published }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['editor-courses', user?.id] })
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
      queryClient.invalidateQueries({ queryKey: ['editor-courses', user?.id] })
      toast.success('Cours supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer le cours. Réessayez.'),
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Éditeur de cours
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {isAdmin ? 'Tous les cours' : 'Mes cours'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Créez et modifiez vos cours et leçons.</p>
        </div>
        <Link
          to={`${base}/nouveau`}
          className={cn(buttonVariants(), 'shrink-0 w-full sm:w-auto')}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouveau cours
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}

      {!isLoading && courses?.length === 0 && (
        <EmptyState
          icon={PlusCircle}
          title="Aucun cours pour l'instant"
          description="Créez votre premier cours et ajoutez-y des leçons."
          className="p-10 sm:p-14"
          action={
            <Link to={`${base}/nouveau`} className={buttonVariants()}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Créer un cours
            </Link>
          }
        />
      )}

      {!isLoading && courses?.length > 0 && (
        <div className="space-y-3">
          {courses.map((course, i) => {
            const accent = accentFor(i)
            return (
            <div
              key={course.id}
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              className="animate-in fade-in slide-in-from-bottom-1 bg-card border border-border rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:border-primary/20 hover:shadow-sm transition-all"
            >
              {/* Icône */}
              <div className={`w-10 h-10 ${accent.bg} border ${accent.border} rounded-xl flex items-center justify-center shrink-0`}>
                <BookOpen className={`w-5 h-5 ${accent.icon}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-foreground text-sm">{course.title}</p>
                  <PublishBadge published={course.published} />
                </div>
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">{course.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {course.lessons?.length ?? 0} leçon{(course.lessons?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => togglePublished.mutate({ id: course.id, published: course.published })}
                  title={course.published ? 'Dépublier' : 'Publier'}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <Link
                  to={`${base}/${course.id}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Supprimer ce cours ?',
                      description: `"${course.title}" et toutes ses leçons seront définitivement supprimés. Cette action est irréversible.`,
                      confirmLabel: 'Supprimer',
                      danger: true,
                    })
                    if (ok) deleteCourse.mutate(course.id)
                  }}
                  aria-label={`Supprimer le cours ${course.title}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
