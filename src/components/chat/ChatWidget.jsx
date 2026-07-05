import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircle, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../ui/Toast'
import ChatThread from './ChatThread'
import {
  useMyConversation,
  useChatMessages,
  useSendMessage,
  useDeleteMessage,
  useEditMessage,
  useConversationChannel,
  useChatPresence,
  useMyUnread,
  fetchFullMessage,
  appendToCache,
} from '../../hooks/useChat'

/**
 * Widget de chat flottant de l'apprenante + son contexte d'ouverture.
 *
 * Deux contextes séparés pour éviter les re-renders en cascade :
 *  - ChatApiContext : callbacks stables (openChat/closeChat) — consommé par
 *    LessonReader et n'importe quelle page, ne change jamais.
 *  - ChatStateContext : état open/lessonContext — consommé UNIQUEMENT par
 *    le widget lui-même.
 */
const ChatApiContext = createContext(null)
const ChatStateContext = createContext(null)

export function useChatWidget() {
  return useContext(ChatApiContext)
}

export function ChatWidgetProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [lessonContext, setLessonContext] = useState(null)

  const openChat = useCallback((opts) => {
    if (opts?.lesson) setLessonContext(opts.lesson)
    setOpen(true)
  }, [])
  const closeChat = useCallback(() => setOpen(false), [])

  const api = useMemo(() => ({ openChat, closeChat }), [openChat, closeChat])
  const state = useMemo(
    () => ({ open, setOpen, lessonContext, setLessonContext, openChat, closeChat }),
    [open, lessonContext, openChat, closeChat]
  )

  return (
    <ChatApiContext.Provider value={api}>
      <ChatStateContext.Provider value={state}>{children}</ChatStateContext.Provider>
    </ChatApiContext.Provider>
  )
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function ChatWidget() {
  const { profile } = useAuth()
  // Réservé à l'espace apprenante ; le staff a sa page Messagerie.
  if (profile?.role !== 'apprenante') return null
  return <ChatWidgetInner />
}

function ChatWidgetInner() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { open, lessonContext, setLessonContext, openChat, closeChat } = useContext(ChatStateContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const [everOpened, setEverOpened] = useState(false)

  const { conversationId, ensureConversation, ensuring } = useMyConversation()
  const { unread, markRead } = useMyUnread(conversationId)

  const openRef = useRef(open)
  openRef.current = open
  const markReadRef = useRef(markRead)
  markReadRef.current = markRead

  // Réception d'un message : append au fil + non-lus ou lecture immédiate.
  const onInsert = useCallback(
    (row) => {
      if (row.sender_id === user.id) return
      fetchFullMessage(row.id).then((full) => {
        if (full) appendToCache(queryClient, row.conversation_id, full)
      })
      if (openRef.current && document.hasFocus()) {
        markReadRef.current()
      } else {
        queryClient.invalidateQueries({ queryKey: ['chat-unread', row.conversation_id] })
      }
    },
    [user.id, queryClient]
  )

  const { sendTyping, peerTyping } = useConversationChannel({
    conversationId,
    withPostgres: true,
    onInsert,
  })

  // Présence : l'apprenante est « en ligne » tant que l'appli est ouverte ;
  // on lit aussi la présence du staff pour l'en-tête du panneau.
  const online = useChatPresence({ trackSelf: true })
  const staffOnline = useMemo(
    () => [...online.values()].some((m) => m.role === 'staff'),
    [online]
  )

  // Les messages ne sont chargés qu'à partir de la première ouverture.
  const { messages, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useChatMessages(
    everOpened ? conversationId : null
  )
  const sendMessage = useSendMessage(conversationId)
  const deleteMessage = useDeleteMessage(conversationId)
  const editMessage = useEditMessage(conversationId)

  // Première ouverture : créer la conversation si besoin.
  useEffect(() => {
    if (!open) return
    setEverOpened(true)
    if (!conversationId && !ensuring) {
      ensureConversation().catch(() =>
        toast.error('Impossible d’ouvrir la discussion. Vérifiez votre connexion et réessayez.')
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conversationId])

  // Lecture : à l'ouverture, puis au retour de focus tant que c'est ouvert.
  useEffect(() => {
    if (!open || !conversationId) return
    markReadRef.current()
    const onFocus = () => {
      if (document.visibilityState === 'visible') markReadRef.current()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [open, conversationId])

  // Deep-link ?chat=ouvert (lien des notifications) — consommé puis retiré.
  useEffect(() => {
    if (searchParams.get('chat') === 'ouvert') {
      openChat()
      const next = new URLSearchParams(searchParams)
      next.delete('chat')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, openChat, setSearchParams])

  // Focus trap + Échap (pattern du Dialog maison) quand le panneau est ouvert.
  const panelRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const getFocusable = () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])
    const textarea = panelRef.current?.querySelector('textarea')
    ;(textarea ?? getFocusable()[0])?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeChat()
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      previouslyFocused?.focus?.()
    }
  }, [open, closeChat])

  // Verrou du scroll du body uniquement en plein écran mobile.
  useEffect(() => {
    if (!open) return
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => {
      document.body.style.overflow = mq.matches ? 'hidden' : ''
    }
    apply()
    mq.addEventListener('change', apply)
    return () => {
      mq.removeEventListener('change', apply)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => (open ? closeChat() : openChat())}
        aria-label={open ? 'Fermer la discussion' : 'Ouvrir la discussion avec le support'}
        aria-expanded={open}
        className="fixed z-50 bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {open ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
        {!open && unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panneau */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Discussion avec le support"
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[380px] sm:h-[min(32rem,calc(100dvh-8rem))] bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-2xl flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
        >
          {/* En-tête */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">Support LearnIT</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                {staffOnline && (
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
                )}
                {staffOnline ? 'Un membre de l’équipe est en ligne' : 'Nous vous répondrons dès que possible'}
              </p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Fermer la discussion"
              className="inline-flex items-center justify-center w-11 h-11 -my-1 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <ChatThread
            key={conversationId ?? 'nouvelle'}
            messages={messages}
            isLoading={everOpened && !!conversationId && isLoading}
            isError={isError}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            currentUserId={user.id}
            onSend={(vars) => sendMessage.mutateAsync(vars)}
            sending={sendMessage.isPending}
            onDelete={(id) => deleteMessage.mutate(id)}
            onEdit={(id, body) => editMessage.mutateAsync({ messageId: id, body })}
            disabled={!conversationId || ensuring}
            sendTyping={sendTyping}
            peerTyping={peerTyping}
            lessonContext={lessonContext}
            onClearLessonContext={() => setLessonContext(null)}
            showSenderInfo
            emptyTitle="Posez votre première question !"
            emptyDescription="Un formateur vous répondra ici. N'hésitez pas : il n'y a pas de mauvaise question."
            composerPlaceholder="Posez votre question…"
          />
        </div>
      )}
    </>
  )
}
