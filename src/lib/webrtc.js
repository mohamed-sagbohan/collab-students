// Configuration WebRTC — STUN public uniquement (pas de TURN, portée
// validée pour le projet : 1-à-1, réseaux domestiques/mobiles usuels).
// Sur un réseau très restrictif (pare-feu d'entreprise strict), la
// connexion directe peut échouer : le pair passe alors en état
// 'failed' avec un message clair — un compromis assumé, pas un bug.
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

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
