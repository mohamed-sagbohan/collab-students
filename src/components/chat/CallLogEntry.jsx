import { cn } from '@/lib/utils'
import { callStatusMeta, callDirectionIcon } from '../../hooks/useCalls'

const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

const VARIANT_CLASSES = {
  destructive: 'bg-destructive/10 border-destructive/20 text-destructive',
  success: 'bg-success/10 border-success/20 text-success',
  neutral: 'bg-muted border-border text-muted-foreground',
}

/**
 * Entrée d'appel dans le fil de chat — pilule centrée façon message
 * système (WhatsApp), pas une bulle gauche/droite comme MessageBubble.
 * Purement présentationnel, comme le reste de ChatThread : reçoit un
 * item `{kind:'call', ...}` produit par useCalls.mergeChatFeed.
 */
export default function CallLogEntry({ call, currentUserId, onCallBack }) {
  const meta = callStatusMeta(call)
  const isMine = call.caller_id === currentUserId
  const isVideo = call.call_type === 'video'
  const DirectionIcon = callDirectionIcon(call, isMine)

  let directionLabel = isMine ? 'Vous avez appelé' : (call.caller_name ?? 'Appel entrant')
  // Utile côté staff : qui, dans l'équipe, a décroché — n'a de sens que si
  // ce n'est ni moi, ni l'appelant (donc un·e collègue).
  if (call.callee_id && call.callee_id !== currentUserId && call.callee_id !== call.caller_id && call.callee_name) {
    directionLabel += ` · ${call.callee_name}`
  }

  const typeLabel = isVideo ? 'vidéo' : 'audio'
  const time = timeFmt.format(new Date(call.started_at))
  const ariaLabel = `${directionLabel} — appel ${typeLabel}, ${meta.label}, ${time}`
    + (onCallBack ? `, rappeler en ${typeLabel}` : '')

  return (
    <div className="flex justify-center my-2">
      <button
        type="button"
        onClick={onCallBack ? () => onCallBack(call.call_type) : undefined}
        disabled={!onCallBack}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors',
          VARIANT_CLASSES[meta.variant],
          onCallBack && 'hover:brightness-95 cursor-pointer',
          !onCallBack && 'cursor-default'
        )}
      >
        <DirectionIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{directionLabel} · {meta.label}</span>
        <span className="text-muted-foreground/70">{time}</span>
      </button>
    </div>
  )
}
