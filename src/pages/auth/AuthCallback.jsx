import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { CheckCircle, XCircle, GraduationCap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Supabase échange automatiquement le code/token de l'URL, mais cet échange
    // (flux PKCE) est asynchrone et peut prendre un instant après le premier rendu.
    // On combine l'écoute des changements d'auth avec un sondage régulier avant de
    // conclure que le lien est invalide, plutôt qu'une seule vérification immédiate.
    let settled = false

    const finish = (ok, message) => {
      if (settled) return
      settled = true
      if (ok) {
        setStatus('success')
        setTimeout(() => navigate('/', { replace: true }), 2000)
      } else {
        setErrorMsg(message)
        setStatus('error')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true)
    })

    const check = () => {
      if (settled) return
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (settled) return
        if (error) { finish(false, error.message); return }
        if (session) finish(true)
      })
    }
    check()
    const poll = setInterval(check, 800)
    const timeout = setTimeout(() => {
      clearInterval(poll)
      finish(false, 'Lien invalide ou expiré. Veuillez vous réinscrire.')
    }, 5000)

    return () => {
      settled = true
      subscription.unsubscribe()
      clearInterval(poll)
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">LearnIT</span>
        </Link>

        {status === 'loading' && (
          <>
            <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-5" />
            <h1 className="text-lg font-semibold text-foreground mb-2">Confirmation en cours…</h1>
            <p className="text-sm text-muted-foreground">Merci de patienter quelques instants.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Compte confirmé !</h1>
            <p className="text-sm text-muted-foreground mb-1">Votre adresse email a bien été vérifiée.</p>
            <p className="text-xs text-muted-foreground">Redirection automatique…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Lien invalide</h1>
            <p className="text-sm text-muted-foreground mb-6">{errorMsg}</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Créer un compte
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
