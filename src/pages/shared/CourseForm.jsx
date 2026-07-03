import { useState, useEffect, useId } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'

export default function CourseForm() {
  const { courseId } = useParams()
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const titleId = useId()
  const descId = useId()
  const isNew = courseId === 'nouveau'
  const isAdmin = profile?.role === 'admin'
  const base = isAdmin ? '/admin/editeur' : '/formateur/editeur'

  const [title, setTitle]       = useState('')
  const [desc, setDesc]         = useState('')
  const [published, setPublished] = useState(false)
  const [saved, setSaved]       = useState(false)

  // Chargement du cours existant
  const { data: course, isLoading: loadingCourse } = useQuery({
    queryKey: ['editor-course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, published')
        .eq('id', courseId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !isNew,
  })

  useEffect(() => {
    if (course) {
      setTitle(course.title ?? '')
      setDesc(course.description ?? '')
      setPublished(course.published ?? false)
    }
  }, [course])

  // Leçons du cours
  const { data: lessons = [], isLoading: loadingLessons } = useQuery({
    queryKey: ['editor-lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .eq('course_id', courseId)
        .order('order_index')
      if (error) throw error
      return data ?? []
    },
    enabled: !isNew,
  })

  // Sauvegarde cours
  const saveCourse = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const { data, error } = await supabase
          .from('courses')
          .insert({ title, description: desc, published, instructor_id: user.id })
          .select('id')
          .single()
        if (error) throw error
        return data.id
      } else {
        const { error } = await supabase
          .from('courses')
          .update({ title, description: desc, published })
          .eq('id', courseId)
        if (error) throw error
        return courseId
      }
    },
    onSuccess: (newId) => {
      queryClient.invalidateQueries({ queryKey: ['editor-courses', user?.id] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (isNew) navigate(`${base}/${newId}`, { replace: true })
    },
  })

  // Suppression leçon
  const deleteLesson = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-lessons', courseId] }),
  })

  // Réordonner deux leçons (échange leur order_index)
  const reorderLessons = useMutation({
    mutationFn: async ({ a, b }) => {
      const { error: e1 } = await supabase.from('lessons').update({ order_index: b.order_index }).eq('id', a.id)
      if (e1) throw e1
      const { error: e2 } = await supabase.from('lessons').update({ order_index: a.order_index }).eq('id', b.id)
      if (e2) throw e2
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['editor-lessons', courseId] }),
  })

  function moveLesson(index, direction) {
    const target = index + direction
    if (target < 0 || target >= lessons.length) return
    reorderLessons.mutate({ a: lessons[index], b: lessons[target] })
  }

  const resolvedCourseId = isNew ? null : courseId

  return (
    <div className="max-w-2xl">
      {/* Retour */}
      <Link
        to={base}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Mes cours
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
        {isNew ? 'Nouveau cours' : 'Modifier le cours'}
      </h1>

      {/* Formulaire cours */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-6 space-y-4">
        <div>
          <label htmlFor={titleId} className="block text-xs font-semibold text-foreground mb-1.5">Titre du cours *</label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex : Introduction à l'informatique"
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
          />
        </div>

        <div>
          <label htmlFor={descId} className="block text-xs font-semibold text-foreground mb-1.5">Description</label>
          <textarea
            id={descId}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Brève description du contenu et des objectifs du cours…"
            rows={3}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card resize-none transition-colors"
          />
        </div>

        {/* Toggle publié */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPublished((p) => !p)}
            className={`relative w-10 h-[22px] rounded-full border transition-colors ${
              published ? 'bg-emerald-500 border-emerald-500' : 'bg-muted border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                published ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-foreground">
            {published
              ? <span className="text-emerald-500 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Publié — visible par les apprenants</span>
              : <span className="text-muted-foreground flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Brouillon — non visible</span>
            }
          </span>
        </div>

        <button
          onClick={() => saveCourse.mutate()}
          disabled={!title.trim() || saveCourse.isPending}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-primary/25"
        >
          <Save className="w-4 h-4" />
          {saveCourse.isPending ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Enregistrer le cours'}
        </button>
      </div>

      {/* Section leçons (uniquement si le cours existe déjà) */}
      {!isNew && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Leçons
              <span className="text-xs font-semibold text-muted-foreground">({lessons.length})</span>
            </h2>
            <Link
              to={`${base}/${courseId}/lecons/nouveau`}
              className="inline-flex items-center gap-1.5 bg-card border border-border text-foreground px-3.5 py-2 rounded-xl text-xs font-semibold hover:border-primary/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              Ajouter une leçon
            </Link>
          </div>

          {loadingLessons ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : lessons.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">Aucune leçon. Commencez par en ajouter une.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div
                  key={lesson.id}
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-1 flex items-center gap-3 bg-card border border-border rounded-xl p-3.5 hover:border-primary/20 transition-colors"
                >
                  <div className="flex flex-col shrink-0 -my-1">
                    <button
                      onClick={() => moveLesson(i, -1)}
                      disabled={i === 0}
                      title="Monter"
                      className="p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveLesson(i, 1)}
                      disabled={i === lessons.length - 1}
                      title="Descendre"
                      className="p-0.5 rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{lesson.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`${base}/${courseId}/lecons/${lesson.id}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Supprimer cette leçon ?',
                          description: `"${lesson.title}" sera définitivement supprimée. Cette action est irréversible.`,
                          confirmLabel: 'Supprimer',
                          danger: true,
                        })
                        if (ok) deleteLesson.mutate(lesson.id)
                      }}
                      aria-label={`Supprimer la leçon ${lesson.title}`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
