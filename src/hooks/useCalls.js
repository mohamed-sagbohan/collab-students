import { useCallback, useEffect } from 'react'
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
// l'appelant). Traité comme manqué ICI dès 60s pour un affichage
// réactif côté client (jamais d'écriture DB) ; la ligne elle-même n'est
// corrigée en base que ~90s+ plus tard, par le pg_cron de la
// migration 038 — délai volontaire, ce n'est qu'un rattrapage.
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

/** Un 'ringing' périmé (voir STALE_RINGING_MS ci-dessus) compte comme
    manqué — utilisé par callStatusMeta et par le badge d'appels manqués. */
export function isMissedCall(call) {
  const stale = call.status === 'ringing' && Date.now() - new Date(call.started_at).getTime() > STALE_RINGING_MS
  return stale || call.status === 'missed'
}

/** Statut affiché + variante de couleur — partagé entre
    CallHistoryList et la page staff. */
export function callStatusMeta(call) {
  const status = isMissedCall(call) ? 'missed' : call.status

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

/** Icône de direction/issue, utilisée par CallHistoryList. */
export function callDirectionIcon(call, isMine) {
  if (call.call_type === 'video') return Video
  return callStatusMeta(call).variant === 'destructive' ? PhoneMissed : isMine ? PhoneOutgoing : PhoneIncoming
}

/* ── Curseur « vu » du badge d'appels manqués (migration 037) ──────
   Une ligne par utilisateur (pas par conversation) : le badge est un
   total global aussi bien côté élève (une seule conversation) que
   côté staff (vue agrégée toutes conversations). ─────────────────── */

export function useCallBadgeSeenAt() {
  const { user } = useAuth()
  const query = useQuery({
    queryKey: ['call-badge-seen'],
    queryFn: async () => {
      const { data, error } = await supabase.from('call_badge_reads').select('seen_at').maybeSingle()
      if (error) throw error
      return data?.seen_at ?? null
    },
    enabled: !!user,
    staleTime: 30_000,
  })
  return query.data ?? null
}

/** Retourne une fonction à appeler quand l'utilisateur consulte ses
    appels (ouverture du widget élève, visite de la page staff). */
export function useMarkCallBadgeSeen() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useCallback(() => {
    if (!user) return
    const now = new Date().toISOString()
    queryClient.setQueryData(['call-badge-seen'], now)
    supabase
      .from('call_badge_reads')
      .upsert({ user_id: user.id, seen_at: now })
      .then(({ error }) => {
        if (error) console.warn('Marquage vu (appels) :', error.message)
      })
  }, [user, queryClient])
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

// Nombre d'appels manqués récents remontés pour le badge — largement
// suffisant en pratique (badge, pas un total exact), évite de paginer.
const MISSED_BADGE_LIMIT = 100

/** Badge « appels manqués » de la sidebar staff : nombre d'appels manqués
    (initiés par une étudiante) survenus après le curseur « vu »
    (call_badge_reads, migration 037). Se raccroche à la clé
    ['staff-calls'] : invalidée automatiquement par useStaffCallsRealtime. */
export function useStaffMissedCallsBadge() {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'formateur' || profile?.role === 'admin'
  const seenAt = useCallBadgeSeenAt()

  const query = useQuery({
    queryKey: ['staff-calls', 'missed-badge'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_staff_calls', {
        p_status: 'missed',
        p_limit: MISSED_BADGE_LIMIT,
        p_offset: 0,
      })
      if (error) throw error
      return data?.calls ?? []
    },
    enabled: isStaff,
    staleTime: 15_000,
  })

  // Seuls les appels initiés par une étudiante comptent comme « manqués »
  // du point de vue du staff — un appel sortant du staff resté sans
  // réponse n'est pas un appel que LE STAFF a manqué.
  const missedFromStudents = (query.data ?? []).filter((c) => c.caller_is_student)
  if (!seenAt) return missedFromStudents.length
  return missedFromStudents.filter((c) => new Date(c.started_at) > new Date(seenAt)).length
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
