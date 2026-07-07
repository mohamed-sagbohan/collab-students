import { useState } from 'react'
import { Link } from 'react-router'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCaptcha } from '../../components/Turnstile'
import { translateAuthError } from '../../lib/authErrors'
import { IconBadge } from '../../components/ui/IconBadge'
import { FormField } from '../../components/ui/FormField'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const { captcha, captchaToken, captchaReady, resetCaptcha } = useCaptcha()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await sendPasswordReset(email, captchaToken)
      setSent(true)
    } catch (err) {
      resetCaptcha()
      setError(translateAuthError(err, 'Une erreur est survenue. Réessayez.'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <IconBadge icon={CheckCircle} size="lg" className="mx-auto mb-5" />
        <h2 className="text-xl font-bold text-foreground mb-2">Email envoyé !</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Un lien de réinitialisation a été envoyé à{' '}
          <strong className="text-foreground">{email}</strong>.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          Vérifiez votre boîte de réception (et vos spams).
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <IconBadge icon={Mail} className="mb-5" />
        <h1 className="text-2xl font-bold text-foreground">Mot de passe oublié ?</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Adresse email">
          {(id, aria) => (
            <Input
              id={id}
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
              {...aria}
            />
          )}
        </FormField>

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {captcha}

        <Button type="submit" loading={loading} disabled={!captchaReady} className="w-full">
          {loading ? 'Envoi en cours…' : 'Envoyer le lien de réinitialisation'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Vous vous souvenez ?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  )
}
