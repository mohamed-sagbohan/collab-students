import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'

/**
 * Logique partagée du chat de support (apprenante ↔ staff).
 *
 * Clés React Query :
 *   ['my-conversation']               → uuid | null   (apprenante)
 *   ['chat-messages', conversationId] → InfiniteData  (les deux rôles)
 *   ['chat-unread', conversationId]   → number        (apprenante)
 *   ['staff-conversations']           → Array (RPC)   (badge sidebar + page Messagerie)
 *
 * Canaux realtime :
 *   chat-conv-<id> : postgres_changes INSERT (apprenante) + broadcast typing
 *   chat-staff     : postgres_changes INSERT global (monté une fois dans AdminLayout)
 *   chat-presence  : presence globale (apprenantes track, staff lit)
 */

export const PAGE_SIZE = 30

export const MESSAGE_SELECT = `
  id, conversation_id, sender_id, body, lesson_id, created_at,
  profiles:sender_id (name, role),
  lessons:lesson_id (title, course_id)
`

/* ── Helpers de cache (infinite query : pages[0] = page la plus récente,
     chaque page stockée en ordre chronologique ASC) ─────────────────── */

export function appendToCache(queryClient, conversationId, message) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) {
      // Cache pas encore semé (conversation toute neuve) : on l'initialise.
      return { pages: [{ messages: [message], nextCursor: undefined }], pageParams: [null] }
    }
    if (old.pages.some((p) => p.messages.some((m) => m.id === message.id))) return old
    const pages = old.pages.slice()
    pages[0] = { ...pages[0], messages: [...pages[0].messages, message] }
    return { ...old, pages }
  })
}

function replaceTemp(queryClient, conversationId, tempId, realRow) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    const alreadyThere = old.pages.some((p) => p.messages.some((m) => m.id === realRow.id))
    const pages = old.pages.map((p) => ({
      ...p,
      messages: p.messages
        .filter((m) => m.id !== tempId || !alreadyThere)
        .map((m) => (m.id === tempId ? realRow : m)),
    }))
    return { ...old, pages }
  })
}

function removeTemp(queryClient, conversationId, tempId) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== tempId) })),
    }
  })
}

/** Recharge un message complet (avec profil + leçon) — le payload realtime n'a pas les jointures. */
export async function fetchFullMessage(id) {
  const { data } = await supabase.from('chat_messages').select(MESSAGE_SELECT).eq('id', id).single()
  return data ?? null
}

/* ── Conversation de l'apprenante ──────────────────────────────────── */

export function useMyConversation() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()

  const { data: conversationId = null, isLoading } = useQuery({
    queryKey: ['my-conversation'],
    queryFn: async () => {
      const { data } = await supabase.from('conversations').select('id').maybeSingle()
      return data?.id ?? null
    },
    enabled: !!user && profile?.role === 'apprenante',
    staleTime: Infinity,
  })

  const ensure = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('get_or_create_my_conversation')
      if (error) throw error
      return data
    },
    onSuccess: (id) => queryClient.setQueryData(['my-conversation'], id),
  })

  return {
    conversationId,
    isLoading,
    ensureConversation: ensure.mutateAsync,
    ensuring: ensure.isPending,
  }
}

/* ── Messages (pagination inversée, 30 par page) ───────────────────── */

export function useChatMessages(conversationId) {
  const query = useInfiniteQuery({
    queryKey: ['chat-messages', conversationId],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from('chat_messages')
        .select(MESSAGE_SELECT)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE)
      if (pageParam) q = q.lt('created_at', pageParam)
      const { data, error } = await q
      if (error) throw error
      const asc = [...data].reverse()
      return {
        messages: asc,
        // Curseur = created_at du plus ancien message chargé de cette page.
        nextCursor: data.length === PAGE_SIZE ? asc[0].created_at : undefined,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // Pages inversées puis aplaties → liste chronologique, dernier message en bas.
    select: (data) => data.pages.slice().reverse().flatMap((p) => p.messages),
    enabled: !!conversationId,
    staleTime: 30_000,
  })

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
  }
}

/* ── Envoi (optimiste) ─────────────────────────────────────────────── */

export function useSendMessage(conversationId) {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ body, lessonId = null }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ conversation_id: conversationId, sender_id: user.id, body, lesson_id: lessonId })
        .select(MESSAGE_SELECT)
        .single()
      if (error) throw error
      return data
    },
    onMutate: async ({ body, lessonId = null, lessonTitle = null }) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', conversationId] })
      const tempId = `temp-${crypto.randomUUID()}`
      appendToCache(queryClient, conversationId, {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        body,
        lesson_id: lessonId,
        created_at: new Date().toISOString(),
        pending: true,
        profiles: { name: profile?.name, role: profile?.role },
        lessons: lessonId ? { title: lessonTitle, course_id: null } : null,
      })
      return { tempId }
    },
    onSuccess: (row, _vars, ctx) => {
      replaceTemp(queryClient, conversationId, ctx.tempId, row)
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.tempId) removeTemp(queryClient, conversationId, ctx.tempId)
      toast.error('Message non envoyé. Vérifiez votre connexion et réessayez.')
    },
  })
}

/* ── Canal de conversation : nouveaux messages + « en train d'écrire » ── */

export function useConversationChannel({ conversationId, withPostgres = false, onInsert }) {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const [peerTyping, setPeerTyping] = useState(null) // { name } | null
  const [connected, setConnected] = useState(false)
  const channelRef = useRef(null)
  const typingTimerRef = useRef(null)
  const lastTypingSentRef = useRef(0)
  const hadDisconnectRef = useRef(false)
  // Callback passé par ref : le canal ne se re-souscrit jamais pour un handler instable.
  const onInsertRef = useRef(onInsert)
  onInsertRef.current = onInsert

  useEffect(() => {
    if (!conversationId || !user) return

    // Canal privé (migration 018) : seuls la propriétaire de la conversation
    // et le staff peuvent le rejoindre — policies RLS sur realtime.messages.
    const channel = supabase.channel(`chat-conv-${conversationId}`, {
      config: { private: true },
    })

    // Tous les bindings AVANT subscribe() — on ne peut pas en ajouter après.
    if (withPostgres) {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => onInsertRef.current?.(payload.new)
      )
    }

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload || payload.user_id === user.id) return
      setPeerTyping({ name: payload.name })
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => setPeerTyping(null), 3000)
    })

    // Les canaux privés exigent un jeton realtime à jour ; supabase-js le
    // propage automatiquement, on force par sécurité avant la souscription.
    let cancelled = false
    Promise.resolve(supabase.realtime.setAuth()).finally(() => {
      if (cancelled) return
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          if (hadDisconnectRef.current) {
            // Rattrapage après coupure : des messages ont pu être manqués.
            hadDisconnectRef.current = false
            queryClient.invalidateQueries({ queryKey: ['chat-messages', conversationId] })
            queryClient.invalidateQueries({ queryKey: ['chat-unread', conversationId] })
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnected(false)
          hadDisconnectRef.current = true
        }
      })
    })

    channelRef.current = channel
    return () => {
      cancelled = true
      clearTimeout(typingTimerRef.current)
      setPeerTyping(null)
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [conversationId, user?.id, withPostgres, queryClient]) // eslint-disable-line react-hooks/exhaustive-deps

  const sendTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingSentRef.current < 2000) return
    lastTypingSentRef.current = now
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user?.id, name: profile?.name },
    })
  }, [user?.id, profile?.name])

  return { sendTyping, peerTyping, connected }
}

/* ── Présence globale (pastilles « en ligne ») ─────────────────────── */

export function useChatPresence({ trackSelf = false } = {}) {
  const { user, profile } = useAuth()
  const [online, setOnline] = useState(() => new Map())

  useEffect(() => {
    if (!user) return
    // Canal privé (migration 018) : présence réservée aux utilisateurs
    // authentifiés, invisible pour les visiteurs anonymes.
    const channel = supabase.channel('chat-presence', {
      config: { private: true, presence: { key: user.id } },
    })

    const refresh = () => {
      const state = channel.presenceState()
      setOnline(new Map(Object.entries(state).map(([key, metas]) => [key, metas[0]])))
    }

    channel.on('presence', { event: 'sync' }, refresh)

    let cancelled = false
    Promise.resolve(supabase.realtime.setAuth()).finally(() => {
      if (cancelled) return
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && trackSelf) {
          await channel.track({
            user_id: user.id,
            name: profile?.name,
            role: profile?.role === 'apprenante' ? 'apprenante' : 'staff',
          })
        }
      })
    })

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [user?.id, trackSelf, profile?.name, profile?.role]) // eslint-disable-line react-hooks/exhaustive-deps

  return online
}

/* ── Non-lus de l'apprenante ───────────────────────────────────────── */

export function useMyUnread(conversationId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: unread = 0 } = useQuery({
    queryKey: ['chat-unread', conversationId],
    queryFn: async () => {
      const { data: cursor } = await supabase
        .from('chat_reads')
        .select('last_read_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle()
      const { count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .gt('created_at', cursor?.last_read_at ?? '1970-01-01')
      return count ?? 0
    },
    enabled: !!conversationId && !!user,
  })

  const markRead = useCallback(async () => {
    if (!conversationId || !user) return
    await supabase.from('chat_reads').upsert(
      { conversation_id: conversationId, user_id: user.id, last_read_at: new Date().toISOString() },
      { onConflict: 'conversation_id,user_id' }
    )
    queryClient.setQueryData(['chat-unread', conversationId], 0)
    // Auto-lecture des notifications de chat : la cloche se met à jour.
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('type', 'chat_message')
      .eq('read', false)
    queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })
  }, [conversationId, user, queryClient])

  return { unread, markRead }
}

/* ── Côté staff : liste des conversations + canal global ───────────── */

export function useStaffConversations() {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  return useQuery({
    queryKey: ['staff-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_conversations')
      if (error) throw error
      return data ?? []
    },
    enabled: isStaff,
    staleTime: 15_000,
  })
}

/** À appeler UNE seule fois, au niveau d'AdminLayout. Aucun state React :
    alimente uniquement le cache React Query (pas de re-render en cascade). */
export function useStaffChatRealtime() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  useEffect(() => {
    if (!user || !isStaff) return
    const channel = supabase
      .channel('chat-staff')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const row = payload.new
          queryClient.invalidateQueries({ queryKey: ['staff-conversations'] })
          if (row.sender_id === user.id) return
          // N'alimente le fil que s'il est déjà en cache (fil ouvert quelque part).
          if (queryClient.getQueryData(['chat-messages', row.conversation_id])) {
            const full = await fetchFullMessage(row.id)
            if (full) appendToCache(queryClient, row.conversation_id, full)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, isStaff, queryClient]) // eslint-disable-line react-hooks/exhaustive-deps
}
