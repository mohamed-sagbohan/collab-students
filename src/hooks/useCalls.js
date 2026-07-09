import { useEffect } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Logique partagée de l'historique des appels (domaine séparé de
 * useChat.js : `calls` a sa propre table/provider WebRTC).
 *
 * Clés React Query :
 *   ['calls', conversationId] → Array (fil par conversation, non paginé)
 *   ['staff-calls', ...]      → { total, calls } (RPC, page /appels)
 *
 * Canaux realtime :
 *   chat-conv-<id> : postgres_changes INSERT/UPDATE sur `calls` quand
 *                    useConversationChannel({withCalls: true}) — même
 *                    topic que la signalisation WebRTC (CallProvider).
 *   calls-staff    : postgres_changes global, monté une fois dans
 *                    AdminLayout (comme chat-staff pour les messages).
 */

export const CALLS_SELECT =
  'id, conversation_id, caller_id, callee_id, call_type, status, started_at, answered_at, ended_at, caller_name, callee_name'

export const STAFF_CALLS_PAGE_SIZE = 20
// Volume d'appels par conversation très inférieur à celui des messages —
// une seule page suffit, pas besoin d'une pagination par curseur.
const CALLS_FETCH_LIMIT = 500
// Un appel resté 'ringing' plus longtemps que le minuteur de sonnerie
// côté client (45s, CallProvider) + marge n'a pas pu passer par
// missed/declined/accepted normalement (onglet fermé, réseau coupé chez
// l'appelant) : aucun cron ne l'expire côté serveur, donc on le traite
// comme manqué à l'affichage seulement (jamais d'écriture DB ici).
const STALE_RINGING_MS = 60_000

export function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/* ── Fil par conversation ─────────────────────────────────────────── */

export function useConversationCalls(conversationId) {
  const query = useQuery({
    queryKey: ['calls', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(CALLS_SELECT)
        .eq('conversation_id', conversationId)
        .order('started_at', { ascending: true })
        .limit(CALLS_FETCH_LIMIT)
      if (error) throw error
      return data
    },
    enabled: !!conversationId,
    staleTime: 30_000,
  })

  return { calls: query.data ?? [], isLoading: query.isLoading }
}

export function appendCallToCache(queryClient, conversationId, call) {
  queryClient.setQueryData(['calls', conversationId], (old) => {
    if (!old) return [call]
    if (old.some((c) => c.id === call.id)) return old
    return [...old, call]
  })
}

export function updateCallInCache(queryClient, conversationId, callId, patch) {
  queryClient.setQueryData(['calls', conversationId], (old) => {
    if (!old) return old
    return old.map((c) => (c.id === callId ? { ...c, ...patch } : c))
  })
}

/** Fusionne messages et appels en un seul fil chronologique — `kind`
    discrimine le rendu dans ChatThread (MessageBubble vs CallLogEntry).
    `started_at` est aliasé en `created_at` pour que le tri par jour déjà
    en place dans ChatThread continue de fonctionner sans modification. */
export function mergeChatFeed(messages, calls) {
  const tagged = [
    ...messages.map((m) => ({ ...m, kind: 'message' })),
    ...calls.map((c) => ({ ...c, kind: 'call', created_at: c.started_at })),
  ]
  return tagged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
}

/** Statut affiché + variante de couleur — partagé entre CallLogEntry,
    CallHistoryList et la page staff. */
export function callStatusMeta(call) {
  const stale = call.status === 'ringing' && Date.now() - new Date(call.started_at).getTime() > STALE_RINGING_MS
  const status = stale ? 'missed' : call.status

  switch (status) {
    case 'ringing':
    case 'accepted':
      return { label: 'Appel en cours…', variant: 'neutral' }
    case 'declined':
      return { label: 'Appel refusé', variant: 'destructive' }
    case 'missed':
      return { label: 'Appel manqué', variant: 'destructive' }
    case 'failed':
      return { label: 'Échec de l’appel', variant: 'destructive' }
    case 'ended': {
      const secs = call.answered_at && call.ended_at
        ? Math.max(0, Math.round((new Date(call.ended_at) - new Date(call.answered_at)) / 1000))
        : null
      return { label: secs != null ? formatDuration(secs) : 'Appel terminé', variant: 'success' }
    }
    default:
      return { label: 'Appel', variant: 'neutral' }
  }
}

/** Icône de direction/issue — partagée entre CallLogEntry et
    CallHistoryList pour ne pas dupliquer la sélection. */
export function callDirectionIcon(call, isMine) {
  if (call.call_type === 'video') return Video
  return callStatusMeta(call).variant === 'destructive' ? PhoneMissed : isMine ? PhoneOutgoing : PhoneIncoming
}

/* ── Page staff (toutes conversations) ───────────────────────────── */

export function useStaffCalls({ callType = null, status = null, search = '', page = 0 } = {}) {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  const query = useQuery({
    queryKey: ['staff-calls', callType, status, search, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_calls', {
        p_call_type: callType,
        p_status: status,
        p_search: search.trim() || null,
        p_limit: STAFF_CALLS_PAGE_SIZE,
        p_offset: page * STAFF_CALLS_PAGE_SIZE,
      })
      if (error) throw error
      return data // { total, calls }
    },
    enabled: isStaff,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  })

  return {
    calls: query.data?.calls ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

/** À appeler UNE seule fois, au niveau d'AdminLayout — comme
    useStaffChatRealtime. Aucun state React : alimente uniquement le
    cache React Query. */
export function useStaffCallsRealtime() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'

  useEffect(() => {
    if (!user || !isStaff) return
    const channel = supabase
      .channel('calls-staff')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, (payload) => {
        const row = payload.new
        queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
        if (queryClient.getQueryData(['calls', row.conversation_id])) {
          appendCallToCache(queryClient, row.conversation_id, row)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, (payload) => {
        const row = payload.new
        queryClient.invalidateQueries({ queryKey: ['staff-calls'] })
        if (queryClient.getQueryData(['calls', row.conversation_id])) {
          updateCallInCache(queryClient, row.conversation_id, row.id, row)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user, isStaff, queryClient])
}
