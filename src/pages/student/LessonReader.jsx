import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { CheckCircle, ArrowLeft, ArrowRight, Zap, Clock, HelpCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { sanitizeLessonHtml } from '../../lib/sanitizeHtml'
import { injectHeadingIds, extractHeadings, readingTimeMinutes } from '../../lib/lessonContent'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { useChatWidget } from '../../components/chat/ChatWidget'
import ExerciseRunner from '../../components/exercises/ExerciseRunner'
import { useKeyboardType, KeyboardSelector, KeyboardCheatSheet } from '../../components/KeyboardSetup'
import LessonComments from '../../components/LessonComments'

export default function LessonReader() {
  const { courseId, lessonId } = useParams()
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const chat = useChatWidget()
  const [kbType, selectKb, resetKb] = useKeyboardType()
  const [readProgress, setReadProgress] = useState(0)

  useEffect(() => {
    // Repart en haut de page quand on change de leçon (nav précédente/suivante)
    window.scrollTo({ top: 0, behavior: 'instant' })
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

  // Leçons sœurs pour la navigation précédente/suivante — même clé et même
  // requête que CourseDetail : servie depuis le cache React Query quand on
  // arrive depuis la page du cours.
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, fiche_content, youtube_videos, lessons(id, title, order_index)')
        .eq('id', courseId)
        .single()
      if (error) throw error
      return {
        ...data,
        lessons: data.lessons?.sort((a, b) => a.order_index - b.order_index),
      }
    },
  })

  const siblings = course?.lessons ?? []
  const lessonIndex = siblings.findIndex((l) => l.id === lessonId)
  const prevLesson = lessonIndex > 0 ? siblings[lessonIndex - 1] : null
  const nextLesson = lessonIndex >= 0 && lessonIndex < siblings.length - 1 ? siblings[lessonIndex + 1] : null

  // HTML sanitizé + ids d'ancres pour le sommaire, temps de lecture estimé
  const html = useMemo(() => injectHeadingIds(sanitizeLessonHtml(lesson?.content)), [lesson?.content])
  const headings = useMemo(() => extractHeadings(html), [html])
  const readMinutes = useMemo(() => readingTimeMinutes(html), [html])

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
    <div className="max-w-3xl mx-auto xl:max-w-none xl:grid xl:grid-cols-[minmax(0,48rem)_13rem] xl:justify-center xl:gap-10">

      {/* Barre de progression de lecture */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readProgress)}
        aria-label="Progression de lecture"
        className="fixed top-14 sm:top-16 left-0 right-0 h-1 bg-transparent z-30 pointer-events-none"
      >
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <div className="min-w-0">

      <Link
        to={`/cours/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        Retour au cours
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">{lesson?.title}</h1>

      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        Environ {readMinutes} min de lecture
      </p>

      {/* Contenu de la leçon */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {/* Footer */}
      <div className="border border-border rounded-2xl p-5 sm:p-6 bg-card">
        {progress?.completed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
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

      {/* Besoin d'aide : ouvre le chat avec le contexte de la leçon */}
      {profile?.role === 'apprenante' && chat && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => chat.openChat({ lesson: { id: lessonId, title: lesson?.title } })}
          >
            <HelpCircle className="w-4 h-4 text-primary" aria-hidden="true" />
            Je n'ai pas compris, poser une question
          </Button>
        </div>
      )}

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

      {/* Navigation entre leçons */}
      {(prevLesson || nextLesson) && (
        <nav aria-label="Navigation entre les leçons" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prevLesson && (
            <Link
              to={`/cours/${courseId}/lecons/${prevLesson.id}`}
              className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Leçon précédente
              </span>
              <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {prevLesson.title}
              </span>
            </Link>
          )}
          {nextLesson && (
            <Link
              to={`/cours/${courseId}/lecons/${nextLesson.id}`}
              className="group bg-card border border-border rounded-2xl p-4 text-right hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-1">
                Leçon suivante
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <span className="block text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {nextLesson.title}
              </span>
            </Link>
          )}
        </nav>
      )}

      {/* Commentaires */}
      <LessonComments lessonId={lessonId} />

      </div>

      {/* Sommaire (desktop large) */}
      {headings.length > 1 && (
        <aside className="hidden xl:block">
          <nav aria-label="Sommaire de la leçon" className="sticky top-24">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Sommaire
            </p>
            <ul className="space-y-1 border-l border-border">
              {headings.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={`block py-1 pr-2 text-sm text-muted-foreground hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary -ml-px leading-snug ${
                      h.level === 2 ? 'pl-3' : 'pl-6'
                    }`}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

    </div>
  )
}
