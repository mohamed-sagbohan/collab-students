import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCaptcha } from '../../components/Turnstile'
import { translateAuthError } from '../../lib/authErrors'
import { IconBadge } from '../../components/ui/IconBadge'
import { FormField } from '../../components/ui/FormField'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { captcha, captchaToken, captchaReady, resetCaptcha } = useCaptcha()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register({ ...form, captchaToken })
      setSuccess(true)
    } catch (err) {
      resetCaptcha()
      setError(translateAuthError(err, "Erreur lors de l'inscription."))
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  if (success) {
    return (
      <div className="text-center">
        <IconBadge icon={CheckCircle} size="lg" color="text-success" bg="bg-success/10" className="mx-auto mb-5" />
        <h2 className="text-xl font-bold text-foreground mb-2">Vérifiez votre email</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Un lien de confirmation a été envoyé à <strong className="text-foreground">{form.email}</strong>.
          Cliquez dessus pour activer votre compte.
        </p>
        <Link to="/login" className="text-sm text-primary font-semibold hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <IconBadge icon={UserPlus} className="mb-5" />
        <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Gratuit · Sans carte bancaire · En 30 secondes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Votre prénom">
          {(id, aria) => (
            <Input
              id={id}
              type="text"
              placeholder="Marie"
              value={form.name}
              onChange={update('name')}
              autoComplete="given-name"
              required
              {...aria}
            />
          )}
        </FormField>

        <FormField label="Adresse email">
          {(id, aria) => (
            <Input
              id={id}
              type="email"
              placeholder="marie@exemple.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
              {...aria}
            />
          )}
        </FormField>

        <FormField label="Mot de passe" hint="6 caractères minimum">
          {(id, aria) => (
            <Input
              id={id}
              type="password"
              placeholder="6 caractères minimum"
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              minLength={6}
              required
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

        <Button type="submit" loading={loading} disabled={!captchaReady} className="w-full mt-2">
          {loading ? 'Création du compte...' : 'Créer mon compte gratuitement'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Déjà inscrit ?{' '}
        <Link to="/login" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  )
}
