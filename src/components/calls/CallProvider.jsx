import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { getIceServers, getLocalMedia, stopStream, mediaErrorMessage } from '../../lib/webrtc'
import CallOverlay from './CallOverlay'

/**
 * Appels audio/vidéo 1-à-1 (apprenante ↔ staff) en WebRTC pur.
 *
 * Cycle de vie porté par la table `calls` (migration 034), visible en
 * realtime par l'apprenante concernée ET tout le staff — un appel entrant
 * sonne même si le destinataire n'a pas cette conversation ouverte.
 * Le SDP offer/answer et les candidats ICE, eux, transitent en broadcast
 * sur le canal `chat-conv-<conversationId>` déjà autorisé (migration 018),
 * exactement comme l'indicateur « en train d'écrire ».
 *
 * Asymétrie du refus, assumée : quand l'apprenante est LA seule
 * destinataire (staff → elle), son refus est définitif (status='declined').
 * Quand c'est le staff qui est appelé (bassin partagé, apprenante → staff),
 * un refus individuel n'est qu'un retrait local — un collègue peut encore
 * répondre ; seul un décrochage (accepted) ou l'expiration (missed) est
 * partagé.
 */

const CallContext = createContext(null)
export function useCallContext() {
  return useContext(CallContext)
}

const RING_TIMEOUT_MS = 45_000     // personne ne répond → l'appel expire côté appelant
const OFFER_RETRY_MS = 1_500       // renvoi de l'offre tant qu'aucune réponse (absorbe l'éventuelle course d'abonnement au canal)
const END_SCREEN_MS = 2_500        // durée d'affichage de l'écran « Appel terminé »
const RECONNECT_GRACE_MS = 6_000   // coupure réseau transitoire (mobile…) : délai avant de tenter un redémarrage ICE
const RECONNECT_GIVEUP_MS = 20_000 // au-delà, on abandonne et affiche l'échec (avec diagnostic)

// Extrait le type ICE (host/srflx/relay) depuis la chaîne du candidat —
// ni RTCIceCandidate.toJSON() ni la sérialisation broadcast ne portent
// la propriété .type calculée par le navigateur, il faut la reparser.
function candidateType(candidateInit) {
  return /\btyp (\w+)/.exec(candidateInit?.candidate ?? '')?.[1] ?? 'inconnu'
}

function diagSummary(session, pc) {
  const local = [...session.diag.localTypes].join(', ') || 'aucun'
  const remote = [...session.diag.remoteTypes].join(', ') || 'aucun'
  return `[diag] ICE=${pc?.iceConnectionState ?? '?'} gathering=${pc?.iceGatheringState ?? '?'} `
    + `local=${local} distant=${remote} (${session.diag.remoteCount} reçus)`
}

const initialState = {
  status: 'idle', // idle | outgoing | incoming | connecting | active | reconnecting | ended | failed
  callId: null,
  conversationId: null,
  callType: null, // 'audio' | 'video'
  peerName: null,
  isCaller: false,
  error: null,
}

export function CallProvider({ children }) {
  const { user, profile } = useAuth()
  const [call, setCall] = useState(initialState)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [duration, setDuration] = useState(0)

  // Session en cours : tout ce qui est mutable et ne doit pas déclencher
  // de re-render (connexion pair-à-pair, canal de signalisation, flux
  // local, candidats ICE en attente, minuteurs).
  const session = useRef({
    pc: null,
    channel: null,
    localStream: null,
    iceServers: null,     // STUN + relais TURN, récupérés au début de chaque appel
    pendingIce: [],
    ringTimeout: null,
    offerRetry: null,
    durationTimer: null,
    reconnectTimer: null, // grâce avant restartIce() après une coupure ('disconnected')
    giveUpTimer: null,    // au-delà, on affiche l'échec même si l'état oscille encore
    diag: { localTypes: new Set(), remoteTypes: new Set(), remoteCount: 0 }, // diagnostic ICE, voir createPc
  }).current

  const callRef = useRef(call)
  callRef.current = call

  // Indirection nécessaire : createPc (défini plus bas) référence
  // attemptIceRestart, elle-même définie après createPc dans ce composant.
  const attemptIceRestartRef = useRef(null)

  const resetSession = useCallback(() => {
    clearTimeout(session.ringTimeout)
    clearInterval(session.offerRetry)
    clearInterval(session.durationTimer)
    clearTimeout(session.reconnectTimer)
    clearTimeout(session.giveUpTimer)
    session.pc?.close()
    session.pc = null
    if (session.channel) {
      supabase.removeChannel(session.channel)
      session.channel = null
    }
    stopStream(session.localStream)
    session.localStream = null
    session.pendingIce = []
    session.diag = { localTypes: new Set(), remoteTypes: new Set(), remoteCount: 0 }
    setLocalStream(null)
    setRemoteStream(null)
    setMuted(false)
    setCameraOff(false)
    setDuration(0)
  }, [session])

  /** Termine la session courante. `status` null = retour direct à idle
      (refus, course perdue) ; sinon un bref écran de fin s'affiche —
      sauf en échec, où l'écran reste (diagnostic à lire/capturer) jusqu'à
      fermeture manuelle (dismissCall). */
  const endWithStatus = useCallback((status, error = null) => {
    resetSession()
    if (!status || status === 'idle') {
      setCall(initialState)
      return
    }
    setCall((c) => ({ ...c, status, error }))
    if (status !== 'failed') {
      setTimeout(() => setCall(initialState), END_SCREEN_MS)
    }
  }, [resetSession])

  const dismissCall = useCallback(() => setCall(initialState), [])

  /* ── Connexion pair-à-pair ──────────────────────────────────── */
  const createPc = useCallback((callId) => {
    // Récupérés en amont (startCall/acceptCall), en parallèle de l'accès
    // au micro/caméra — jamais d'attente supplémentaire à cette étape.
    const pc = new RTCPeerConnection({ iceServers: session.iceServers })
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const type = candidateType(e.candidate)
        // Capturé maintenant : si l'appel se termine pendant l'aller-retour
        // d'ack (ci-dessous), session.diag sera déjà celui du prochain
        // appel — on ne doit pas le polluer avec un candidat de celui-ci.
        const diag = session.diag
        // N'entre dans le diagnostic qu'une fois l'envoi confirmé par le
        // serveur realtime (ack) — la génération locale seule ne prouve
        // pas que le candidat a bien quitté cet appareil (canal pas
        // encore 'joined', etc.).
        session.channel?.send({
          type: 'broadcast',
          event: 'call-ice',
          payload: { callId, candidate: e.candidate, from: user.id },
        }).then((status) => {
          if (status === 'ok') diag.localTypes.add(type)
        })
      }
    }
    pc.ontrack = (e) => setRemoteStream(e.streams[0])
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        clearTimeout(session.reconnectTimer)
        clearTimeout(session.giveUpTimer)
        session.reconnectTimer = null
        session.giveUpTimer = null
        setCall((c) => (c.status === 'connecting' || c.status === 'reconnecting' ? { ...c, status: 'active' } : c))
      }
      // L'échec est entièrement piloté par oniceconnectionstatechange
      // ci-dessous (retry inclus) — pas de sortie immédiate ici, pour ne
      // pas court-circuiter la tentative de redémarrage ICE.
    }
    // Coupure réseau transitoire (changement de tour mobile, Wi-Fi
    // instable…) : 'disconnected' précède presque toujours 'failed', mais
    // se rétablit très souvent tout seul en quelques secondes — on laisse
    // une chance de reconnexion (UI dédiée) avant de tenter un
    // redémarrage ICE actif. 'failed', lui, ne se rétablit jamais tout
    // seul (y compris au tout premier essai, avant même d'être passé par
    // 'disconnected') : on retente aussitôt, sans délai de grâce.
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (state === 'connected' || state === 'completed') {
        clearTimeout(session.reconnectTimer)
        clearTimeout(session.giveUpTimer)
        session.reconnectTimer = null
        session.giveUpTimer = null
        return
      }
      if ((state === 'disconnected' || state === 'failed') && !session.reconnectTimer) {
        setCall((c) => (c.status === 'active' || c.status === 'connecting' ? { ...c, status: 'reconnecting' } : c))
        session.reconnectTimer = setTimeout(() => {
          session.reconnectTimer = null
          attemptIceRestartRef.current?.(callId)
        }, state === 'failed' ? 0 : RECONNECT_GRACE_MS)
        session.giveUpTimer ??= setTimeout(() => {
          endWithStatus('failed', `Impossible d’établir la connexion. Réessayez, ou changez de réseau.\n${diagSummary(session, pc)}`)
        }, RECONNECT_GIVEUP_MS)
      }
    }
    session.localStream?.getTracks().forEach((track) => pc.addTrack(track, session.localStream))
    session.pc = pc
    return pc
  }, [session, user?.id, endWithStatus])

  /* ── Signalisation : rejoint le canal de la conversation (déjà
     autorisé pour l'apprenante propriétaire + tout le staff) ────── */
  const joinSignaling = useCallback((conversationId, callId, { isCaller }) => {
    // broadcast.ack : nécessaire pour que channel.send() attende la
    // confirmation serveur au lieu de résoudre en fire-and-forget — voir
    // pc.onicecandidate ci-dessus (diagnostic ICE basé sur l'envoi
    // confirmé, pas la simple génération locale).
    const channel = supabase.channel(`chat-conv-${conversationId}`, { config: { private: true, broadcast: { ack: true } } })

    // Côté appelé : reçoit l'offre, répond. L'offre est RENVOYÉE
    // périodiquement par l'appelant tant qu'aucune réponse n'est reçue
    // (absorbe une éventuelle course d'abonnement), et une NOUVELLE offre
    // arrive aussi lors d'un redémarrage ICE après coupure (voir
    // attemptIceRestart) — dans les deux cas, une offre n'est valide à
    // traiter QUE depuis l'état 'stable' (source de vérité JSEP native,
    // contrairement à un simple booléen qui bloquerait aussi les
    // renégociations légitimes).
    channel.on('broadcast', { event: 'call-offer' }, async ({ payload }) => {
      if (payload.callId !== callId || isCaller || !session.pc || session.pc.signalingState !== 'stable') return
      await session.pc.setRemoteDescription(payload.sdp)
      for (const c of session.pendingIce) await session.pc.addIceCandidate(c)
      session.pendingIce = []
      const answer = await session.pc.createAnswer()
      await session.pc.setLocalDescription(answer)
      channel.send({ type: 'broadcast', event: 'call-answer', payload: { callId, sdp: answer } })
    })

    // Côté appelant : reçoit la réponse — une réponse n'est valide que
    // depuis 'have-local-offer' (offre initiale OU redémarrage ICE en
    // cours) ; un doublon de retry arrivant après coup est ignoré car
    // l'état sera déjà repassé à 'stable'.
    channel.on('broadcast', { event: 'call-answer' }, async ({ payload }) => {
      if (payload.callId !== callId || !isCaller || !session.pc || session.pc.signalingState !== 'have-local-offer') return
      clearInterval(session.offerRetry)
      await session.pc.setRemoteDescription(payload.sdp)
      for (const c of session.pendingIce) await session.pc.addIceCandidate(c)
      session.pendingIce = []
    })

    // Candidats ICE, dans les deux sens (bufferisés si la description
    // distante n'est pas encore posée — race normale en WebRTC).
    channel.on('broadcast', { event: 'call-ice' }, async ({ payload }) => {
      if (payload.callId !== callId || payload.from === user.id || !session.pc) return
      session.diag.remoteTypes.add(candidateType(payload.candidate))
      session.diag.remoteCount += 1
      if (session.pc.remoteDescription) await session.pc.addIceCandidate(payload.candidate)
      else session.pendingIce.push(payload.candidate)
    })

    // Raccroché arrive plus vite par broadcast que par la mise à jour
    // en base (utile pour couper immédiatement côté pair).
    channel.on('broadcast', { event: 'call-hangup' }, ({ payload }) => {
      if (payload.callId === callId) endWithStatus('ended')
    })

    Promise.resolve(supabase.realtime.setAuth()).finally(() => channel.subscribe())
    session.channel = channel
  }, [session, user?.id, endWithStatus])

  /* ── Appelant : dès que l'appel est accepté, crée et envoie l'offre.
     Renvoyée périodiquement tant qu'aucune réponse (absorbe la course
     entre l'abonnement du canal côté appelé et l'envoi côté appelant). ── */
  const proceedAsCaller = useCallback(async (callId) => {
    clearTimeout(session.ringTimeout)
    setCall((c) => ({ ...c, status: 'connecting' }))
    try {
      const pc = createPc(callId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      const send = () => session.channel?.send({ type: 'broadcast', event: 'call-offer', payload: { callId, sdp: offer } })
      send()
      session.offerRetry = setInterval(send, OFFER_RETRY_MS)
    } catch (err) {
      endWithStatus('failed', mediaErrorMessage(err))
    }
  }, [session, createPc, endWithStatus])

  /* ── Reconnexion après coupure transitoire (mobile, Wi-Fi instable…) ──
     Seul l'appelant redémarre ICE (règle WebRTC : c'est toujours celui
     qui a l'offre qui renégocie) ; l'appelé reçoit la nouvelle offre via
     le handler 'call-offer' déjà branché, comme pour l'offre initiale. */
  const attemptIceRestart = useCallback(async (callId) => {
    const pc = session.pc
    if (!pc || !callRef.current.isCaller) return
    const state = pc.iceConnectionState
    if (state === 'connected' || state === 'completed') return // rétabli entre-temps
    try {
      const offer = await pc.createOffer({ iceRestart: true })
      await pc.setLocalDescription(offer)
      const send = () => session.channel?.send({ type: 'broadcast', event: 'call-offer', payload: { callId, sdp: offer } })
      send()
      clearInterval(session.offerRetry)
      session.offerRetry = setInterval(send, OFFER_RETRY_MS)
    } catch {
      // Le giveUpTimer (déjà armé au moment de la coupure) prendra le
      // relais si la connexion ne se rétablit toujours pas.
    }
  }, [session])
  attemptIceRestartRef.current = attemptIceRestart

  /* ── Écoute globale du cycle de vie (table calls) ────────────────
     Toujours active tant que l'utilisateur est connecté : c'est elle
     qui fait sonner un appel entrant même sur une autre page. ────── */
  useEffect(() => {
    if (!user || !profile) return
    const isStaff = profile.role === 'formateur' || profile.role === 'admin'

    const channel = supabase
      .channel('calls-lifecycle')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, (payload) => {
        const row = payload.new
        if (row.caller_id === user.id) return // c'est moi qui appelle, déjà géré par startCall
        if (row.status !== 'ringing') return
        if (callRef.current.status !== 'idle') return // déjà en communication ailleurs
        if (!isStaff && profile.role !== 'apprenante') return
        setCall({
          ...initialState,
          status: 'incoming',
          callId: row.id,
          conversationId: row.conversation_id,
          callType: row.call_type,
          // Porté par la ligne elle-même (l'appelant transmet son propre
          // nom à la création) : évite une lecture RLS-sensible sur profiles.
          peerName: row.caller_name ?? 'Quelqu’un',
          isCaller: false,
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls' }, (payload) => {
        const row = payload.new
        const current = callRef.current
        if (row.id !== current.callId) return

        if (row.status === 'accepted') {
          if (current.isCaller && current.status === 'outgoing') {
            proceedAsCaller(row.id)
          } else if (!current.isCaller && current.status === 'incoming' && row.callee_id !== user.id) {
            // Un collègue a décroché avant moi.
            endWithStatus(null)
          }
        } else if (['declined', 'missed', 'ended', 'failed'].includes(row.status)) {
          if (current.status === 'incoming' || current.status === 'outgoing') {
            endWithStatus(row.status === 'declined' || row.status === 'ended' ? 'ended' : null)
          }
          // Si déjà 'connecting'/'active', hangUp() gère déjà la sortie
          // propre ; le broadcast call-hangup arrive en parallèle.
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, profile, proceedAsCaller, endWithStatus])

  /* ── Minuteur de durée pendant l'appel actif ─────────────────── */
  useEffect(() => {
    if (call.status !== 'active') return
    const start = Date.now()
    session.durationTimer = setInterval(() => setDuration(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(session.durationTimer)
  }, [call.status, session])

  /* ── API exposée ──────────────────────────────────────────────── */

  const startCall = useCallback(async ({ conversationId, callType, peerName }) => {
    if (callRef.current.status !== 'idle') return
    setCall({ ...initialState, status: 'outgoing', conversationId, callType, peerName, isCaller: true })
    try {
      // En parallèle : le relais TURN n'est nécessaire qu'à la création
      // de la connexion pair-à-pair (proceedAsCaller), largement après.
      const [stream, iceServers] = await Promise.all([getLocalMedia(callType), getIceServers()])
      session.localStream = stream
      session.iceServers = iceServers
      setLocalStream(stream)

      const { data: row, error } = await supabase
        .from('calls')
        .insert({ conversation_id: conversationId, caller_id: user.id, call_type: callType, caller_name: profile?.name })
        .select()
        .single()
      if (error) throw error

      setCall((c) => ({ ...c, callId: row.id }))
      joinSignaling(conversationId, row.id, { isCaller: true })

      session.ringTimeout = setTimeout(async () => {
        await supabase.from('calls').update({ status: 'missed' }).eq('id', row.id).eq('status', 'ringing')
        endWithStatus(null, 'Personne n’a répondu.')
      }, RING_TIMEOUT_MS)
    } catch (err) {
      endWithStatus('failed', mediaErrorMessage(err))
    }
  }, [user?.id, profile?.name, session, joinSignaling, endWithStatus])

  const acceptCall = useCallback(async () => {
    const incoming = callRef.current
    setCall((c) => ({ ...c, status: 'connecting' }))
    let accepted = false
    try {
      const { data, error } = await supabase
        .from('calls')
        .update({ status: 'accepted', callee_id: user.id, callee_name: profile?.name, answered_at: new Date().toISOString() })
        .eq('id', incoming.callId)
        .eq('status', 'ringing')
        .select()
        .maybeSingle()
      if (error) throw error
      if (!data) {
        // Un collègue a déjà décroché entre-temps.
        endWithStatus(null)
        return
      }
      accepted = true

      const [stream, iceServers] = await Promise.all([getLocalMedia(incoming.callType), getIceServers()])
      session.localStream = stream
      session.iceServers = iceServers
      setLocalStream(stream)

      joinSignaling(incoming.conversationId, incoming.callId, { isCaller: false })
      createPc(incoming.callId)
      // La suite (recevoir l'offre, y répondre) est gérée par le
      // handler 'call-offer' déjà branché dans joinSignaling.
    } catch (err) {
      if (accepted) {
        // La ligne est déjà 'accepted' : on la marque en échec pour ne
        // pas laisser l'appelant attendre indéfiniment.
        await supabase.from('calls').update({ status: 'failed' }).eq('id', incoming.callId)
      }
      endWithStatus('failed', mediaErrorMessage(err))
    }
  }, [user?.id, profile?.name, session, joinSignaling, createPc, endWithStatus])

  const declineCall = useCallback(async () => {
    const incoming = callRef.current
    if (profile?.role === 'apprenante') {
      // Elle est la seule destinataire possible : son refus est définitif.
      await supabase.from('calls').update({ status: 'declined' }).eq('id', incoming.callId).eq('status', 'ringing')
    }
    // Côté staff (bassin partagé) : retrait local uniquement, un
    // collègue peut encore répondre.
    endWithStatus(null)
  }, [profile?.role, endWithStatus])

  const cancelCall = useCallback(async () => {
    const current = callRef.current
    if (current.callId) {
      await supabase.from('calls').update({ status: 'missed' }).eq('id', current.callId).eq('status', 'ringing')
    }
    endWithStatus(null)
  }, [endWithStatus])

  const hangUp = useCallback(async () => {
    const current = callRef.current
    session.channel?.send({ type: 'broadcast', event: 'call-hangup', payload: { callId: current.callId, from: user?.id } })
    if (current.callId) {
      await supabase.from('calls').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', current.callId)
    }
    endWithStatus('ended')
  }, [user?.id, session, endWithStatus])

  const toggleMute = useCallback(() => {
    const track = session.localStream?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }, [session])

  const toggleCamera = useCallback(() => {
    const track = session.localStream?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCameraOff(!track.enabled)
  }, [session])

  const api = useMemo(() => ({
    call, localStream, remoteStream, muted, cameraOff, duration,
    startCall, acceptCall, declineCall, cancelCall, hangUp, toggleMute, toggleCamera, dismissCall,
  }), [call, localStream, remoteStream, muted, cameraOff, duration, startCall, acceptCall, declineCall, cancelCall, hangUp, toggleMute, toggleCamera, dismissCall])

  return (
    <CallContext.Provider value={api}>
      {children}
      <CallOverlay />
    </CallContext.Provider>
  )
}
