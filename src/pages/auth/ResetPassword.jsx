import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router'
import { KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { IconBadge } from '../../components/ui/IconBadge'
import { FormField } from '../../components/ui/FormField'
import { Button } from '../../components/ui/Button'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  const [ready, setReady] = useState(false)       // session de récupération établie
  const [invalid, setInvalid] = useState(false)   // lien invalide/expiré
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase émet PASSWORD_RECOVERY quand l'utilisateur arrive depuis le lien email
    // (flux implicite). Avec le flux PKCE, l'échange du code de l'URL contre une
    // session est asynchrone : elle peut apparaître un peu après le premier rendu,
    // sans forcément déclencher cet événement précis. On combine donc l'écoute de
    // l'événement avec un sondage régulier avant de conclure que le lien est invalide.
    let settled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled) return
      if (event === 'PASSWORD_RECOVERY' || session) {
        settled = true
        setReady(true)
      }
    })

    const check = () => {
      if (settled) return
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (settled || !session) return
        settled = true
        setReady(true)
      })
    }
    check()
    const poll = setInterval(check, 800)
    const timeout = setTimeout(() => {
      clearInterval(poll)
      if (!settled) {
        settled = true
        setInvalid(true)
      }
    }, 5000)

    return () => {
      settled = true
      subscription.unsubscribe()
      clearInterval(poll)
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await updatePassword(password)
      setSuccess(true)
      setTimeout(() => navigate('/', { replace: true }), 2500)
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Succès ── */
  if (success) {
    return (
      <div className="text-center">
        <IconBadge icon={CheckCircle} size="lg" color="text-emerald-500" bg="bg-emerald-500/10" className="mx-auto mb-5" />
        <h2 className="text-xl font-bold text-foreground mb-2">Mot de passe mis à jour !</h2>
        <p className="text-sm text-muted-foreground">Redirection automatique vers votre espace…</p>
      </div>
    )
  }

  /* ── Lien invalide ── */
  if (invalid) {
    return (
      <div className="text-center">
        <IconBadge icon={KeyRound} size="lg" color="text-destructive" bg="bg-destructive/10" className="mx-auto mb-5" />
        <h2 className="text-xl font-bold text-foreground mb-2">Lien expiré</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  /* ── Chargement (attente de la session) ── */
  if (!ready) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-5" />
        <p className="text-sm text-muted-foreground">Vérification du lien…</p>
      </div>
    )
  }

  /* ── Formulaire nouveau mot de passe ── */
  return (
    <>
      <div className="mb-8">
        <IconBadge icon={KeyRound} className="mb-5" />
        <h1 className="text-2xl font-bold text-foreground">Nouveau mot de passe</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Choisissez un mot de passe sécurisé d'au moins 6 caractères.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nouveau mot de passe">
          {(id, aria) => (
            <div className="relative">
              <input
                id={id}
                type={showPwd ? 'text' : 'password'}
                className="w-full px-4 py-2.5 pr-11 border border-input rounded-xl text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                placeholder="6 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
                autoFocus
                {...aria}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </FormField>

        <FormField label="Confirmer le mot de passe">
          {(id, aria) => (
            <input
              id={id}
              type={showPwd ? 'text' : 'password'}
              className="w-full px-4 py-2.5 border border-input rounded-xl text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
              placeholder="Répétez le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              {...aria}
            />
          )}
        </FormField>

        {/* Indicateur de force */}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    password.length >= i * 4
                      ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-emerald-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {password.length < 4 ? 'Trop court' : password.length < 8 ? 'Acceptable' : 'Bon mot de passe'}
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </Button>
      </form>
    </>
  )
}
