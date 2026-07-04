import { useState, useId } from 'react'
import { useNavigate, Link } from 'react-router'
import { LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { IconBadge } from '../../components/ui/IconBadge'
import { FormField } from '../../components/ui/FormField'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      // Supabase renvoie "Email not confirmed" si l'email n'est pas confirmé
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError("Votre adresse email n'a pas encore été confirmée. Vérifiez votre boîte de réception.")
      } else {
        setError('Email ou mot de passe incorrect.')
      }
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const passwordId = useId()

  return (
    <>
      <div className="mb-8">
        <IconBadge icon={LogIn} className="mb-5" />
        <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Connectez-vous pour reprendre votre progression.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Adresse email">
          {(id, aria) => (
            <Input
              id={id}
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              required
              {...aria}
            />
          )}
        </FormField>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={passwordId} className="block text-sm font-medium text-foreground">Mot de passe</label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id={passwordId}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          {loading ? 'Connexion en cours…' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">
          S'inscrire gratuitement
        </Link>
      </p>
    </>
  )
}
