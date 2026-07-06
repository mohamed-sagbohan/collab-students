import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { BookOpen, ChevronRight, ArrowLeft, CheckCircle, Download, Award, FileText, PlayCircle, Sparkles, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { downloadCertificate } from '../../lib/certificate'
import { downloadFiche } from '../../lib/fichePdf'

function youtubeThumbnail(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m?.[1] ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

export default function CourseDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, fiche_content, youtube_videos, sequential, lessons(id, title, order_index)')
        .eq('id', id)
        .single()
      if (error) throw error
      return {
        ...data,
        lessons: data.lessons?.sort((a, b) => a.order_index - b.order_index),
      }
    },
  })

  // Progression de l'apprenant sur ce cours
  const { data: progressList = [] } = useQuery({
    queryKey: ['course-progress', user?.id, id],
    queryFn: async () => {
      const lessonIds = course?.lessons?.map((l) => l.id) ?? []
      if (!lessonIds.length) return []
      const { data } = await supabase
        .from('progress')
        .select('lesson_id, completed, completed_at')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)
      return data ?? []
    },
    enabled: !!user && !!course,
  })

  // Map lesson_id → progress
  const progressMap = progressList.reduce((acc, p) => {
    acc[p.lesson_id] = p
    return acc
  }, {})

  const totalLessons     = course?.lessons?.length ?? 0
  const completedLessons = progressList.filter((p) => p.completed).length
  const allDone          = totalLessons > 0 && completedLessons >= totalLessons
  const pct              = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Date de complétion = la plus récente completed_at
  const lastCompletedAt = progressList
    .filter((p) => p.completed && p.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0]?.completed_at

  function handleDownloadCertificate() {
    downloadCertificate({
      studentName: profile?.name ?? 'Apprenant',
      courseTitle:  course?.title ?? 'Cours',
      completedAt:  lastCompletedAt ?? new Date().toISOString(),
    })
  }

  function handleDownloadFiche() {
    downloadFiche({
      courseTitle: course?.title ?? 'Cours',
      ficheContent: course?.fiche_content,
    })
  }

  const videos = course?.youtube_videos ?? []

  if (isLoading) return (
    <div className="max-w-3xl space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    </div>
  )

  if (error) return <p className="text-destructive">Cours introuvable.</p>

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/cours"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour aux cours
      </Link>

      {/* En-tête du cours */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">{course?.title}</h1>
          {course?.description && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{course.description}</p>
          )}
        </div>
      </div>

      {/* Progression + Certificat */}
      {user && totalLessons > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 mb-6">
          {allDone ? (
            /* ── Cours terminé ── */
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-warning" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Cours terminé !</p>
                  <p className="text-xs text-muted-foreground">Toutes les leçons sont complétées. Téléchargez votre certificat.</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadCertificate}
                className="bg-warning text-warning-foreground hover:bg-warning/90 shadow-warning/25 shrink-0 w-full sm:w-auto"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Télécharger le certificat
              </Button>
            </div>
          ) : (
            /* ── En cours ── */
            <div className="flex items-center gap-4 sm:gap-5">
              <ProgressRing
                value={completedLessons}
                max={totalLessons}
                size={64}
                strokeWidth={6}
                ariaLabel={`Progression du cours : ${pct} %`}
                className="shrink-0"
              >
                <span className="text-sm font-extrabold text-primary">{pct}%</span>
              </ProgressRing>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-0.5">Ma progression</p>
                <p className="text-xs text-muted-foreground">
                  {completedLessons} leçon{completedLessons > 1 ? 's' : ''} terminée{completedLessons > 1 ? 's' : ''} sur {totalLessons}.
                  Continuez, vous êtes sur la bonne voie !
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ressources complémentaires : fiche PDF + vidéos YouTube */}
      {(course?.fiche_content || videos.length > 0) && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">Ressources complémentaires</h2>
          </div>

          {course?.fiche_content && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5">
              <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">Fiche mémo PDF</p>
                <p className="text-xs text-muted-foreground mt-0.5">L'essentiel du cours, à imprimer ou conserver hors ligne.</p>
              </div>
              <Button onClick={handleDownloadFiche} className="shrink-0 w-full sm:w-auto">
                <Download className="w-4 h-4" aria-hidden="true" />
                Télécharger
              </Button>
            </div>
          )}

          {videos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                Vidéos pour aller plus loin
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {videos.map((v) => {
                  const thumb = youtubeThumbnail(v.url)
                  return (
                    <a
                      key={v.url}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {thumb && (
                          <img
                            src={thumb}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      <p className="px-3 py-2.5 text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {v.title}
                      </p>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liste des leçons */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Programme du cours</h2>
        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          {totalLessons} leçon{totalLessons !== 1 ? 's' : ''}
        </span>
      </div>

      {totalLessons === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucune leçon pour l'instant"
          description="Le formateur prépare le contenu de ce cours. Revenez bientôt !"
        />
      ) : (
        <ol className="space-y-2 sm:space-y-2.5">
          {course?.lessons?.map((lesson, index) => {
            const prog = progressMap[lesson.id]
            const done = prog?.completed ?? false
            // Cours séquentiel (apprenant) : seule la première leçon non
            // terminée est accessible, les suivantes sont verrouillées.
            const firstTodoIndex = course.sequential
              ? course.lessons.findIndex((l) => !(progressMap[l.id]?.completed ?? false))
              : -1
            const locked =
              course.sequential &&
              profile?.role === 'apprenante' &&
              firstTodoIndex !== -1 &&
              index > firstTodoIndex

            if (locked) {
              return (
                <li key={lesson.id}>
                  <div
                    aria-disabled="true"
                    style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-1 flex items-center gap-3 sm:gap-4 bg-card border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 opacity-55"
                  >
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0">
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                    <span className="font-medium text-sm sm:text-base flex-1 min-w-0 truncate text-muted-foreground">
                      {lesson.title}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full shrink-0 hidden sm:block">
                      Terminez la leçon {firstTodoIndex + 1}
                    </span>
                  </div>
                </li>
              )
            }

            return (
              <li key={lesson.id}>
                <Link
                  to={`/cours/${id}/lecons/${lesson.id}`}
                  style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                  className={`animate-in fade-in slide-in-from-bottom-1 flex items-center gap-3 sm:gap-4 bg-card border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all duration-200 group ${
                    done
                      ? 'border-success/20 hover:border-success/40 hover:bg-success/3'
                      : 'border-border hover:border-primary/30 hover:bg-primary/3'
                  } hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
                >
                  {/* Numéro / check */}
                  {done ? (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" aria-hidden="true" />
                    </div>
                  ) : (
                    <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {index + 1}
                    </span>
                  )}

                  {/* Titre */}
                  <span className={`font-medium text-sm sm:text-base flex-1 min-w-0 truncate transition-colors ${
                    done
                      ? 'text-foreground group-hover:text-success'
                      : 'text-foreground group-hover:text-primary'
                  }`}>
                    {lesson.title}
                  </span>

                  {/* Badge complété */}
                  {done && (
                    <span className="text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full shrink-0 hidden sm:block">
                      Terminée
                    </span>
                  )}

                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
