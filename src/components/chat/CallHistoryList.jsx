import { Phone, Video } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { callStatusMeta, callDirectionIcon } from '../../hooks/useCalls'
import { EmptyState } from '../ui/EmptyState'

const ICON_VARIANT_CLASSES = {
  destructive: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
  neutral: 'bg-muted text-muted-foreground',
}

/**
 * Historique des appels d'une conversation — liste compacte, plus récent
 * en premier. Purement présentationnel (comme ChatThread) : reçoit la
 * même donnée que le fil fusionné (useConversationCalls), pas de fetch
 * propre.
 */
export default function CallHistoryList({ calls, currentUserId, onCallBack }) {
  if (calls.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={Phone}
          title="Aucun appel pour l’instant"
          description="Les appels passés avec le support apparaîtront ici."
        />
      </div>
    )
  }

  const sorted = [...calls].sort((a, b) => new Date(b.started_at) - new Date(a.started_at))

  return (
    <ol className="p-2 space-y-1">
      {sorted.map((call) => {
        const meta = callStatusMeta(call)
        const isMine = call.caller_id === currentUserId
        const Icon = callDirectionIcon(call, isMine)
        const label = isMine ? 'Vous avez appelé' : (call.caller_name ?? 'Appel entrant')

        return (
          <li key={call.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/60 transition-colors">
            <span className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', ICON_VARIANT_CLASSES[meta.variant])}>
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{label}</p>
              <p className="text-xs text-muted-foreground">
                {meta.label} · {timeAgo(call.started_at)}
              </p>
            </div>
            {onCallBack && (
              <button
                type="button"
                onClick={() => onCallBack(call.call_type)}
                aria-label={`Rappeler en ${call.call_type === 'video' ? 'vidéo' : 'audio'}`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                {call.call_type === 'video' ? <Video className="w-4 h-4" aria-hidden="true" /> : <Phone className="w-4 h-4" aria-hidden="true" />}
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
