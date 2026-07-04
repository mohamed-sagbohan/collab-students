import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Search, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { Avatar } from '../../components/ui/Avatar'
import ChatThread from '../../components/chat/ChatThread'
import {
  useStaffConversations,
  useChatMessages,
  useSendMessage,
  useConversationChannel,
  useChatPresence,
} from '../../hooks/useChat'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l’instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return `il y a ${d}j`
}

export default function Messaging() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')

  const { data: conversations = [], isLoading, isError } = useStaffConversations()
  // Le staff se signale aussi en ligne : le widget apprenante affiche
  // « Un membre de l'équipe est en ligne ».
  const online = useChatPresence({ trackSelf: true })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => (c.student_name ?? '').toLowerCase().includes(q))
  }, [conversations, search])

  const active = conversations.find((c) => c.id === activeId) ?? null

  const { messages, isLoading: loadingMessages, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatMessages(activeId)
  const sendMessage = useSendMessage(activeId)
  // Canal de la conversation ouverte : typing uniquement (les INSERT arrivent
  // déjà par le canal global chat-staff monté dans AdminLayout).
  const { sendTyping, peerTyping } = useConversationChannel({ conversationId: activeId, withPostgres: false })

  const markStaffRead = useCallback(
    async (convId) => {
      if (!convId || !user) return
      await supabase.from('chat_reads').upsert(
        { conversation_id: convId, user_id: user.id, last_read_at: new Date().toISOString() },
        { onConflict: 'conversation_id,user_id' }
      )
      queryClient.setQueryData(['staff-conversations'], (old) =>
        old?.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      )
    },
    [user, queryClient]
  )

  function openConversation(convId) {
    setActiveId(convId)
    markStaffRead(convId)
  }

  // Si des messages arrivent dans le fil qu'on est en train de lire,
  // on garde le compteur à zéro (la liste est ré-invalidée par chat-staff).
  useEffect(() => {
    if (!activeId) return
    const conv = conversations.find((c) => c.id === activeId)
    if (conv?.unread_count > 0 && document.hasFocus()) {
      markStaffRead(activeId)
    }
  }, [conversations, activeId, markStaffRead])

  return (
    <div>
      <PageHeader
        eyebrow="Messagerie"
        eyebrowIcon={MessageCircle}
        title="Questions des apprenants"
        description="Répondez en direct — chaque apprenant a un fil de discussion unique, partagé par toute l'équipe."
      />

      {isError && (
        <EmptyState
          icon={MessageCircle}
          title="Impossible de charger la messagerie"
          description="Vérifiez votre connexion puis rechargez la page. Si le problème persiste, la migration 017 n'est peut-être pas appliquée."
        />
      )}

      {!isError && !isLoading && conversations.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="Aucune conversation pour l'instant"
          description="Dès qu'un apprenant posera une question depuis son espace, elle apparaîtra ici en temps réel."
        />
      )}

      {!isError && (isLoading || conversations.length > 0) && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex h-[min(44rem,calc(100dvh-13rem))] min-h-[24rem]">

          {/* ── Liste des conversations ── */}
          <div
            className={cn(
              'w-full sm:w-80 sm:border-r border-border flex-col shrink-0 min-h-0',
              activeId ? 'hidden sm:flex' : 'flex'
            )}
          >
            <div className="p-3 border-b border-border shrink-0">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un apprenant…"
                  aria-label="Rechercher un apprenant"
                  className="w-full h-11 pl-9 pr-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
                />
              </label>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <Skeleton className="h-14" />
                  </div>
                ))}

              {!isLoading && filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center px-4 py-8">
                  Aucun apprenant ne correspond à cette recherche.
                </p>
              )}

              {!isLoading &&
                filtered.map((conv) => {
                  const isActive = conv.id === activeId
                  const isOnline = online.has(conv.student_id)
                  const preview = conv.last_message
                    ? `${conv.last_message.sender_id === user?.id ? 'Vous : ' : ''}${conv.last_message.body}`
                    : ''
                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => openConversation(conv.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-3 min-h-16 text-left transition-colors',
                        isActive ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-muted/50 border-l-2 border-transparent'
                      )}
                    >
                      <span className="relative shrink-0">
                        <Avatar name={conv.student_name} size="lg" />
                        {isOnline && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card"
                            title="En ligne"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {conv.student_name}
                            {isOnline && <span className="sr-only"> (en ligne)</span>}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {timeAgo(conv.last_message_at)}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">{preview}</span>
                          {conv.unread_count > 0 && (
                            <span className="min-w-5 h-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                              {conv.unread_count > 9 ? '9+' : conv.unread_count}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  )
                })}
            </div>
          </div>

          {/* ── Fil de discussion ── */}
          <div className={cn('flex-1 flex-col min-w-0 min-h-0', activeId ? 'flex' : 'hidden sm:flex')}>
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Sélectionnez une conversation</p>
                <p className="text-xs text-muted-foreground max-w-[16rem]">
                  Choisissez un apprenant dans la liste pour lire sa question et lui répondre.
                </p>
              </div>
            ) : (
              <>
                {/* En-tête du fil */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    aria-label="Revenir à la liste des conversations"
                    className="sm:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <Avatar name={active.student_name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{active.student_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {online.has(active.student_id) ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-hidden="true" />
                          En ligne
                        </>
                      ) : (
                        'Hors ligne — il recevra une notification'
                      )}
                    </p>
                  </div>
                </div>

                <ChatThread
                  key={active.id}
                  messages={messages}
                  isLoading={loadingMessages}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  currentUserId={user?.id}
                  onSend={(vars) => sendMessage.mutateAsync(vars)}
                  sending={sendMessage.isPending}
                  sendTyping={sendTyping}
                  peerTyping={peerTyping}
                  showSenderInfo
                  emptyTitle="Aucun message dans ce fil"
                  emptyDescription="Écrivez le premier message ci-dessous."
                  composerPlaceholder="Répondez à l'apprenant…"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
