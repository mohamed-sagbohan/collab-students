import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { CheckCircle, ArrowLeft, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { sanitizeLessonHtml } from '../../lib/sanitizeHtml'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import ExerciseRunner from '../../components/exercises/ExerciseRunner'
import { useKeyboardType, KeyboardSelector, KeyboardCheatSheet } from '../../components/KeyboardSetup'
import LessonComments from '../../components/LessonComments'

export default function LessonReader() {
  const { courseId, lessonId } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [kbType, selectKb, resetKb] = useKeyboardType()
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      setReadProgress(scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lessonId])

  const { data: lesson, isLoading, error } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, content, exercises(id, title, questions(type))')
        .eq('id', lessonId)
        .single()
      if (error) throw error
      return data
    },
  })

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id, lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle()
      return data
    },
    enabled: !!user,
  })

  const markComplete = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
    },
    onError: () => toast.error("Impossible d'enregistrer votre progression. Vérifiez votre connexion et réessayez."),
  })

  // Vérifie si la leçon contient au moins un exercice de dactylographie
  const hasDactylo = lesson?.exercises?.some((ex) =>
    ex.questions?.some((q) => q.type === 'dactylographie')
  )

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
      </div>
    </div>
  )

  if (error) return <p className="text-destructive">Leçon introuvable.</p>

  // Sélecteur de clavier (modal, bloque l'accès si dactylo et pas encore choisi)
  if (hasDactylo && !kbType) {
    return (
      <>
        {/* Fond visible derrière le modal */}
        <div className="max-w-3xl mx-auto opacity-30 pointer-events-none select-none" aria-hidden>
          <h1 className="text-2xl font-extrabold text-foreground mb-4">{lesson?.title}</h1>
          <div className="bg-card border border-border rounded-2xl p-6 h-40" />
        </div>
        <KeyboardSelector onSelect={selectKb} />
      </>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Barre de progression de lecture */}
      <div className="fixed top-14 sm:top-16 left-0 right-0 h-0.5 bg-transparent z-30 pointer-events-none">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <Link
        to={`/cours/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour au cours
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">{lesson?.title}</h1>

      {/* Contenu de la leçon */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
        <div
          className="lesson-content prose prose-sm sm:prose max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-table:border prose-table:border-border
            prose-th:bg-muted prose-th:text-foreground
            prose-td:border prose-td:border-border"
          dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(lesson?.content) }}
        />
      </div>

      {/* Footer */}
      <div className="border border-border rounded-2xl p-5 sm:p-6 bg-card">
        {progress?.completed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Leçon complétée !</p>
              <p className="text-xs text-muted-foreground">Votre progression a été enregistrée.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-foreground text-sm mb-0.5">Vous avez terminé cette leçon ?</p>
              <p className="text-xs text-muted-foreground">Validez pour enregistrer votre progression.</p>
            </div>
            <Button
              onClick={() => markComplete.mutate()}
              loading={markComplete.isPending}
              className="shrink-0 w-full sm:w-auto"
            >
              {!markComplete.isPending && <CheckCircle className="w-4 h-4" aria-hidden="true" />}
              {markComplete.isPending ? 'Enregistrement...' : 'Marquer comme terminée'}
            </Button>
          </div>
        )}
      </div>

      {/* Exercices */}
      {lesson?.exercises?.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              Exercice{lesson.exercises.length > 1 ? 's' : ''} de la leçon
            </h2>
          </div>

          {/* Fiche de raccourcis clavier si dactylo */}
          {hasDactylo && kbType && (
            <KeyboardCheatSheet type={kbType} onReset={resetKb} />
          )}

          {lesson.exercises.map((ex) => (
            <div key={ex.id} className="border border-border rounded-2xl p-5 sm:p-6 bg-card">
              <ExerciseRunner exerciseId={ex.id} />
            </div>
          ))}
        </div>
      )}

      {/* Commentaires */}
      <LessonComments lessonId={lessonId} />

    </div>
  )
}
