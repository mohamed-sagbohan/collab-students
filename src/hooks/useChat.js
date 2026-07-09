import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageCompression'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { appendCallToCache, updateCallInCache } from './useCalls'

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

/** Fenêtre de modification d'un message après envoi (appliquée aussi côté serveur). */
export const EDIT_WINDOW_MS = 2 * 60 * 1000

export const MESSAGE_SELECT = `
  id, conversation_id, sender_id, body, lesson_id, created_at, edited_at,
  audio_path, audio_duration_sec, image_path, reply_to_id,
  profiles:sender_id (name, role),
  lessons:lesson_id (title, course_id),
  chat_reactions (emoji, user_id),
  chat_message_hides (user_id),
  reply_to:chat_messages!reply_to_id (id, body, audio_path, image_path, sender_id, profiles:sender_id (name))
`

/** Palette de réactions — doit rester alignée avec le CHECK de la migration 025. */
export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

const AUDIO_BUCKET = 'chat-audio'
const AUDIO_EXT = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg' }

const IMAGE_BUCKET = 'chat-images'
const IMAGE_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }

/** Taille max d'une pièce jointe image (alignée sur le bucket, migration 026). */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024

/** Le fichier est-il une image acceptée par le bucket chat-images ? */
export function isAllowedChatImage(file) {
  return !!file && !!IMAGE_EXT[file.type] && file.size <= IMAGE_MAX_BYTES
}

/** URL signée temporaire (1 h) pour lire une note vocale du bucket privé. */
export async function getChatAudioUrl(path) {
  const { data } = await supabase.storage.from(AUDIO_BUCKET).createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

/** URL signée temporaire (1 h) pour afficher une image du bucket privé. */
export async function getChatImageUrl(path) {
  const { data } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

/** Le message est-il encore modifiable (moins de 2 minutes) ? */
export function isWithinEditWindow(message) {
  return Date.now() - new Date(message.created_at).getTime() < EDIT_WINDOW_MS
}

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

/** Applique un patch (body, edited_at…) à un message du cache, embeds préservés. */
export function updateMessageInCache(queryClient, conversationId, messageId, patch) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        messages: p.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      })),
    }
  })
}

/** Retire un message (temporaire ou supprimé) de toutes les pages du cache. */
export function removeMessageFromCache(queryClient, conversationId, messageId) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== messageId) })),
    }
  })
}

/** Ajoute une réaction à un message du cache (idempotent : ignorée si déjà là). */
export function addReactionToCache(queryClient, conversationId, reaction) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        messages: p.messages.map((m) => {
          if (m.id !== reaction.message_id) return m
          const list = m.chat_reactions ?? []
          if (list.some((r) => r.user_id === reaction.user_id && r.emoji === reaction.emoji)) return m
          return { ...m, chat_reactions: [...list, { emoji: reaction.emoji, user_id: reaction.user_id }] }
        }),
      })),
    }
  })
}

/** Retire une réaction d'un message du cache (idempotent). */
export function removeReactionFromCache(queryClient, conversationId, messageId, userId, emoji) {
  queryClient.setQueryData(['chat-messages', conversationId], (old) => {
    if (!old) return old
    return {
      ...old,
      pages: old.pages.map((p) => ({
        ...p,
        messages: p.messages.map((m) => {
          if (m.id !== messageId || !m.chat_reactions?.length) return m
          return {
            ...m,
            chat_reactions: m.chat_reactions.filter((r) => !(r.user_id === userId && r.emoji === emoji)),
          }
        }),
      })),
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
    // Les messages « supprimés pour moi » (migration 028) sont écartés ici :
    // la RLS ne fait remonter que MES masquages dans l'embed.
    select: (data) =>
      data.pages
        .slice()
        .reverse()
        .flatMap((p) => p.messages)
        .filter((m) => !m.chat_message_hides?.length),
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
    mutationFn: async ({ body = null, lessonId = null, audio = null, image = null, replyToId = null }) => {
      // Pièce jointe : upload dans le bucket privé avant l'insertion du message.
      let audioPath = null
      if (audio?.blob) {
        const contentType = (audio.mimeType || audio.blob.type || 'audio/webm').split(';')[0]
        audioPath = `${conversationId}/${crypto.randomUUID()}.${AUDIO_EXT[contentType] ?? 'webm'}`
        const { error: uploadError } = await supabase.storage
          .from(AUDIO_BUCKET)
          .upload(audioPath, audio.blob, { contentType })
        if (uploadError) throw uploadError
      }
      let imagePath = null
      if (image?.file) {
        // Recompression WebP côté client (fallback : fichier original).
        const file = await compressImage(image.file)
        imagePath = `${conversationId}/${crypto.randomUUID()}.${IMAGE_EXT[file.type] ?? 'jpg'}`
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(imagePath, file, { contentType: file.type })
        if (uploadError) throw uploadError
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body: body?.trim() || null,
          lesson_id: lessonId,
          audio_path: audioPath,
          audio_duration_sec: audio ? Math.max(1, Math.round(audio.durationSec ?? 1)) : null,
          image_path: imagePath,
          reply_to_id: replyToId,
        })
        .select(MESSAGE_SELECT)
        .single()
      if (error) {
        // L'insertion a échoué après l'upload : on nettoie le fichier orphelin.
        if (audioPath) void supabase.storage.from(AUDIO_BUCKET).remove([audioPath])
        if (imagePath) void supabase.storage.from(IMAGE_BUCKET).remove([imagePath])
        throw error
      }
      return data
    },
    onMutate: async ({ body = null, lessonId = null, lessonTitle = null, audio = null, image = null, replyTo = null }) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', conversationId] })
      const tempId = `temp-${crypto.randomUUID()}`
      appendToCache(queryClient, conversationId, {
        id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        body: body?.trim() || null,
        lesson_id: lessonId,
        audio_path: null,
        audio_duration_sec: audio ? Math.max(1, Math.round(audio.durationSec ?? 1)) : null,
        image_path: null,
        // Aperçu local le temps de l'upload (URL révoquée par le composer).
        image_local_url: image?.previewUrl ?? null,
        reply_to_id: replyTo?.id ?? null,
        reply_to: replyTo
          ? {
              id: replyTo.id,
              body: replyTo.body,
              audio_path: replyTo.audio_path,
              image_path: replyTo.image_path,
              sender_id: replyTo.sender_id,
              profiles: { name: replyTo.profiles?.name },
            }
          : null,
        created_at: new Date().toISOString(),
        pending: true,
        profiles: { name: profile?.name, role: profile?.role },
        lessons: lessonId ? { title: lessonTitle, course_id: null } : null,
        chat_reactions: [],
      })
      return { tempId }
    },
    onSuccess: (row, _vars, ctx) => {
      replaceTemp(queryClient, conversationId, ctx.tempId, row)
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.tempId) removeMessageFromCache(queryClient, conversationId, ctx.tempId)
      toast.error('Message non envoyé. Vérifiez votre connexion et réessayez.')
    },
  })
}

/* ── Modification d'un message (le sien, < 2 min, RLS) ─────────────── */

export function useEditMessage(conversationId) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ messageId, body }) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .update({ body })
        .eq('id', messageId)
        .select(MESSAGE_SELECT)
        .single()
      // Si la fenêtre de 2 minutes est dépassée, la RLS ne matche aucune
      // ligne : .single() renvoie une erreur — message explicite.
      if (error) throw error
      return data
    },
    onSuccess: (row) => {
      updateMessageInCache(queryClient, conversationId, row.id, { body: row.body, edited_at: row.edited_at })
    },
    onError: () =>
      toast.error('Modification impossible : le délai de 2 minutes est peut-être dépassé.'),
  })
}

/* ── Suppression d'un message (RPC, migration 028) ─────────────────── */
/* Le serveur décide : dans les 2 minutes suivant l'envoi (ou admin), le
   message est supprimé POUR TOUT LE MONDE ('deleted') ; au-delà, il n'est
   masqué que pour l'appelant ('hidden') — l'interlocuteur le voit toujours. */

export function useDeleteMessage(conversationId) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ messageId }) => {
      const { data, error } = await supabase.rpc('delete_chat_message', { p_message_id: messageId })
      if (error) throw error
      return data // 'deleted' | 'hidden'
    },
    onSuccess: (mode, { messageId, audioPath = null, imagePath = null }) => {
      removeMessageFromCache(queryClient, conversationId, messageId)
      if (mode === 'deleted') {
        // Nettoyage de la pièce jointe associée (meilleur effort : un échec
        // laisse un fichier orphelin inoffensif, protégé par la RLS Storage).
        // JAMAIS en mode 'hidden' : l'autre participant voit encore le message.
        if (audioPath) void supabase.storage.from(AUDIO_BUCKET).remove([audioPath])
        if (imagePath) void supabase.storage.from(IMAGE_BUCKET).remove([imagePath])
        toast.success('Message supprimé pour tout le monde.')
      } else {
        toast.success('Message supprimé pour vous.')
      }
      // Aperçu/tri de la liste staff (sans effet côté apprenante : la clé n'existe pas)
      queryClient.invalidateQueries({ queryKey: ['staff-conversations'] })
    },
    onError: () => toast.error('Impossible de supprimer le message. Réessayez.'),
  })
}

/* ── Réactions emoji (migration 025) ───────────────────────────────── */

/** Ajoute ou retire SA réaction sur un message — optimiste, l'écho realtime
    est dédupliqué par les helpers de cache. */
export function useToggleReaction(conversationId) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ messageId, emoji, active }) => {
      if (active) {
        const { error } = await supabase
          .from('chat_reactions')
          .delete()
          .match({ message_id: messageId, user_id: user.id, emoji })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('chat_reactions')
          .insert({ message_id: messageId, user_id: user.id, emoji })
        if (error) throw error
      }
    },
    onMutate: async ({ messageId, emoji, active }) => {
      await queryClient.cancelQueries({ queryKey: ['chat-messages', conversationId] })
      if (active) {
        removeReactionFromCache(queryClient, conversationId, messageId, user.id, emoji)
      } else {
        addReactionToCache(queryClient, conversationId, { message_id: messageId, user_id: user.id, emoji })
      }
    },
    onError: (_err, { messageId, emoji, active }) => {
      // Annulation de l'optimiste : on ré-applique l'état précédent.
      if (active) {
        addReactionToCache(queryClient, conversationId, { message_id: messageId, user_id: user.id, emoji })
      } else {
        removeReactionFromCache(queryClient, conversationId, messageId, user.id, emoji)
      }
      toast.error("Impossible d'enregistrer la réaction. Réessayez.")
    },
  })
}

/* ── Accusés de lecture : curseurs des autres participants ─────────── */

/** Curseurs de lecture de la conversation (migration 024) — sert à afficher
    « Vu » sous son dernier message lu par l'autre côté. */
export function useConversationReads(conversationId) {
  const { user } = useAuth()

  const { data: reads = [] } = useQuery({
    queryKey: ['chat-peer-reads', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_reads')
        .select('user_id, last_read_at')
        .eq('conversation_id', conversationId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!conversationId && !!user,
    staleTime: 30_000,
  })

  return reads
}

/* ── Canal de conversation : nouveaux messages + « en train d'écrire » ── */

export function useConversationChannel({ conversationId, withPostgres = false, withCalls = false, onInsert }) {
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
      // Suppressions (REPLICA IDENTITY FULL, migration 021) : le message
      // disparaît en direct chez l'autre participant.
      channel.on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (!payload.old?.id) return
          removeMessageFromCache(queryClient, conversationId, payload.old.id)
          queryClient.invalidateQueries({ queryKey: ['chat-unread', conversationId] })
        }
      )
      // Modifications (migration 022) : le texte corrigé apparaît en direct.
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const row = payload.new
          if (!row?.id) return
          updateMessageInCache(queryClient, conversationId, row.id, { body: row.body, edited_at: row.edited_at })
        }
      )
      // Réactions emoji (migration 025) — dédupliquées face à l'optimiste.
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_reactions', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const r = payload.new
          if (r?.message_id) addReactionToCache(queryClient, conversationId, r)
        }
      )
      channel.on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_reactions', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const r = payload.old
          if (r?.message_id) removeReactionFromCache(queryClient, conversationId, r.message_id, r.user_id, r.emoji)
        }
      )
    }

    // Appels (migration 034+) : même topic que la signalisation WebRTC
    // (CallProvider.joinSignaling ouvre sa propre instance de canal sur ce
    // topic pendant un appel actif — plusieurs souscriptions au même topic
    // coexistent sans problème côté Supabase Realtime). Alimente le fil
    // fusionné messages+appels (useCalls.mergeChatFeed) uniquement si le
    // widget/onglet a déjà chargé ['calls', conversationId] en cache.
    if (withCalls) {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls', filter: `conversation_id=eq.${conversationId}` },
        (payload) => appendCallToCache(queryClient, conversationId, payload.new)
      )
      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'calls', filter: `conversation_id=eq.${conversationId}` },
        (payload) => updateCallInCache(queryClient, conversationId, payload.new.id, payload.new)
      )
    }

    // Curseurs de lecture (migration 024) : l'upsert de l'autre participant
    // arrive en INSERT ou UPDATE — dans les deux cas on rafraîchit le « Vu ».
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_reads', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const row = payload.new
        if (!row?.user_id || row.user_id === user.id) return
        queryClient.invalidateQueries({ queryKey: ['chat-peer-reads', conversationId] })
      }
    )

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
  }, [conversationId, user?.id, withPostgres, withCalls, queryClient]) // eslint-disable-line react-hooks/exhaustive-deps

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

/* ── Présence ──────────────────────────────────────────────────────── */

/** Heartbeat de présence de l'apprenante (migration 030) : un upsert
    toutes les 2 minutes suffit aux pastilles « en ligne » du staff —
    aucun canal realtime partagé entre toutes les connectées (coût N²).
    Au départ (fermeture d'onglet, navigation externe, déconnexion), le
    heartbeat est antidaté pour passer « hors ligne » immédiatement au
    lieu d'attendre l'expiration des 3 minutes. */
export function useStudentHeartbeat() {
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user || profile?.role !== 'apprenante') return
    let cancelled = false
    let accessToken = null

    const beat = () => {
      if (cancelled || document.visibilityState === 'hidden') return
      // Jeton conservé pour le signal de départ (fetch keepalive, hors client supabase).
      void supabase.auth.getSession().then(({ data }) => {
        accessToken = data?.session?.access_token ?? null
      })
      // ⚠️ Les builders PostgREST sont paresseux : sans .then()/await, la
      // requête ne part JAMAIS (un simple `void` la jette sans l'exécuter).
      supabase
        .from('user_presence')
        .upsert({ user_id: user.id, last_seen_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn('Heartbeat présence :', error.message)
        })
    }

    // pagehide (pas visibilitychange : changer d'onglet n'est pas partir).
    // fetch keepalive : survit au déchargement de la page, contrairement au
    // client supabase. NB multi-onglets : l'onglet restant re-signalera la
    // présence à son prochain battement (blip « hors ligne » bref, rare).
    const goOffline = () => {
      if (!accessToken) return
      void fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          keepalive: true,
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ last_seen_at: new Date(Date.now() - 10 * 60_000).toISOString() }),
        }
      ).catch(() => {})
    }

    beat()
    const id = setInterval(beat, 120_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') beat()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pagehide', goOffline)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pagehide', goOffline)
      goOffline() // déconnexion / changement de rôle : hors ligne tout de suite
    }
  }, [user?.id, profile?.role]) // eslint-disable-line react-hooks/exhaustive-deps
}

/** Nombre d'apprenantes en ligne (heartbeat < 3 min) — staff uniquement (RLS).
    Mise à jour temps réel par les événements user_presence (migration 031) ;
    le refetch périodique couvre les passages hors ligne par simple expiration
    (aucun événement n'est émis quand un heartbeat devient trop vieux). */
export function useOnlineStudents() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['online-students'],
    queryFn: async () => {
      const since = new Date(Date.now() - 3 * 60_000).toISOString()
      const { count, error } = await supabase
        .from('user_presence')
        .select('user_id', { count: 'exact', head: true })
        .gte('last_seen_at', since)
      if (error) throw error
      return count ?? 0
    },
    refetchInterval: 20_000,
  })

  useEffect(() => {
    const channel = supabase
      .channel('presence-monitor')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        () => queryClient.invalidateQueries({ queryKey: ['online-students'] })
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}

/** Canal de présence realtime — réservé au STAFF depuis la migration 030
    (peu de membres) : le widget apprenante le lit pour afficher « un
    membre de l'équipe est en ligne ». Les apprenantes ne s'y signalent
    plus (heartbeat en base à la place). */
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

export const STAFF_CONVERSATIONS_PAGE_SIZE = 30

/** Boîte de réception staff paginée (migration 030). Renvoie
    { active_count, archived_count, unread_total, total, conversations }. */
export function useStaffConversations({ archived = false, search = '', page = 0 } = {}) {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  return useQuery({
    queryKey: ['staff-conversations', 'list', archived, search, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_conversations', {
        p_archived: archived,
        p_search: search.trim() || null,
        p_limit: STAFF_CONVERSATIONS_PAGE_SIZE,
        p_offset: page * STAFF_CONVERSATIONS_PAGE_SIZE,
      })
      if (error) throw error
      return data
    },
    enabled: isStaff,
    staleTime: 15_000,
    // Rafraîchit les pastilles « en ligne » (présence par heartbeat)
    // sans attendre un événement de message.
    refetchInterval: 60_000,
    placeholderData: keepPreviousData,
  })
}

/** Total de non-lus (badge sidebar) — sans charger la liste (p_limit 0). */
export function useStaffUnreadTotal() {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  const { data: unreadTotal = 0 } = useQuery({
    queryKey: ['staff-conversations', 'badge'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_conversations', { p_limit: 0 })
      if (error) throw error
      return data?.unread_total ?? 0
    },
    enabled: isStaff,
    staleTime: 15_000,
  })

  return unreadTotal
}

/** Annuaire des apprenantes (staff) — pour initier une conversation. */
export function useStudentsDirectory(enabled = false) {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  return useQuery({
    queryKey: ['students-directory'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_students_directory')
      if (error) throw error
      return data ?? []
    },
    enabled: enabled && isStaff,
    staleTime: 60_000,
  })
}

/** Le staff ouvre (ou crée) le fil d'une apprenante donnée. */
export function useStartConversation() {
  return useMutation({
    mutationFn: async (studentId) => {
      const { data, error } = await supabase.rpc('staff_get_or_create_conversation', {
        p_student_id: studentId,
      })
      if (error) throw error
      return data // uuid de la conversation
    },
  })
}

/** Archiver / désarchiver une conversation (staff). La liste est paginée
    par onglet : on invalide (le fil change d'onglet, les compteurs bougent). */
export function useSetConversationArchived() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ conversationId, archived }) => {
      const { error } = await supabase.rpc('set_conversation_archived', {
        p_conversation_id: conversationId,
        p_archived: archived,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-conversations'] })
    },
    onError: () => toast.error("Impossible de modifier l'archivage. Réessayez."),
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
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const oldRow = payload.old
          queryClient.invalidateQueries({ queryKey: ['staff-conversations'] })
          if (oldRow?.conversation_id && queryClient.getQueryData(['chat-messages', oldRow.conversation_id])) {
            removeMessageFromCache(queryClient, oldRow.conversation_id, oldRow.id)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const row = payload.new
          queryClient.invalidateQueries({ queryKey: ['staff-conversations'] })
          if (row?.conversation_id && queryClient.getQueryData(['chat-messages', row.conversation_id])) {
            updateMessageInCache(queryClient, row.conversation_id, row.id, { body: row.body, edited_at: row.edited_at })
          }
        }
      )
      // Réactions emoji : n'alimente que les fils déjà en cache.
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_reactions' },
        (payload) => {
          const r = payload.new
          if (r?.conversation_id && queryClient.getQueryData(['chat-messages', r.conversation_id])) {
            addReactionToCache(queryClient, r.conversation_id, r)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_reactions' },
        (payload) => {
          const r = payload.old
          if (r?.conversation_id && queryClient.getQueryData(['chat-messages', r.conversation_id])) {
            removeReactionFromCache(queryClient, r.conversation_id, r.message_id, r.user_id, r.emoji)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, isStaff, queryClient]) // eslint-disable-line react-hooks/exhaustive-deps
}
