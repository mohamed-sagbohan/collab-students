import { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { BookOpen, Send, MessageCircle, X, Loader2, ArrowDown, AlertCircle, Trash2, Pencil, Mic, Square, Play, Check, SmilePlus, ImagePlus, CornerUpLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '../Skeleton'
import { Button } from '../ui/Button'
import { useConfirm } from '../ui/ConfirmDialog'
import {
  isWithinEditWindow,
  getChatAudioUrl,
  getChatImageUrl,
  isAllowedChatImage,
  REACTION_EMOJIS,
} from '../../hooks/useChat'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import CallLogEntry from './CallLogEntry'

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

const REACTION_LABELS = {
  '👍': 'pouce levé',
  '❤️': 'cœur',
  '😂': 'rire',
  '😮': 'surprise',
  '😢': 'tristesse',
  '🙏': 'merci',
}

/** Classe commune des petits boutons d'action au survol d'une bulle. */
const ACTION_BTN =
  'inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-lg text-muted-foreground/60 transition-all opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100'

function fmtDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Extrait court d'un message pour la citation (composer + bulle). */
function messageExcerpt(m) {
  if (!m) return 'Message supprimé'
  if (m.body) return m.body.length > 90 ? `${m.body.slice(0, 90)}…` : m.body
  if (m.image_path || m.image_local_url) return '📷 Photo'
  if (m.audio_path || m.audio_duration_sec) return '🎤 Note vocale'
  return 'Message'
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

/** Image dans une bulle : aperçu local pendant l'envoi, puis URL signée. */
function ChatImage({ message, onOpenLightbox }) {
  const [url, setUrl] = useState(message.image_local_url ?? null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!message.image_path) return
    let cancelled = false
    getChatImageUrl(message.image_path).then((signed) => {
      if (cancelled) return
      if (signed) setUrl(signed)
      else setFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [message.image_path])

  if (failed) {
    return <p className="text-xs italic opacity-70 py-1">Image indisponible — rouvrez la discussion.</p>
  }
  if (!url) {
    return <div className="w-48 h-32 rounded-lg bg-foreground/10 animate-pulse motion-reduce:animate-none my-1" aria-hidden="true" />
  }
  return (
    <button
      type="button"
      onClick={() => onOpenLightbox?.(url)}
      disabled={message.pending || !onOpenLightbox}
      aria-label="Agrandir la photo"
      className="block my-1 rounded-lg overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <img src={url} alt="Photo partagée" loading="lazy" className="max-w-full max-h-56 rounded-lg object-contain" />
    </button>
  )
}

/** Photo en plein écran — rendue en portal pour couvrir toute la page. */
function Lightbox({ url, onClose }) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo en grand"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
      className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 animate-in fade-in duration-150 motion-reduce:animate-none"
    >
      <img src={url} alt="Photo partagée" className="max-w-full max-h-full rounded-lg" />
      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label="Fermer la photo"
        className="absolute top-4 right-4 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>,
    document.body
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
  seen,
  currentUserId,
  showSenderInfo,
  onRequestDelete,
  onRequestEdit,
  onRequestReply,
  onToggleReaction,
  onOpenLightbox,
  onQuoteClick,
  flash,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
}) {
  const sender = message.profiles
  const label = roleLabel(sender?.role)
  const [pickerOpen, setPickerOpen] = useState(false)
  const hasAudio = !!message.audio_path || (message.pending && !!message.audio_duration_sec)
  const hasImage = !!message.image_path || !!message.image_local_url
  const canDelete = mine && !message.pending && onRequestDelete && !isEditing
  // Seul le texte se modifie : une note vocale ou une photo sans légende se supprime.
  const canEdit =
    mine && !message.pending && !hasAudio && !!message.body && onRequestEdit && !isEditing && isWithinEditWindow(message)
  const canReact = !message.pending && !!onToggleReaction && !isEditing

  // Réactions agrégées par emoji (ordre stable de la palette).
  const reactions = useMemo(() => {
    const byEmoji = new Map()
    for (const r of message.chat_reactions ?? []) {
      const entry = byEmoji.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false }
      entry.count += 1
      if (r.user_id === currentUserId) entry.mine = true
      byEmoji.set(r.emoji, entry)
    }
    return REACTION_EMOJIS.filter((e) => byEmoji.has(e)).map((e) => byEmoji.get(e))
  }, [message.chat_reactions, currentUserId])

  const canReply = !message.pending && !!onRequestReply && !isEditing

  const reactButton = canReact && (
    <button
      type="button"
      onClick={() => setPickerOpen((o) => !o)}
      aria-label="Réagir à ce message"
      aria-expanded={pickerOpen}
      title="Réagir"
      className={cn(ACTION_BTN, 'hover:text-primary hover:bg-primary/10')}
    >
      <SmilePlus className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  )

  const replyButton = canReply && (
    <button
      type="button"
      onClick={() => onRequestReply(message)}
      aria-label="Répondre à ce message"
      title="Répondre"
      className={cn(ACTION_BTN, 'hover:text-primary hover:bg-primary/10')}
    >
      <CornerUpLeft className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  )

  return (
    <div className={cn('flex items-end gap-0.5 group', mine ? 'justify-end' : 'justify-start')}>
      {mine && replyButton}
      {mine && reactButton}
      {canEdit && (
        <button
          type="button"
          onClick={() => onRequestEdit(message)}
          aria-label="Modifier ce message (possible 2 minutes après l'envoi)"
          title="Modifier"
          className={cn(ACTION_BTN, 'hover:text-primary hover:bg-primary/10')}
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
          className={cn(ACTION_BTN, 'hover:text-destructive hover:bg-destructive/10')}
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
      <div className="relative max-w-[82%] min-w-0">
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
              'px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words transition-shadow',
              mine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md',
              message.pending && 'opacity-60',
              flash && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
            )}
          >
            {message.reply_to_id && (
              <button
                type="button"
                onClick={() => onQuoteClick?.(message.reply_to_id)}
                aria-label="Voir le message cité"
                className={cn(
                  'block w-full text-left mb-1.5 px-2.5 py-1.5 rounded-lg border-l-2 text-xs',
                  mine
                    ? 'bg-primary-foreground/10 border-primary-foreground/40'
                    : 'bg-background/60 border-primary/40'
                )}
              >
                {message.reply_to?.profiles?.name && (
                  <span className={cn('block font-semibold mb-0.5', mine ? 'text-primary-foreground/90' : 'text-primary')}>
                    {message.reply_to.profiles.name}
                  </span>
                )}
                <span className={cn('block truncate', mine ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {messageExcerpt(message.reply_to)}
                </span>
              </button>
            )}
            {hasImage && <ChatImage message={message} onOpenLightbox={onOpenLightbox} />}
            {hasAudio && <VoiceNote message={message} mine={mine} />}
            {message.body}
          </div>
        )}
        {/* Réactions agrégées */}
        {reactions.length > 0 && (
          <div className={cn('flex flex-wrap gap-1 mt-1', mine ? 'justify-end' : 'justify-start')}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                type="button"
                disabled={!canReact}
                onClick={() => onToggleReaction?.(message, r.emoji, r.mine)}
                aria-pressed={r.mine}
                aria-label={`${REACTION_LABELS[r.emoji] ?? r.emoji} — ${r.count} réaction${r.count > 1 ? 's' : ''}${r.mine ? ', dont la vôtre' : ''}`}
                className={cn(
                  'inline-flex items-center gap-1 h-6 px-2 rounded-full border text-xs transition-colors',
                  r.mine
                    ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted text-muted-foreground hover:border-primary/40'
                )}
              >
                <span aria-hidden="true">{r.emoji}</span>
                {r.count}
              </button>
            ))}
          </div>
        )}

        <p className={cn('text-[10px] text-muted-foreground/70 mt-0.5', mine ? 'text-right mr-1' : 'ml-1')}>
          {message.pending ? 'Envoi…' : timeFmt.format(new Date(message.created_at))}
          {message.edited_at && !message.pending && ' · modifié'}
          {seen && (
            <span className="text-primary/80 font-semibold">
              {' · '}
              <Check className="inline w-3 h-3 -mt-px" aria-hidden="true" /> Vu
            </span>
          )}
        </p>

        {/* Palette de réactions */}
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} aria-hidden="true" />
            <div
              role="group"
              aria-label="Choisir une réaction"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setPickerOpen(false)
                }
              }}
              className={cn(
                'absolute z-20 bottom-full mb-1 flex items-center gap-0.5 bg-card border border-border rounded-full shadow-lg px-1.5 py-1 animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none',
                mine ? 'right-0' : 'left-0'
              )}
            >
              {REACTION_EMOJIS.map((emoji) => {
                const active = reactions.some((r) => r.emoji === emoji && r.mine)
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onToggleReaction?.(message, emoji, active)
                      setPickerOpen(false)
                    }}
                    aria-label={`${active ? 'Retirer la réaction' : 'Réagir'} ${REACTION_LABELS[emoji]}`}
                    aria-pressed={active}
                    className={cn(
                      'w-9 h-9 rounded-full text-lg flex items-center justify-center hover:bg-muted transition-colors',
                      active && 'bg-primary/10'
                    )}
                  >
                    <span aria-hidden="true">{emoji}</span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
      {!mine && reactButton}
      {!mine && replyButton}
    </div>
  )
}

function Composer({
  onSend,
  sending,
  disabled,
  sendTyping,
  lessonContext,
  onClearLessonContext,
  replyTo = null,
  onCancelReply,
  placeholder,
  allowVoice = true,
}) {
  const [text, setText] = useState('')
  // Photo sélectionnée : { file, url } (url = aperçu local, révoqué à l'envoi/retrait).
  const [image, setImage] = useState(null)
  const [imageError, setImageError] = useState(null)
  const fileInputRef = useRef(null)
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

  function pickImage(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // resélection du même fichier possible
    if (!file) return
    if (!isAllowedChatImage(file)) {
      setImageError('Photo refusée : formats JPG, PNG, WebP ou GIF, 5 Mo maximum.')
      return
    }
    setImageError(null)
    setImage((old) => {
      if (old) URL.revokeObjectURL(old.url)
      return { file, url: URL.createObjectURL(file) }
    })
  }

  function removeImage() {
    setImage((old) => {
      if (old) URL.revokeObjectURL(old.url)
      return null
    })
  }

  function submit() {
    const body = text.trim()
    if ((!body && !image) || sending || disabled) return
    setText('')
    setImageError(null)
    const ctx = lessonContext
    const img = image
    const quote = replyTo
    onClearLessonContext?.()
    onCancelReply?.()
    onSend({
      body: body || null,
      lessonId: ctx?.id ?? null,
      lessonTitle: ctx?.title ?? null,
      image: img ? { file: img.file, previewUrl: img.url } : null,
      replyToId: quote?.id ?? null,
      replyTo: quote,
    })
      .then(() => {
        if (img) {
          URL.revokeObjectURL(img.url)
          setImage(null)
        }
      })
      .catch(() => {
        // Échec (toast déjà affiché par le hook) : on restitue la saisie.
        setText(body)
      })
  }

  function sendVoice() {
    if (!recorder.blob || sending || disabled) return
    const ctx = lessonContext
    const quote = replyTo
    onClearLessonContext?.()
    onCancelReply?.()
    onSend({
      body: null,
      lessonId: ctx?.id ?? null,
      lessonTitle: ctx?.title ?? null,
      audio: { blob: recorder.blob, durationSec: recorder.seconds, mimeType: recorder.blob.type },
      replyToId: quote?.id ?? null,
      replyTo: quote,
    })
      .then(() => recorder.reset())
      .catch(() => {
        /* toast géré par le hook — la pré-écoute reste disponible pour réessayer */
      })
  }

  const showVoice = allowVoice && recorder.supported

  return (
    <div className="border-t border-border p-3 shrink-0 bg-card">
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-muted border-l-2 border-primary/60 text-xs">
          <CornerUpLeft className="w-3.5 h-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span className="flex-1 min-w-0">
            <span className="block font-semibold text-primary truncate">
              Réponse à {replyTo.profiles?.name ?? 'ce message'}
            </span>
            <span className="block text-muted-foreground truncate">{messageExcerpt(replyTo)}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Annuler la réponse"
            className="inline-flex items-center justify-center w-11 h-11 -my-2.5 -mr-1.5 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
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

      {/* Photo sélectionnée, en attente d'envoi */}
      {image && recorder.state === 'idle' && (
        <div className="flex items-center gap-2.5 mb-2 px-2.5 py-2 rounded-xl bg-muted border border-border">
          <img src={image.url} alt="Aperçu de la photo à envoyer" className="w-12 h-12 rounded-lg object-cover shrink-0" />
          <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
            {image.file.name}
          </span>
          <button
            type="button"
            onClick={removeImage}
            aria-label="Retirer la photo"
            className="inline-flex items-center justify-center w-11 h-11 -my-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Saisie normale */}
      {recorder.state === 'idle' && (
        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={pickImage}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
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
          {!image && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              aria-label="Joindre une photo"
              title="Photo"
              className="w-11 h-11 shrink-0"
            >
              <ImagePlus className="w-4 h-4 text-primary" aria-hidden="true" />
            </Button>
          )}
          {showVoice && !text.trim() && !image && (
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
            disabled={(!text.trim() && !image) || disabled}
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
      {imageError && (
        <p role="alert" className="text-xs text-destructive mt-2">
          {imageError}
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
  peerLastReadAt = null,
  lessonContext = null,
  onClearLessonContext,
  showSenderInfo = false,
  onDelete,
  onEdit,
  onToggleReaction,
  allowVoice = true,
  emptyTitle = 'Aucun message pour l’instant',
  emptyDescription = 'Écrivez votre premier message ci-dessous.',
  composerPlaceholder,
  onCallBack,
}) {
  const confirm = useConfirm()
  const containerRef = useRef(null)
  const rootRef = useRef(null)
  // Édition en cours : { id, text } | null
  const [editing, setEditing] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  // Photo affichée en grand : URL signée | null
  const [lightboxUrl, setLightboxUrl] = useState(null)
  // Message en cours de citation (bouton « Répondre ») : message | null
  const [replyTo, setReplyTo] = useState(null)
  // Message brièvement surligné après un clic sur une citation
  const [flashId, setFlashId] = useState(null)
  const flashTimerRef = useRef(null)
  useEffect(() => () => clearTimeout(flashTimerRef.current), [])

  function requestReply(message) {
    setReplyTo(message)
    // Le focus revient au composer pour écrire la réponse immédiatement.
    rootRef.current?.querySelector('textarea[aria-label="Votre message"]')?.focus()
  }

  function scrollToQuoted(messageId) {
    const el = containerRef.current?.querySelector(`[data-mid="${messageId}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlashId(messageId)
    clearTimeout(flashTimerRef.current)
    flashTimerRef.current = setTimeout(() => setFlashId(null), 1600)
  }

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
  // « Vu » : id du DERNIER de mes messages lu par l'autre participant
  // (un seul indicateur, sous le message le plus récent concerné).
  const lastSeenOwnId = useMemo(() => {
    if (!peerLastReadAt) return null
    const readTime = new Date(peerLastReadAt).getTime()
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.sender_id === currentUserId && !m.pending && new Date(m.created_at).getTime() <= readTime) {
        return m.id
      }
    }
    return null
  }, [messages, peerLastReadAt, currentUserId])

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
    // Même fenêtre que l'édition (2 min) : au-delà, la suppression ne vaut
    // que pour soi — le serveur tranche de toute façon (RPC, migration 028).
    // requestDelete n'est appelé que sur SES messages : profiles = l'appelant.
    const forEveryone = isWithinEditWindow(message) || message.profiles?.role === 'admin'
    const ok = await confirm({
      title: message.audio_path
        ? 'Supprimer cette note vocale ?'
        : message.image_path
          ? 'Supprimer cette photo ?'
          : 'Supprimer ce message ?',
      description: forEveryone
        ? 'Il sera supprimé pour tout le monde. Cette action est irréversible.'
        : 'Envoyé il y a plus de 2 minutes : il ne sera supprimé que pour vous. Votre interlocuteur le verra toujours.',
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
      setAnnounce(last.kind === 'call' ? 'Nouvel appel' : `Nouveau message de ${last.profiles?.name ?? "l'équipe"}`)
    }
  }, [messages, currentUserId])

  return (
    <div ref={rootRef} className="flex flex-col h-full min-h-0">
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
                <li key={message.id} data-mid={message.id}>
                  {newDay && (
                    <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider my-3 first:mt-0">
                      {dayLabel(message.created_at)}
                    </p>
                  )}
                  {message.kind === 'call' ? (
                    <CallLogEntry call={message} currentUserId={currentUserId} onCallBack={onCallBack} />
                  ) : (
                    <MessageBubble
                      message={message}
                      mine={message.sender_id === currentUserId}
                      seen={message.id === lastSeenOwnId}
                      currentUserId={currentUserId}
                      showSenderInfo={showSenderInfo}
                      onToggleReaction={onToggleReaction}
                      onOpenLightbox={setLightboxUrl}
                      onQuoteClick={scrollToQuoted}
                      flash={flashId === message.id}
                      onRequestDelete={onDelete ? requestDelete : undefined}
                      onRequestReply={requestReply}
                      onRequestEdit={onEdit ? (m) => setEditing({ id: m.id, text: m.body }) : undefined}
                      isEditing={editing?.id === message.id}
                      editText={editing?.id === message.id ? editing.text : ''}
                      onEditTextChange={(text) => setEditing((e) => (e ? { ...e, text } : e))}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setEditing(null)}
                      savingEdit={savingEdit}
                    />
                  )}
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
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder={composerPlaceholder}
        allowVoice={allowVoice}
      />

      {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  )
}
