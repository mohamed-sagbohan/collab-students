import { useEffect, useRef, useState } from 'react'

/* ── CAPTCHA Cloudflare Turnstile ────────────────────────────────
   Activation progressive et sans risque :
   1. Créer un widget sur dash.cloudflare.com → Turnstile (site key + secret key).
   2. VITE_TURNSTILE_SITE_KEY=<site key> dans le .env (et sur Vercel).
   3. Coller la SECRET key dans Supabase → Authentication → Attack Protection,
      et activer la protection CAPTCHA.
   Sans la variable d'env, aucun widget ne s'affiche et rien ne change :
   n'activez le réglage Supabase (étape 3) qu'une fois les étapes 1-2 déployées,
   sinon toute connexion est refusée.
──────────────────────────────────────────────────────────────── */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

/** Vrai quand le widget est configuré — les formulaires exigent alors un jeton. */
export const CAPTCHA_ENABLED = !!SITE_KEY

let scriptPromise = null
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve()
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Widget Turnstile (mode « managed » : invisible pour la plupart des humains).
 * `onToken(token)` reçoit le jeton, ou null s'il expire / échoue.
 * Les jetons sont à usage unique : remonter le composant (via `key`)
 * après un échec de soumission pour en obtenir un nouveau.
 */
export function Turnstile({ onToken }) {
  const containerRef = useRef(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    let widgetId
    let cancelled = false
    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current) return
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'auto',
          language: 'fr',
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        })
      })
      .catch(() => onTokenRef.current(null))
    return () => {
      cancelled = true
      if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    }
  }, [])

  // min-h : réserve la hauteur du widget (65 px) pour éviter un saut de mise en page.
  return <div ref={containerRef} className="min-h-[65px]" />
}

/**
 * Toute la plomberie CAPTCHA d'un formulaire d'auth en une ligne :
 *   const { captcha, captchaToken, captchaReady, resetCaptcha } = useCaptcha()
 * → rendre {captcha} dans le formulaire, passer captchaToken à l'appel auth,
 *   désactiver le bouton tant que !captchaReady, appeler resetCaptcha() en catch.
 */
export function useCaptcha() {
  const [token, setToken] = useState(null)
  const [nonce, setNonce] = useState(0)

  return {
    captcha: CAPTCHA_ENABLED ? <Turnstile key={nonce} onToken={setToken} /> : null,
    captchaToken: token ?? undefined,
    captchaReady: !CAPTCHA_ENABLED || !!token,
    resetCaptcha: () => {
      setToken(null)
      setNonce((n) => n + 1)
    },
  }
}
