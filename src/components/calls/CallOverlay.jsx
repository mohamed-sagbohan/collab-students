import { useEffect, useRef } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react'
import { useCallContext } from './CallProvider'
import { Avatar } from '../ui/Avatar'

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const CONTROL_BTN = 'w-12 h-12 rounded-full flex items-center justify-center transition-colors'
const CONTROL_OFF = 'bg-destructive/15 text-destructive hover:bg-destructive/20'
const CONTROL_ON = 'bg-white/10 text-white hover:bg-white/20'

/**
 * Overlay plein écran de l'appel en cours — monté une fois par
 * CallProvider, au-dessus de tout (widget de chat compris).
 * Rend `null` hors appel (status 'idle').
 */
export default function CallOverlay() {
  const {
    call, localStream, remoteStream, muted, cameraOff, duration,
    acceptCall, declineCall, cancelCall, hangUp, toggleMute, toggleCamera,
  } = useCallContext()

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream ?? null
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream ?? null
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream ?? null
  }, [remoteStream])

  if (call.status === 'idle') return null

  const isVideo = call.callType === 'video'
  const inCall = call.status === 'connecting' || call.status === 'active'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Appel ${isVideo ? 'vidéo' : 'audio'}${call.peerName ? ` avec ${call.peerName}` : ''}`}
      className="fixed inset-0 z-[60] bg-neutral-950/97 flex flex-col items-center justify-center p-6 animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      {/* Piste audio distante : montée dès la connexion, même en visio
          (la vidéo <video> ne joue pas le son si on utilise <audio> à part
          — ici on laisse le son sur les balises vidéo, cet élément ne sert
          qu'à l'appel audio pur où aucune balise <video> n'est rendue). */}
      {inCall && !isVideo && <audio ref={remoteAudioRef} autoPlay className="hidden" />}

      {/* ── Sortant : ça sonne chez l'autre ── */}
      {call.status === 'outgoing' && (
        <div className="text-center">
          <Avatar name={call.peerName} className="w-24 h-24 text-3xl mx-auto mb-5 animate-pulse" />
          <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
          <p className="text-sm text-white/60 mb-10">Appel {isVideo ? 'vidéo' : 'audio'} en cours…</p>
          <button
            type="button"
            onClick={cancelCall}
            aria-label="Annuler l'appel"
            className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors mx-auto"
          >
            <PhoneOff className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Entrant : quelqu'un m'appelle ── */}
      {call.status === 'incoming' && (
        <div className="text-center">
          <Avatar name={call.peerName} className="w-24 h-24 text-3xl mx-auto mb-5" />
          <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
          <p className="text-sm text-white/60 mb-10">Appel {isVideo ? 'vidéo' : 'audio'} entrant…</p>
          <div className="flex items-center gap-8 justify-center">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={declineCall}
                aria-label="Refuser l'appel"
                className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <PhoneOff className="w-6 h-6" aria-hidden="true" />
              </button>
              <span className="text-xs text-white/60">Refuser</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={acceptCall}
                aria-label="Répondre"
                className="w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center hover:bg-success/90 transition-colors animate-pulse"
              >
                <Phone className="w-6 h-6" aria-hidden="true" />
              </button>
              <span className="text-xs text-white/60">Répondre</span>
            </div>
          </div>
        </div>
      )}

      {/* ── En communication ── */}
      {inCall && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          {isVideo ? (
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-5 shadow-2xl">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-3 right-3 w-28 sm:w-36 aspect-video rounded-xl object-cover border-2 border-white/20 shadow-lg bg-neutral-800"
              />
              {call.status === 'connecting' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-white text-sm font-medium">Connexion en cours…</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center mb-6">
              <Avatar name={call.peerName} className="w-28 h-28 text-4xl mx-auto mb-5" />
              <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
              <p className="text-sm text-white/60">
                {call.status === 'connecting' ? 'Connexion en cours…' : formatDuration(duration)}
              </p>
            </div>
          )}

          {isVideo && call.status === 'active' && (
            <p className="text-sm text-white/60 mb-4 tabular-nums">{formatDuration(duration)}</p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Réactiver le micro' : 'Couper le micro'}
              aria-pressed={muted}
              className={`${CONTROL_BTN} ${muted ? CONTROL_OFF : CONTROL_ON}`}
            >
              {muted ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>
            {isVideo && (
              <button
                type="button"
                onClick={toggleCamera}
                aria-label={cameraOff ? 'Réactiver la caméra' : 'Couper la caméra'}
                aria-pressed={cameraOff}
                className={`${CONTROL_BTN} ${cameraOff ? CONTROL_OFF : CONTROL_ON}`}
              >
                {cameraOff ? <VideoOff className="w-5 h-5" aria-hidden="true" /> : <Video className="w-5 h-5" aria-hidden="true" />}
              </button>
            )}
            <button
              type="button"
              onClick={hangUp}
              aria-label="Raccrocher"
              className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <PhoneOff className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── Fin d'appel (bref, se referme seul) ── */}
      {(call.status === 'ended' || call.status === 'failed') && (
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${call.status === 'failed' ? 'bg-destructive/15' : 'bg-white/10'}`}>
            <PhoneOff className={`w-7 h-7 ${call.status === 'failed' ? 'text-destructive' : 'text-white/70'}`} aria-hidden="true" />
          </div>
          <p className="font-bold text-white mb-1">
            {call.status === 'failed' ? 'Appel échoué' : 'Appel terminé'}
          </p>
          {call.error && <p className="text-sm text-white/60 max-w-xs mx-auto">{call.error}</p>}
        </div>
      )}
    </div>
  )
}
