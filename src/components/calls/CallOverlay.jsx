import { useEffect, useRef } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react'
import { useCallContext } from './CallProvider'
import { Avatar } from '../ui/Avatar'
import { IconBadge } from '../ui/IconBadge'
import { StatusBadge } from '../ui/StatusBadge'
import { formatDuration } from '../../hooks/useCalls'

const CONTROL_BTN = 'w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/40'
const CONTROL_OFF = 'bg-destructive/15 text-destructive hover:bg-destructive/20'
const CONTROL_ON = 'bg-white/10 text-white hover:bg-white/20'

/** Halo diffus derrière l'avatar — même motif que EmptyState, pour ancrer
    visuellement l'écran d'appel dans l'identité de marque de l'app. */
function AvatarGlow({ children }) {
  return (
    <div className="relative w-fit mx-auto mb-5">
      <div aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/25 blur-3xl scale-150" />
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * Overlay plein écran de l'appel en cours — monté une fois par
 * CallProvider, au-dessus de tout (widget de chat compris).
 * Rend `null` hors appel (status 'idle').
 */
export default function CallOverlay() {
  const {
    call, localStream, remoteStream, muted, cameraOff, duration,
    acceptCall, declineCall, cancelCall, hangUp, toggleMute, toggleCamera, dismissCall,
  } = useCallContext()

  // Le diagnostic technique ([diag] ICE=... local=... distant=...) est
  // concaténé au message convivial sur une seconde ligne — on les sépare
  // pour les afficher différemment (le diagnostic en police monospace).
  const [errorMessage, diagLine] = (call.error ?? '').split('\n')

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
  const inCall = call.status === 'connecting' || call.status === 'active' || call.status === 'reconnecting'
  const connecting = call.status === 'connecting'
  const reconnecting = call.status === 'reconnecting'
  const videoInCall = isVideo && inCall

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Appel ${isVideo ? 'vidéo' : 'audio'}${call.peerName ? ` avec ${call.peerName}` : ''}`}
      className="fixed inset-0 z-[60] bg-neutral-950/97 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200 motion-reduce:animate-none"
    >
      {/* Piste audio distante : montée dès la connexion, même en visio
          (la vidéo <video> ne joue pas le son si on utilise <audio> à part
          — ici on laisse le son sur les balises vidéo, cet élément ne sert
          qu'à l'appel audio pur où aucune balise <video> n'est rendue). */}
      {inCall && !isVideo && <audio ref={remoteAudioRef} autoPlay className="hidden" />}

      {/* ── Sortant : ça sonne chez l'autre ── */}
      {call.status === 'outgoing' && (
        <>
          <div className="text-center px-6">
            <AvatarGlow>
              <Avatar name={call.peerName} className="w-32 h-32 text-4xl" />
            </AvatarGlow>
            <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
            <p className="text-sm text-white/60">Appel {isVideo ? 'vidéo' : 'audio'} en cours…</p>
          </div>
          <div className="absolute bottom-10 sm:bottom-14 inset-x-0 flex justify-center animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={cancelCall}
              aria-label="Annuler l'appel"
              className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg shadow-black/40"
            >
              <PhoneOff className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {/* ── Entrant : quelqu'un m'appelle ── */}
      {call.status === 'incoming' && (
        <>
          <div className="text-center px-6">
            <AvatarGlow>
              <span className="relative inline-flex">
                <span aria-hidden="true" className="absolute inset-0 rounded-full ring-4 ring-primary/30 animate-ping motion-reduce:animate-none" />
                <Avatar name={call.peerName} className="w-32 h-32 text-4xl" />
              </span>
            </AvatarGlow>
            <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
            <p className="text-sm text-white/60">Appel {isVideo ? 'vidéo' : 'audio'} entrant…</p>
          </div>
          <div className="absolute bottom-10 sm:bottom-14 inset-x-0 flex items-center gap-8 justify-center animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={declineCall}
                aria-label="Refuser l'appel"
                className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg shadow-black/40"
              >
                <PhoneOff className="w-6 h-6" aria-hidden="true" />
              </button>
              <span className="text-xs text-white/60">Refuser</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="relative inline-flex">
                <span aria-hidden="true" className="absolute inset-0 rounded-full ring-4 ring-success/40 animate-ping motion-reduce:animate-none" />
                <button
                  type="button"
                  onClick={acceptCall}
                  aria-label="Répondre"
                  className="relative w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center hover:bg-success/90 transition-colors shadow-lg shadow-black/40 animate-pulse motion-reduce:animate-none"
                >
                  <Phone className="w-6 h-6" aria-hidden="true" />
                </button>
              </span>
              <span className="text-xs text-white/60">Répondre</span>
            </div>
          </div>
        </>
      )}

      {/* ── En communication (audio) ── */}
      {inCall && !isVideo && (
        <>
          <div className="text-center px-6">
            <AvatarGlow>
              <Avatar name={call.peerName} className="w-32 h-32 text-4xl" />
            </AvatarGlow>
            <p className="text-lg font-bold text-white mb-1">{call.peerName}</p>
            {reconnecting ? (
              <StatusBadge variant="warning">Connexion instable…</StatusBadge>
            ) : (
              <p className="text-sm text-white/60 tabular-nums">
                {connecting ? 'Connexion en cours…' : formatDuration(duration)}
              </p>
            )}
          </div>
          <div className="absolute bottom-10 sm:bottom-14 inset-x-0 flex items-center gap-4 justify-center">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Réactiver le micro' : 'Couper le micro'}
              aria-pressed={muted}
              className={`${CONTROL_BTN} ${muted ? CONTROL_OFF : CONTROL_ON}`}
            >
              {muted ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={hangUp}
              aria-label="Raccrocher"
              className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg shadow-black/40"
            >
              <PhoneOff className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      {/* ── En communication (vidéo) : plein écran façon WhatsApp ── */}
      {videoInCall && (
        <div className="absolute inset-0">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute top-4 right-4 w-28 sm:w-36 aspect-video rounded-xl object-cover border-2 border-white/20 shadow-lg bg-neutral-800"
          />

          {(connecting || reconnecting) && (
            <div className="absolute top-6 inset-x-0 flex justify-center">
              {reconnecting ? (
                <StatusBadge variant="warning">Connexion instable…</StatusBadge>
              ) : (
                <StatusBadge variant="neutral">Connexion en cours…</StatusBadge>
              )}
            </div>
          )}

          {call.status === 'active' && (
            <div className="absolute top-6 inset-x-0 flex justify-center">
              <span className="px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium tabular-nums">
                {formatDuration(duration)}
              </span>
            </div>
          )}

          {/* Scrim : la barre de contrôle doit rester lisible même sur une
              vidéo claire juste en dessous. */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-10 sm:bottom-14 inset-x-0 flex items-center gap-4 justify-center">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Réactiver le micro' : 'Couper le micro'}
              aria-pressed={muted}
              className={`${CONTROL_BTN} ${muted ? CONTROL_OFF : CONTROL_ON}`}
            >
              {muted ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              aria-label={cameraOff ? 'Réactiver la caméra' : 'Couper la caméra'}
              aria-pressed={cameraOff}
              className={`${CONTROL_BTN} ${cameraOff ? CONTROL_OFF : CONTROL_ON}`}
            >
              {cameraOff ? <VideoOff className="w-5 h-5" aria-hidden="true" /> : <Video className="w-5 h-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={hangUp}
              aria-label="Raccrocher"
              className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg shadow-black/40"
            >
              <PhoneOff className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── Fin d'appel (bref, se referme seul) ── */}
      {(call.status === 'ended' || call.status === 'failed') && (
        <div className="text-center px-6">
          <IconBadge
            icon={PhoneOff}
            size="lg"
            bg={call.status === 'failed' ? 'bg-destructive/15' : 'bg-white/10'}
            color={call.status === 'failed' ? 'text-destructive' : 'text-white/70'}
            className="mx-auto mb-4"
          />
          <p className="font-bold text-white mb-1">
            {call.status === 'failed' ? 'Appel échoué' : 'Appel terminé'}
          </p>
          {errorMessage && <p className="text-sm text-white/60 max-w-xs mx-auto">{errorMessage}</p>}
          {diagLine && (
            <p className="text-xs text-white/40 max-w-sm mx-auto mt-3 font-mono break-words select-text">
              {diagLine}
            </p>
          )}
          {call.status === 'failed' && (
            <button
              type="button"
              onClick={dismissCall}
              className="mt-6 px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      )}
    </div>
  )
}
