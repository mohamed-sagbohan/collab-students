import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { Link } from 'react-router'
import { BookOpen, Send, MessageCircle, X, Loader2, ArrowDown, AlertCircle, Trash2, Pencil, Mic, Square, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '../Skeleton'
import { Button } from '../ui/Button'
import { useConfirm } from '../ui/ConfirmDialog'
import { isWithinEditWindow, getChatAudioUrl } from '../../hooks/useChat'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'

/**
 * Fil de discussion partagé entre le widget apprenante et la page
 * Messagerie du staff. Purement présentationnel : les données et les
 * mutations viennent des hooks useChat (passés en props).
 *
 * Monter avec key={conversationId} : le changement de fil remonte le
 * composant et remet à zéro les refs de scroll (StrictMode-safe).
 */

const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString()) return 'Hier'
  return dayFmt.format(d)
}

function roleLabel(role) {
  if (role === 'formateur') return 'Formateur'
  if (role === 'admin') return 'Équipe LearnIT'
  return null
}

function fmtDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Note vocale dans une bulle : URL signée chargée au premier clic, puis lecteur natif. */
function VoiceNote({ message, mine }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const durLabel = fmtDuration(message.audio_duration_sec)

  async function load() {
    setLoading(true)
    setFailed(false)
    const signed = await getChatAudioUrl(message.audio_path)
    if (signed) setUrl(signed)
    else setFailed(true)
    setLoading(false)
  }

  if (message.pending) {
    return (
      <span className="flex items-center gap-2 text-sm py-1">
        <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
        Note vocale{durLabel && ` (${durLabel})`}
      </span>
    )
  }

  if (url) {
    return (
      <audio
        controls
        autoPlay
        src={url}
        className="w-56 max-w-full"
        aria-label={`Note vocale${durLabel ? ` de ${durLabel}` : ''}`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={load}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 min-h-11 text-sm font-medium disabled:opacity-60',
        mine ? 'text-primary-foreground' : 'text-foreground'
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            mine ? 'bg-primary-foreground/15' : 'bg-primary/10'
          )}
          aria-hidden="true"
        >
          <Play className={cn('w-4 h-4', mine ? '' : 'text-primary')} />
        </span>
      )}
      <span>
        {failed ? 'Lecture impossible — réessayez' : `Écouter la note vocale${durLabel ? ` (${durLabel})` : ''}`}
      </span>
    </button>
  )
}

function LessonContextCard({ message }) {
  const inner = (
    <span className="flex items-center gap-1.5 font-semibold">
      <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">À propos de : {message.lessons?.title ?? 'une leçon'}</span>
    </span>
  )
  if (message.lessons?.course_id) {
    return (
      <Link
        to={`/cours/${message.lessons.course_id}/lecons/${message.lesson_id}`}
        className="block mb-1 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-xs text-primary hover:border-primary/50 transition-colors max-w-full"
      >
        {inner}
      </Link>
    )
  }
  return <span className="block mb-1 px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-xs text-primary">{inner}</span>
}

function MessageBubble({
  message,
  mine,
  showSenderInfo,
  onRequestDelete,
  onRequestEdit,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
}) {
  const sender = message.profiles
  const label = roleLabel(sender?.role)
  const hasAudio = !!message.audio_path || (message.pending && !!message.audio_duration_sec)
  const canDelete = mine && !message.pending && onRequestDelete && !isEditing
  // Une note vocale ne se modifie pas : elle se supprime.
  const canEdit = mine && !message.pending && !hasAudio && onRequestEdit && !isEditing && isWithinEditWindow(message)
  return (
    <div className={cn('flex items-end gap-0.5 group', mine ? 'justify-end' : 'justify-start')}>
      {canEdit && (
        <button
          type="button"
          onClick={() => onRequestEdit(message)}
          aria-label="Modifier ce message (possible 2 minutes après l'envoi)"
          title="Modifier"
          className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => onRequestDelete(message)}
          aria-label="Supprimer ce message"
          title="Supprimer"
          className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
      <div className="max-w-[82%] min-w-0">
        {!mine && showSenderInfo && sender?.name && (
          <p className="text-[11px] text-muted-foreground mb-0.5 ml-1">
            {sender.name}
            {label && <span> — {label}</span>}
          </p>
        )}
        {message.lesson_id && message.lessons && <LessonContextCard message={message} />}
        {isEditing ? (
          <div className="w-72 max-w-full rounded-2xl border border-primary/40 bg-card p-2">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSaveEdit()
                }
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  onCancelEdit()
                }
              }}
              rows={Math.min(4, Math.max(1, editText.split('\n').length))}
              maxLength={2000}
              autoFocus
              aria-label="Modifier le message"
              className="w-full bg-muted border border-border rounded-lg px-2.5 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
            />
            <div className="flex justify-end gap-1 mt-1.5">
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                Annuler
              </Button>
              <Button size="sm" onClick={onSaveEdit} loading={savingEdit} disabled={!editText.trim()}>
                Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
              mine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md',
              message.pending && 'opacity-60'
            )}
          >
            {hasAudio && <VoiceNote message={message} mine={mine} />}
            {message.body}
          </div>
        )}
        <p className={cn('text-[10px] text-muted-foreground/70 mt-0.5', mine ? 'text-right mr-1' : 'ml-1')}>
          {message.pending ? 'Envoi…' : timeFmt.format(new Date(message.created_at))}
          {message.edited_at && !message.pending && ' · modifié'}
        </p>
      </div>
    </div>
  )
}

function Composer({ onSend, sending, disabled, sendTyping, lessonContext, onClearLessonContext, placeholder, allowVoice = true }) {
  const [text, setText] = useState('')
  const recorder = useVoiceRecorder({ maxSec: 120 })

  // URL locale de pré-écoute de l'enregistrement (révoquée à chaque changement).
  const previewUrl = useMemo(
    () => (recorder.blob ? URL.createObjectURL(recorder.blob) : null),
    [recorder.blob]
  )
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function submit() {
    const body = text.trim()
    if (!body || sending || disabled) return
    setText('')
    const ctx = lessonContext
    onClearLessonContext?.()
    onSend({ body, lessonId: ctx?.id ?? null, lessonTitle: ctx?.title ?? null }).catch(() => {
      // Échec (toast déjà affiché par le hook) : on restitue le texte saisi.
      setText(body)
    })
  }

  function sendVoice() {
    if (!recorder.blob || sending || disabled) return
    const ctx = lessonContext
    onClearLessonContext?.()
    onSend({
      body: null,
      lessonId: ctx?.id ?? null,
      lessonTitle: ctx?.title ?? null,
      audio: { blob: recorder.blob, durationSec: recorder.seconds, mimeType: recorder.blob.type },
    })
      .then(() => recorder.reset())
      .catch(() => {
        /* toast géré par le hook — la pré-écoute reste disponible pour réessayer */
      })
  }

  const showVoice = allowVoice && recorder.supported

  return (
    <div className="border-t border-border p-3 shrink-0 bg-card">
      {lessonContext && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary">
          <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate font-medium">À propos de : {lessonContext.title}</span>
          <button
            type="button"
            onClick={onClearLessonContext}
            aria-label="Retirer le contexte de la leçon"
            className="inline-flex items-center justify-center w-11 h-11 -my-2.5 -mr-1.5 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
      {/* Enregistrement en cours */}
      {recorder.state === 'recording' && (
        <div className="flex items-center gap-3 bg-muted border border-border rounded-xl px-3.5 py-2 min-h-11">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse motion-reduce:animate-none shrink-0" aria-hidden="true" />
          <p className="flex-1 text-sm text-foreground" aria-live="polite">
            Enregistrement… <span className="font-mono tabular-nums font-semibold">{fmtDuration(recorder.seconds)}</span>
            <span className="text-xs text-muted-foreground"> / 2:00</span>
          </p>
          <button
            type="button"
            onClick={recorder.cancel}
            aria-label="Annuler l'enregistrement"
            className="inline-flex items-center justify-center w-11 h-11 -my-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
          <Button size="icon" onClick={recorder.stop} aria-label="Terminer l'enregistrement" className="w-11 h-11 shrink-0">
            <Square className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Pré-écoute avant envoi */}
      {recorder.state === 'preview' && (
        <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2">
          <audio controls src={previewUrl} className="flex-1 min-w-0 h-10" aria-label="Pré-écoute de votre note vocale" />
          <button
            type="button"
            onClick={recorder.cancel}
            aria-label="Supprimer cet enregistrement"
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <Button
            size="icon"
            onClick={sendVoice}
            loading={sending}
            aria-label="Envoyer la note vocale"
            className="w-11 h-11 shrink-0"
          >
            {!sending && <Send className="w-4 h-4" aria-hidden="true" />}
          </Button>
        </div>
      )}

      {/* Saisie normale */}
      {recorder.state === 'idle' && (
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              sendTyping?.()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            rows={Math.min(4, Math.max(1, text.split('\n').length))}
            maxLength={2000}
            disabled={disabled}
            placeholder={placeholder ?? 'Écrivez votre message…'}
            aria-label="Votre message"
            className="flex-1 min-h-11 max-h-32 bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 focus:bg-card transition-colors disabled:opacity-50"
          />
          {showVoice && !text.trim() && (
            <Button
              size="icon"
              variant="secondary"
              onClick={recorder.start}
              disabled={disabled}
              aria-label="Enregistrer une note vocale"
              title="Note vocale"
              className="w-11 h-11 shrink-0"
            >
              <Mic className="w-4 h-4 text-primary" aria-hidden="true" />
            </Button>
          )}
          <Button
            size="icon"
            onClick={submit}
            disabled={!text.trim() || disabled}
            loading={sending}
            aria-label="Envoyer le message"
            className="w-11 h-11 shrink-0"
          >
            {!sending && <Send className="w-4 h-4" aria-hidden="true" />}
          </Button>
        </div>
      )}

      {recorder.error && (
        <p role="alert" className="text-xs text-destructive mt-2">
          {recorder.error}
        </p>
      )}
    </div>
  )
}

export default function ChatThread({
  messages = [],
  isLoading = false,
  isError = false,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  currentUserId,
  onSend,
  sending = false,
  disabled = false,
  sendTyping,
  peerTyping,
  lessonContext = null,
  onClearLessonContext,
  showSenderInfo = false,
  onDelete,
  onEdit,
  allowVoice = true,
  emptyTitle = 'Aucun message pour l’instant',
  emptyDescription = 'Écrivez votre premier message ci-dessous.',
  composerPlaceholder,
}) {
  const confirm = useConfirm()
  const containerRef = useRef(null)
  // Édition en cours : { id, text } | null
  const [editing, setEditing] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Re-rendu périodique : le bouton « Modifier » disparaît de lui-même
  // à la fin de la fenêtre de 2 minutes.
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!onEdit) return
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [onEdit])

  async function saveEdit() {
    const body = editing?.text.trim()
    if (!body || savingEdit) return
    setSavingEdit(true)
    try {
      await onEdit(editing.id, body)
      setEditing(null)
    } catch {
      /* toast d'erreur géré par le hook — le texte reste dans l'éditeur */
    } finally {
      setSavingEdit(false)
    }
  }
  const nearBottomRef = useRef(true)
  const prependRef = useRef(null)
  const didInitRef = useRef(false)
  const lastIdRef = useRef(null)
  const [newBelow, setNewBelow] = useState(false)
  const [announce, setAnnounce] = useState('')

  function scrollToBottom() {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
    setNewBelow(false)
  }

  async function requestDelete(message) {
    const ok = await confirm({
      title: message.audio_path ? 'Supprimer cette note vocale ?' : 'Supprimer ce message ?',
      description: 'Il sera supprimé pour tout le monde. Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (ok) onDelete?.(message)
  }

  function onScroll() {
    const el = containerRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottomRef.current) setNewBelow(false)
    if (el.scrollTop < 60 && hasNextPage && !isFetchingNextPage) {
      // Capture AVANT le fetch pour restaurer la position après le prepend.
      prependRef.current = { height: el.scrollHeight, top: el.scrollTop }
      fetchNextPage?.()
    }
  }

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || messages.length === 0) return
    const last = messages[messages.length - 1]
    const isNewLast = last && last.id !== lastIdRef.current
    lastIdRef.current = last?.id ?? null

    if (prependRef.current) {
      // (a) page ancienne prépendue : on restaure la position de lecture
      el.scrollTop = el.scrollHeight - prependRef.current.height + prependRef.current.top
      prependRef.current = null
      return
    }
    if (!didInitRef.current) {
      // (b) premier rendu : tout en bas, sans animation
      el.scrollTop = el.scrollHeight
      didInitRef.current = true
      return
    }
    // (c) nouveau message : on ne force le scroll que si l'utilisateur est
    // déjà en bas, ou si c'est son propre message
    const incoming = isNewLast && last.sender_id !== currentUserId && !last.pending
    if (nearBottomRef.current || last?.sender_id === currentUserId) {
      el.scrollTop = el.scrollHeight
    } else if (incoming) {
      // L'utilisateur lit plus haut : pastille au lieu de forcer le scroll.
      setNewBelow(true)
    }
    if (incoming) {
      setAnnounce(`Nouveau message de ${last.profiles?.name ?? "l'équipe"}`)
    }
  }, [messages, currentUserId])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto px-4 py-4"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
            <span className="sr-only">Chargement des messages précédents…</span>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-2/3 ml-auto" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        )}

        {isError && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <AlertCircle className="w-6 h-6 text-destructive mb-3" aria-hidden="true" />
            <p className="text-sm font-bold text-foreground mb-1">Impossible de charger les messages</p>
            <p className="text-xs text-muted-foreground max-w-[16rem]">
              Vérifiez votre connexion puis rouvrez la discussion.
            </p>
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">{emptyTitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[16rem]">{emptyDescription}</p>
          </div>
        )}

        {!isLoading && !isError && messages.length > 0 && (
          <ol className="space-y-2">
            {messages.map((message, i) => {
              const prev = messages[i - 1]
              const newDay =
                !prev || new Date(prev.created_at).toDateString() !== new Date(message.created_at).toDateString()
              return (
                <li key={message.id}>
                  {newDay && (
                    <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider my-3 first:mt-0">
                      {dayLabel(message.created_at)}
                    </p>
                  )}
                  <MessageBubble
                    message={message}
                    mine={message.sender_id === currentUserId}
                    showSenderInfo={showSenderInfo}
                    onRequestDelete={onDelete ? requestDelete : undefined}
                    onRequestEdit={onEdit ? (m) => setEditing({ id: m.id, text: m.body }) : undefined}
                    isEditing={editing?.id === message.id}
                    editText={editing?.id === message.id ? editing.text : ''}
                    onEditTextChange={(text) => setEditing((e) => (e ? { ...e, text } : e))}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditing(null)}
                    savingEdit={savingEdit}
                  />
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* Pastille « nouveau message » quand on lit plus haut */}
      {newBelow && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
        >
          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
          Nouveau message
        </button>
      )}
      </div>

      {/* Annonce vocale des messages entrants (jamais aria-live sur la liste) */}
      <span className="sr-only" role="status">{announce}</span>

      {/* Indicateur « en train d'écrire » */}
      <div aria-live="polite" className="px-4 shrink-0">
        {peerTyping && (
          <p className="text-xs text-muted-foreground pb-1 flex items-center gap-1.5">
            <span className="flex gap-0.5" aria-hidden="true">
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce motion-reduce:animate-none" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce motion-reduce:animate-none" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce motion-reduce:animate-none" style={{ animationDelay: '300ms' }} />
            </span>
            {peerTyping.name ?? 'Quelqu’un'} écrit…
          </p>
        )}
      </div>

      <Composer
        onSend={onSend}
        sending={sending}
        disabled={disabled}
        sendTyping={sendTyping}
        lessonContext={lessonContext}
        onClearLessonContext={onClearLessonContext}
        placeholder={composerPlaceholder}
        allowVoice={allowVoice}
      />
    </div>
  )
}
