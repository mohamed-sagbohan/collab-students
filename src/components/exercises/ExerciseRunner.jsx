import { useState, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { XCircle, CheckCircle, Play, RotateCcw, Trophy, Target, ChevronRight, AlertCircle, AlertTriangle, BookOpen, ClipboardList, Lightbulb, Clock, Keyboard, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Skeleton } from '../Skeleton'
import ExerciseTimer from '../ExerciseTimer'
import TypingExercise from './TypingExercise'

/* ══════════════════════════════════════════════════════════════
   Question QCM
══════════════════════════════════════════════════════════════ */
function QuestionQCM({ question, selected, onSelect, disabled }) {
  const options = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options ?? '[]')

  return (
    <div className="space-y-2.5">
      <p className="font-bold text-foreground text-base leading-snug mb-4">{question.question}</p>
      {options.map((opt) => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            onClick={() => !disabled && onSelect(opt)}
            disabled={disabled}
            className={`w-full flex items-center text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
              isSelected
                ? 'bg-primary/10 border-primary text-primary scale-[1.01]'
                : 'bg-card border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
            } disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
          >
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold mr-3 shrink-0 transition-colors ${
              isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
            }`}>
              {String.fromCharCode(65 + options.indexOf(opt))}
            </span>
            <span className="flex-1">{opt}</span>
            {isSelected && <Check className="w-4 h-4 shrink-0 ml-2 animate-in zoom-in duration-200" />}
          </button>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Question Vrai / Faux
══════════════════════════════════════════════════════════════ */
function QuestionVraiFaux({ question, selected, onSelect, disabled }) {
  return (
    <div>
      <p className="font-bold text-foreground text-base leading-snug mb-5">{question.question}</p>
      <div className="grid grid-cols-2 gap-3">
        {['Vrai', 'Faux'].map((opt) => {
          const isSelected = selected === opt
          return (
            <button
              key={opt}
              onClick={() => !disabled && onSelect(opt)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 py-5 rounded-xl border text-base font-bold transition-all ${
                isSelected
                  ? opt === 'Vrai'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 scale-[1.02]'
                    : 'bg-red-500/10 border-red-500 text-red-500 scale-[1.02]'
                  : 'bg-card border-border text-foreground hover:border-primary/40 hover:bg-primary/5'
              } disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
            >
              {opt === 'Vrai'
                ? <Check className={`w-5 h-5 ${isSelected ? 'animate-in zoom-in duration-200' : ''}`} />
                : <X className={`w-5 h-5 ${isSelected ? 'animate-in zoom-in duration-200' : ''}`} />
              }
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Anneau de score
══════════════════════════════════════════════════════════════ */
function ScoreRing({ pct, strokeClassName }) {
  const size = 96
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, pct)) / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" className="stroke-muted" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${strokeClassName} transition-[stroke-dashoffset] duration-700 ease-out`}
      />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   Résultats QCM/VF
══════════════════════════════════════════════════════════════ */
function QuizResults({ questions, qcmResult, timeUp, onRetry }) {
  if (!qcmResult) return <Skeleton className="h-52" />

  const resultsById = Object.fromEntries((qcmResult.results ?? []).map((r) => [r.id, r]))
  const scored = questions.map((q) => {
    const r = resultsById[q.id] ?? {}
    return {
      ...q,
      correct_answer: r.correct_answer,
      userAnswer: r.user_answer ?? null,
      isCorrect: !!r.is_correct,
      explanation: r.explanation,
    }
  })
  const correct = qcmResult.correct
  const total = qcmResult.total
  const pct = qcmResult.score_pct

  const scoreColor = pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-red-500'
  const scoreBg = pct >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : pct >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'
  const ringStroke = pct >= 80 ? 'stroke-emerald-500' : pct >= 50 ? 'stroke-amber-500' : 'stroke-red-500'
  const TierIcon = pct >= 80 ? Trophy : pct >= 50 ? Target : BookOpen

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* En-tête de la fiche — bilan à l'écran uniquement, non téléchargeable */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
          <ClipboardList className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Fiche de résultats</h3>
      </div>

      {timeUp && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Temps écoulé — exercice soumis automatiquement
        </div>
      )}

      {/* Score global */}
      <div className={`${scoreBg} border rounded-2xl p-6 text-center`}>
        <div className="relative w-24 h-24 mx-auto mb-3">
          <ScoreRing pct={pct} strokeClassName={ringStroke} />
          <div className="absolute inset-0 flex items-center justify-center">
            <TierIcon className={`w-8 h-8 ${scoreColor}`} />
          </div>
        </div>
        <p className={`text-4xl font-extrabold ${scoreColor}`}>{pct}%</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {correct}/{total} bonnes réponses
        </p>
        <p className={`text-sm font-semibold mt-2 ${scoreColor}`}>
          {pct >= 80 ? 'Excellent travail !' : pct >= 50 ? 'Pas mal, continuez !' : 'Relisez la leçon et réessayez'}
        </p>
      </div>

      {/* Détail question par question */}
      <div className="space-y-3">
        {scored.map((q, i) => (
          <div
            key={q.id}
            className={`rounded-xl border p-4 ${q.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${q.isCorrect ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                {q.isCorrect
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-1.5">
                  Q{i + 1} — {q.question}
                </p>
                {q.userAnswer && !q.isCorrect && (
                  <p className="text-xs text-red-500 mb-1">
                    Votre réponse : <span className="font-semibold">{q.userAnswer}</span>
                  </p>
                )}
                {!q.isCorrect && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Bonne réponse : <span className="font-semibold">{q.correct_answer}</span>
                  </p>
                )}
                {!q.userAnswer && (
                  <p className="text-xs text-muted-foreground italic">Sans réponse</p>
                )}
                {!q.isCorrect && q.explanation && (
                  <div className="flex items-start gap-1.5 mt-2 bg-muted/50 rounded-lg px-3 py-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <RotateCcw className="w-4 h-4" /> Réessayer
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Écran d'accueil de l'exercice
══════════════════════════════════════════════════════════════ */
function ExerciseIdle({ exercise, questionCount, onStart, onStartTraining }) {
  const hasDactylo = exercise.questions?.some((q) => q.type === 'dactylographie')

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Play className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-extrabold text-foreground text-lg mb-2">{exercise.title}</h3>
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
        <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
        {exercise.duration_seconds && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.floor(exercise.duration_seconds / 60) > 0
                ? `${Math.floor(exercise.duration_seconds / 60)} min`
                : ''} {exercise.duration_seconds % 60 > 0 ? `${exercise.duration_seconds % 60} sec` : ''}
            </span>
          </>
        )}
        {hasDactylo && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Keyboard className="w-3.5 h-3.5" />
              Exercice de frappe
            </span>
          </>
        )}
      </div>

      {exercise.duration_seconds && !hasDactylo && (
        <p className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 mb-6 inline-flex">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Soumission automatique à la fin du temps imparti
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
        >
          <Play className="w-4 h-4" />
          {hasDactylo ? 'Mode examen' : 'Commencer l\'exercice'}
        </button>
        {hasDactylo && (
          <button
            onClick={onStartTraining}
            className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Mode entraînement
          </button>
        )}
      </div>

      {hasDactylo && (
        <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">
          Mode entraînement : sans chronomètre, à votre rythme. Résultats et progression enregistrés dans les deux modes.
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Orchestrateur principal
══════════════════════════════════════════════════════════════ */
export default function ExerciseRunner({ exerciseId, onComplete }) {
  const { user } = useAuth()
  const [phase, setPhase] = useState('idle')
  const [trainingMode, setTrainingMode] = useState(false)
  const [timerStarted, setTimerStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeUp, setTimeUp] = useState(false)
  const [qcmResult, setQcmResult] = useState(null)
  const answersRef = useRef({})

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise-full', exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_exercise_attempt', { p_exercise_id: exerciseId })
      if (error) throw error
      return {
        ...data,
        questions: (data.questions ?? []).slice().sort((a, b) => a.order_index - b.order_index),
      }
    },
  })

  const submitQcm = useCallback(async (finalAnswers) => {
    if (!user?.id) return
    const qcmQuestions = exercise?.questions?.filter((q) => q.type !== 'dactylographie') ?? []
    if (qcmQuestions.length === 0) return
    const { data, error } = await supabase.rpc('submit_qcm_result', {
      p_exercise_id: exerciseId,
      p_answers: finalAnswers,
    })
    if (error) {
      console.warn('submit_qcm_result:', error.message)
      return
    }
    setQcmResult(data)
  }, [user?.id, exerciseId, exercise?.questions])

  const handleAnswer = (questionId, answer) => {
    if (!timerStarted) setTimerStarted(true)
    const updated = { ...answersRef.current, [questionId]: answer }
    answersRef.current = updated
    setAnswers({ ...updated })
  }

  const handleTimeUp = useCallback(() => {
    setTimeUp(true)
    const hasDactylo = exercise?.questions?.some((q) => q.type === 'dactylographie')
    if (!hasDactylo) {
      setPhase('grading')
      submitQcm(answersRef.current).finally(() => setPhase('completed'))
    }
  }, [exercise, submitQcm])

  const handleNext = async () => {
    const questions = exercise?.questions ?? []
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setPhase('grading')
      await submitQcm(answersRef.current)
      setPhase('completed')
    }
  }

  const handleTypingComplete = useCallback((result) => {
    if (user?.id) {
      supabase.from('exercise_results').insert({
        user_id: user.id,
        exercise_id: exerciseId,
        result_type: 'dactylographie',
        wpm: result.wpm,
        accuracy: result.accuracy,
        elapsed_sec: result.elapsedSec,
      }).then(({ error }) => { if (error) console.warn('exercise_results insert:', error.message) })
    }
    onComplete?.()
  }, [user?.id, exerciseId, onComplete])

  const handleRetry = () => {
    setPhase('idle')
    setTrainingMode(false)
    setTimerStarted(false)
    setCurrentIndex(0)
    setAnswers({})
    answersRef.current = {}
    setTimeUp(false)
    setQcmResult(null)
  }

  if (isLoading) return <Skeleton className="h-52" />

  const questions = exercise?.questions ?? []
  const currentQuestion = questions[currentIndex]
  const isDactylo = currentQuestion?.type === 'dactylographie'

  /* ── IDLE ── */
  if (phase === 'idle') {
    return (
      <ExerciseIdle
        exercise={exercise}
        questionCount={questions.length}
        onStart={() => { setTrainingMode(false); setPhase('running') }}
        onStartTraining={() => { setTrainingMode(true); setPhase('running') }}
      />
    )
  }

  /* ── CORRECTION EN COURS ── */
  if (phase === 'grading') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 animate-in fade-in duration-200">
        <div className="w-9 h-9 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Correction en cours…</p>
      </div>
    )
  }

  /* ── RÉSULTATS QCM/VF ── */
  if (phase === 'completed') {
    return (
      <QuizResults
        questions={questions.filter((q) => q.type !== 'dactylographie')}
        qcmResult={qcmResult}
        timeUp={timeUp}
        onRetry={handleRetry}
      />
    )
  }

  /* ── RUNNING ── */
  return (
    <div>
      {/* Header : timer + progression */}
      <div className="mb-6 space-y-3">
        {/* Timer uniquement en mode examen */}
        {!trainingMode && exercise.duration_seconds && (
          <ExerciseTimer
            duration={exercise.duration_seconds}
            running={timerStarted}
            onTimeUp={handleTimeUp}
          />
        )}
        {trainingMode && (
          <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 w-fit">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            Mode entraînement — sans limite de temps
          </div>
        )}
        {questions.length > 1 && !isDactylo && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 flex-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Question courante */}
      <div key={currentQuestion?.id} className="animate-in fade-in slide-in-from-right-2 duration-300">
        {isDactylo ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Exercice de dactylographie
            </p>
            <p className="font-bold text-foreground mb-4">{currentQuestion.question}</p>
            <TypingExercise
              text={currentQuestion.correct_answer}
              timeUp={timeUp}
              onComplete={handleTypingComplete}
              onStart={() => setTimerStarted(true)}
              exerciseId={exerciseId}
              userId={user?.id}
            />
          </div>
        ) : currentQuestion?.type === 'qcm' ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Question à choix multiple
            </p>
            <QuestionQCM
              question={currentQuestion}
              selected={answers[currentQuestion.id]}
              onSelect={(ans) => handleAnswer(currentQuestion.id, ans)}
              disabled={timeUp}
            />
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {currentIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : currentQuestion?.type === 'vrai_faux' ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Vrai ou Faux
            </p>
            <QuestionVraiFaux
              question={currentQuestion}
              selected={answers[currentQuestion.id]}
              onSelect={(ans) => {
                handleAnswer(currentQuestion.id, ans)
                setTimeout(handleNext, 400)
              }}
              disabled={timeUp}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
