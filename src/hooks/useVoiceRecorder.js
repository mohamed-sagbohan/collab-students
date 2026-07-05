import { useCallback, useEffect, useRef, useState } from 'react'

// Formats par ordre de préférence : webm/opus (Chrome, Firefox, Edge),
// mp4 (Safari). La lecture des deux est universelle via <audio>.
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

/**
 * Enregistrement d'une note vocale avec l'API MediaRecorder du navigateur
 * (aucune dépendance). Machine à états simple, pensée pour des débutants :
 *
 *   idle ── start() ──▶ recording ── stop() ──▶ preview ── reset() ──▶ idle
 *                          │                       │
 *                          └────── cancel() ───────┴──▶ idle (tout est jeté)
 *
 * Le micro est TOUJOURS relâché (tracks stoppées) à l'arrêt, l'annulation
 * et au démontage. Arrêt automatique à maxSec.
 */
export function useVoiceRecorder({ maxSec = 120 } = {}) {
  const [state, setState] = useState('idle') // idle | recording | preview
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)
  const [error, setError] = useState(null)

  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const secondsRef = useRef(0)
  const discardRef = useRef(false)

  const supported =
    typeof window !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined'

  const mimeType = supported
    ? (MIME_CANDIDATES.find((t) => window.MediaRecorder.isTypeSupported(t)) ?? '')
    : ''

  const releaseMic = useCallback(() => {
    recorderRef.current?.stream?.getTracks().forEach((track) => track.stop())
  }, [])

  const start = useCallback(async () => {
    if (!supported || recorderRef.current?.state === 'recording') return
    setError(null)
    setBlob(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      discardRef.current = false

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        releaseMic()
        clearInterval(timerRef.current)
        if (discardRef.current) {
          setSeconds(0)
          setState('idle')
          return
        }
        setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' }))
        setState('preview')
      }

      recorderRef.current = recorder
      secondsRef.current = 0
      setSeconds(0)
      recorder.start()
      setState('recording')
      timerRef.current = setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
        if (secondsRef.current >= maxSec && recorderRef.current?.state === 'recording') {
          recorderRef.current.stop()
        }
      }, 1000)
    } catch {
      setError('Micro inaccessible. Autorisez le microphone dans votre navigateur puis réessayez.')
      setState('idle')
    }
  }, [supported, mimeType, maxSec, releaseMic])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const cancel = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      discardRef.current = true
      recorderRef.current.stop()
    } else {
      setBlob(null)
      setSeconds(0)
      setState('idle')
    }
  }, [])

  const reset = useCallback(() => {
    setBlob(null)
    setSeconds(0)
    setError(null)
    setState('idle')
  }, [])

  // Démontage : on jette tout et on relâche le micro.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (recorderRef.current?.state === 'recording') {
        discardRef.current = true
        recorderRef.current.stop()
      }
      releaseMic()
    }
  }, [releaseMic])

  return { supported, state, seconds, blob, mimeType, error, start, stop, cancel, reset }
}
