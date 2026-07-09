import { useEffect, useMemo, useState } from 'react'
import { Phone, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCallContext } from './CallProvider'
import { useConversationCalls, isMissedCall, useCallBadgeSeenAt, useMarkCallBadgeSeen } from '../../hooks/useCalls'
import { useMyConversation, useChatPresence, useConversationChannel } from '../../hooks/useChat'
import CallHistoryList from './CallHistoryList'

/**
 * Widget flottant dédié à l'historique des appels, distinct du widget de
 * chat (le fil de discussion ne doit plus rien afficher des appels — voir
 * [[feedback-ui-inline-content-density]]). Réservé à l'apprenante ; le
 * staff a sa propre page dédiée (/formateur/appels, /admin/appels).
 */
export default function CallHistoryWidget() {
  const { profile } = useAuth()
  if (profile?.role !== 'apprenante') return null
  return <CallHistoryWidgetInner />
}

function CallHistoryWidgetInner() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  // Passif : ne crée jamais la conversation (contrairement à ChatWidget) —
  // sans conversation, il n'y a de toute façon aucun appel à lister.
  const { conversationId } = useMyConversation()
  // Chargé même bouton fermé : nécessaire pour le badge d'appels manqués.
  const { calls } = useConversationCalls(conversationId)
  // withCalls tient la liste à jour en temps réel — même topic que la
  // signalisation WebRTC (voir useConversationChannel).
  useConversationChannel({ conversationId, withCalls: true })

  const online = useChatPresence()
  const staffOnline = useMemo(
    () => [...online.values()].some((m) => m.role === 'staff'),
    [online]
  )
  const { call: activeCall, startCall } = useCallContext()
  const canCall = staffOnline && activeCall.status === 'idle' && !!conversationId
  const onCallBack = canCall ? (callType) => startCall({ conversationId, callType, peerName: 'Support LearnIT' }) : undefined

  // Badge « appels manqués » : curseur « vu » en base (call_badge_reads,
  // migration 037), marqué à chaque ouverture du panneau.
  const seenAt = useCallBadgeSeenAt()
  const markSeen = useMarkCallBadgeSeen()
  useEffect(() => {
    if (open) markSeen()
  }, [open, markSeen])
  const missedCount = calls.filter(
    (c) => c.caller_id !== user.id && isMissedCall(c) && (!seenAt || new Date(c.started_at) > new Date(seenAt))
  ).length

  return (
    <>
      {/* Bouton flottant — empilé au-dessus de celui du chat. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer l’historique des appels' : 'Voir l’historique des appels'}
        aria-expanded={open}
        className="fixed z-50 bottom-40 right-4 lg:bottom-24 lg:right-6 w-12 h-12 rounded-full bg-card border border-border shadow-lg text-foreground flex items-center justify-center hover:bg-muted transition-colors"
      >
        {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Phone className="w-5 h-5" aria-hidden="true" />}
        {!open && missedCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background"
            aria-label={`${missedCount} appel${missedCount > 1 ? 's' : ''} manqué${missedCount > 1 ? 's' : ''}`}
          >
            {missedCount > 9 ? '9+' : missedCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Historique des appels"
          className="fixed z-50 inset-0 sm:inset-auto sm:bottom-[9.5rem] sm:right-6 sm:w-[340px] sm:h-[min(28rem,calc(100dvh-13rem))] bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-2xl flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] sm:pb-0 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <p className="flex-1 text-sm font-bold text-foreground">Appels</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer l’historique des appels"
              className="inline-flex items-center justify-center w-11 h-11 -my-1 -mr-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <CallHistoryList calls={calls} currentUserId={user.id} onCallBack={onCallBack} />
          </div>
        </div>
      )}
    </>
  )
}
