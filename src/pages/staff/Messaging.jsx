import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessageCircle, Search, ArrowLeft, SquarePen, Archive, ArchiveRestore } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/Skeleton'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { useToast } from '../../components/ui/Toast'
import ChatThread from '../../components/chat/ChatThread'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  useStaffConversations,
  useChatMessages,
  useSendMessage,
  useConversationChannel,
  useChatPresence,
  useStudentsDirectory,
  useStartConversation,
  useSetConversationArchived,
  useDeleteMessage,
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
  const toast = useToast()
  const [activeId, setActiveId] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('active') // 'active' | 'archived'
  // Nouveau message initié par le staff
  const [newMsgOpen, setNewMsgOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  // Fil fraîchement créé, pas encore dans la liste (masquée tant
  // qu'aucun message n'existe) — sert de secours à `active`.
  const [draft, setDraft] = useState(null)

  const { data: conversations = [], isLoading, isError } = useStaffConversations()
  // Le staff se signale aussi en ligne : le widget apprenante affiche
  // « Un membre de l'équipe est en ligne ».
  const online = useChatPresence({ trackSelf: true })

  const { data: students = [], isLoading: loadingStudents } = useStudentsDirectory(newMsgOpen)
  const startConversation = useStartConversation()
  const setArchived = useSetConversationArchived()

  const activeCount = conversations.filter((c) => !c.archived).length
  const archivedCount = conversations.length - activeCount

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return conversations.filter(
      (c) =>
        (tab === 'archived' ? c.archived : !c.archived) &&
        (!q || (c.student_name ?? '').toLowerCase().includes(q))
    )
  }, [conversations, search, tab])

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => (s.name ?? '').toLowerCase().includes(q))
  }, [students, studentSearch])

  const active =
    conversations.find((c) => c.id === activeId) ??
    (draft && draft.id === activeId ? draft : null)

  // Le fil fraîchement créé apparaît en tête de liste tant que la liste
  // serveur ne le connaît pas (elle masque les conversations sans message).
  const listItems = useMemo(() => {
    if (tab === 'active' && draft && !conversations.some((c) => c.id === draft.id)) {
      return [draft, ...filtered]
    }
    return filtered
  }, [draft, conversations, filtered, tab])

  async function toggleArchive(conv) {
    const next = !conv.archived
    try {
      await setArchived.mutateAsync({ conversationId: conv.id, archived: next })
      toast.success(next ? 'Conversation archivée.' : 'Conversation réactivée.')
    } catch {
      /* toast d'erreur déjà géré par le hook */
    }
  }

  const { messages, isLoading: loadingMessages, isError: errorMessages, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useChatMessages(activeId)
  const sendMessage = useSendMessage(activeId)
  const deleteMessage = useDeleteMessage(activeId)
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

  async function startWith(student) {
    try {
      const convId = await startConversation.mutateAsync(student.id)
      setDraft({
        id: convId,
        student_id: student.id,
        student_name: student.name,
        last_message: null,
        last_message_at: null,
        unread_count: 0,
        archived: false,
      })
      setNewMsgOpen(false)
      setStudentSearch('')
      setTab('active')
      openConversation(convId)
    } catch {
      toast.error("Impossible d'ouvrir ce fil. Réessayez.")
    }
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
        actions={
          <Button variant="secondary" onClick={() => setNewMsgOpen(true)}>
            <SquarePen className="w-4 h-4 text-primary" aria-hidden="true" />
            Nouveau message
          </Button>
        }
      />

      {isError && (
        <EmptyState
          icon={MessageCircle}
          title="Impossible de charger la messagerie"
          description="Vérifiez votre connexion puis rechargez la page. Si le problème persiste, la migration 017 n'est peut-être pas appliquée."
        />
      )}

      {!isError && !isLoading && conversations.length === 0 && !draft && (
        <EmptyState
          icon={MessageCircle}
          title="Aucune conversation pour l'instant"
          description="Dès qu'un apprenant posera une question depuis son espace, elle apparaîtra ici en temps réel. Vous pouvez aussi écrire en premier."
          action={
            <Button variant="secondary" onClick={() => setNewMsgOpen(true)}>
              <SquarePen className="w-4 h-4 text-primary" aria-hidden="true" />
              Écrire à un apprenant
            </Button>
          }
        />
      )}

      {!isError && (isLoading || conversations.length > 0 || draft) && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden flex h-[min(44rem,calc(100dvh-13rem))] min-h-[24rem]">

          {/* ── Liste des conversations ── */}
          <div
            className={cn(
              'w-full sm:w-80 sm:border-r border-border flex-col shrink-0 min-h-0',
              activeId ? 'hidden sm:flex' : 'flex'
            )}
          >
            <div className="p-3 border-b border-border shrink-0 space-y-2.5">
              {/* Actives / Archivées */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl" role="tablist" aria-label="Filtrer les conversations">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'active'}
                  onClick={() => setTab('active')}
                  className={cn(
                    'flex-1 min-h-9 px-3 rounded-lg text-xs font-semibold transition-colors',
                    tab === 'active' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Actives{activeCount > 0 ? ` (${activeCount})` : ''}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'archived'}
                  onClick={() => setTab('archived')}
                  className={cn(
                    'flex-1 min-h-9 px-3 rounded-lg text-xs font-semibold transition-colors',
                    tab === 'archived' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Archivées{archivedCount > 0 ? ` (${archivedCount})` : ''}
                </button>
              </div>

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

              {!isLoading && listItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center px-4 py-8">
                  {search.trim()
                    ? 'Aucun apprenant ne correspond à cette recherche.'
                    : tab === 'archived'
                      ? 'Aucune conversation archivée.'
                      : 'Aucune conversation active.'}
                </p>
              )}

              {!isLoading &&
                listItems.map((conv) => {
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
              <div
                key={active.id}
                className="flex flex-col h-full min-h-0 animate-in fade-in sm:animate-none slide-in-from-right-2 sm:slide-in-from-right-0 duration-200 motion-reduce:animate-none"
              >
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
                  {active.archived && (
                    <StatusBadge variant="neutral" className="shrink-0 hidden sm:inline-flex">
                      Archivée
                    </StatusBadge>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleArchive(active)}
                    disabled={setArchived.isPending}
                    aria-label={active.archived ? 'Désarchiver la conversation' : 'Archiver la conversation'}
                    title={active.archived ? 'Désarchiver' : 'Archiver'}
                    className="inline-flex items-center justify-center w-11 h-11 -my-1 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 disabled:opacity-50"
                  >
                    {active.archived ? (
                      <ArchiveRestore className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Archive className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <ChatThread
                  key={active.id}
                  messages={messages}
                  isLoading={loadingMessages}
                  isError={errorMessages}
                  hasNextPage={hasNextPage}
                  fetchNextPage={fetchNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  currentUserId={user?.id}
                  onSend={(vars) => sendMessage.mutateAsync(vars)}
                  sending={sendMessage.isPending}
                  onDelete={(id) => deleteMessage.mutate(id)}
                  sendTyping={sendTyping}
                  peerTyping={peerTyping}
                  showSenderInfo
                  emptyTitle="Aucun message dans ce fil"
                  emptyDescription="Écrivez le premier message ci-dessous."
                  composerPlaceholder="Répondez à l'apprenant…"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Choix de l'apprenant pour un nouveau message ── */}
      <Dialog
        open={newMsgOpen}
        onClose={() => {
          setNewMsgOpen(false)
          setStudentSearch('')
        }}
        title="Nouveau message"
        description="Choisissez l'apprenant à qui écrire — son fil de discussion s'ouvrira."
      >
        <label className="relative block mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="Rechercher un apprenant…"
            aria-label="Rechercher un apprenant"
            className="w-full h-11 pl-9 pr-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
          />
        </label>

        <div className="max-h-72 overflow-y-auto space-y-0.5 -mx-1 px-1">
          {loadingStudents &&
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 mb-1" />)}

          {!loadingStudents && filteredStudents.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              Aucun apprenant trouvé.
            </p>
          )}

          {!loadingStudents &&
            filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => startWith(student)}
                disabled={startConversation.isPending}
                className="w-full flex items-center gap-3 px-3 py-2 min-h-12 rounded-xl hover:bg-muted text-left transition-colors disabled:opacity-50"
              >
                <span className="relative shrink-0">
                  <Avatar name={student.name} />
                  {online.has(student.id) && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card"
                      title="En ligne"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {student.name}
                  {online.has(student.id) && <span className="sr-only"> (en ligne)</span>}
                </span>
              </button>
            ))}
        </div>
      </Dialog>
    </div>
  )
}
