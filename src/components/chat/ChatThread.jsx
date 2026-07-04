import { useRef, useState, useLayoutEffect } from 'react'
import { Link } from 'react-router'
import { BookOpen, Send, MessageCircle, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '../Skeleton'
import { Button } from '../ui/Button'

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

function MessageBubble({ message, mine, showSenderInfo }) {
  const sender = message.profiles
  const label = roleLabel(sender?.role)
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[82%] min-w-0">
        {!mine && showSenderInfo && sender?.name && (
          <p className="text-[11px] text-muted-foreground mb-0.5 ml-1">
            {sender.name}
            {label && <span> — {label}</span>}
          </p>
        )}
        {message.lesson_id && message.lessons && <LessonContextCard message={message} />}
        <div
          className={cn(
            'px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
            mine
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md',
            message.pending && 'opacity-60'
          )}
        >
          {message.body}
        </div>
        <p className={cn('text-[10px] text-muted-foreground/70 mt-0.5', mine ? 'text-right mr-1' : 'ml-1')}>
          {message.pending ? 'Envoi…' : timeFmt.format(new Date(message.created_at))}
        </p>
      </div>
    </div>
  )
}

function Composer({ onSend, sending, disabled, sendTyping, lessonContext, onClearLessonContext, placeholder }) {
  const [text, setText] = useState('')

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
            className="inline-flex items-center justify-center w-8 h-8 -my-1.5 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
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
    </div>
  )
}

export default function ChatThread({
  messages = [],
  isLoading = false,
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
  emptyTitle = 'Aucun message pour l’instant',
  emptyDescription = 'Écrivez votre premier message ci-dessous.',
  composerPlaceholder,
}) {
  const containerRef = useRef(null)
  const nearBottomRef = useRef(true)
  const prependRef = useRef(null)
  const didInitRef = useRef(false)

  function onScroll() {
    const el = containerRef.current
    if (!el) return
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (el.scrollTop < 60 && hasNextPage && !isFetchingNextPage) {
      // Capture AVANT le fetch pour restaurer la position après le prepend.
      prependRef.current = { height: el.scrollHeight, top: el.scrollTop }
      fetchNextPage?.()
    }
  }

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || messages.length === 0) return
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
    const last = messages[messages.length - 1]
    if (nearBottomRef.current || last?.sender_id === currentUserId) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, currentUserId])

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
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

        {!isLoading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">{emptyTitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[16rem]">{emptyDescription}</p>
          </div>
        )}

        {!isLoading && messages.length > 0 && (
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
                  />
                </li>
              )
            })}
          </ol>
        )}
      </div>

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
      />
    </div>
  )
}
