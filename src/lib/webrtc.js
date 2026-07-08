import { supabase } from './supabase'

// Repli si le relais TURN est indisponible (Edge Function en panne,
// hors-ligne côté Cloudflare…) : la connexion directe reste possible
// sur la plupart des réseaux domestiques/mobiles, mais échouera sur
// les réseaux les plus restrictifs — dégradation, pas un blocage total.
const STUN_FALLBACK = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

/**
 * Identifiants ICE (STUN + relais TURN) à courte durée de vie, générés
 * par l'Edge Function get-turn-credentials (le secret Cloudflare ne
 * vit que côté serveur). Le relais TURN est ce qui permet à l'appel
 * d'aboutir même quand les deux participants sont sur des réseaux qui
 * bloquent la connexion directe (réseau mobile, pare-feu d'entreprise…).
 */
export async function getIceServers() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return STUN_FALLBACK

    const { data, error } = await supabase.functions.invoke('get-turn-credentials')
    if (error || !data?.iceServers) return STUN_FALLBACK

    const { urls, username, credential } = data.iceServers
    return [{ urls, username, credential }]
  } catch {
    return STUN_FALLBACK
  }
}

export async function getLocalMedia(callType) {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
  })
}

export function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop())
}

/** Message d'erreur lisible pour un débutant, à partir d'une erreur getUserMedia/RTCPeerConnection. */
export function mediaErrorMessage(err) {
  if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
    return 'Micro/caméra refusés. Autorisez leur accès dans votre navigateur puis réessayez.'
  }
  if (err?.name === 'NotFoundError') {
    return 'Aucun micro ou caméra détecté sur cet appareil.'
  }
  if (err?.name === 'NotReadableError') {
    return 'Le micro ou la caméra est déjà utilisé par une autre application.'
  }
  return err?.message || "Impossible de démarrer l'appel. Réessayez."
}
