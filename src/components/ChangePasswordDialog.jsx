import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Dialog } from './ui/Dialog'
import { FormField } from './ui/FormField'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'

/**
 * Modification du mot de passe depuis le menu profil (connecté).
 * Le mot de passe ACTUEL est exigé et vérifié (signInWithPassword) avant
 * la mise à jour : quelqu'un devant une session ouverte ne peut pas
 * changer le mot de passe sans le connaître.
 */
export default function ChangePasswordDialog({ open, onClose }) {
  const { user, updatePassword } = useAuth()
  const toast = useToast()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Champs remis à zéro à chaque ouverture (jamais de reliquat de saisie).
  useEffect(() => {
    if (open) {
      setCurrent('')
      setNext('')
      setConfirm('')
      setShowPwd(false)
      setError(null)
    }
  }, [open])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    if (next.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (next !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (next === current) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.")
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Vérification du mot de passe actuel avant toute modification.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      })
      if (signInError) {
        setError('Mot de passe actuel incorrect.')
        return
      }
      await updatePassword(next)
      toast.success('Mot de passe modifié.')
      onClose?.()
    } catch (err) {
      setError(err?.message || 'Impossible de modifier le mot de passe. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      title="Modifier mon mot de passe"
      description="Confirmez votre mot de passe actuel, puis choisissez-en un nouveau (6 caractères minimum)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Mot de passe actuel">
          {(id, aria) => (
            <Input
              id={id}
              type="password"
              placeholder="Votre mot de passe actuel"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
              autoFocus
              {...aria}
            />
          )}
        </FormField>

        <FormField label="Nouveau mot de passe">
          {(id, aria) => (
            <div className="relative">
              <Input
                id={id}
                type={showPwd ? 'text' : 'password'}
                className="pr-11"
                placeholder="6 caractères minimum"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
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

        <FormField label="Confirmer le nouveau mot de passe">
          {(id, aria) => (
            <Input
              id={id}
              type={showPwd ? 'text' : 'password'}
              placeholder="Répétez le nouveau mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              {...aria}
            />
          )}
        </FormField>

        {/* Indicateur de force (même barème que la réinitialisation) */}
        {next.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    next.length >= i * 4
                      ? i === 1 ? 'bg-destructive' : i === 2 ? 'bg-warning' : 'bg-success'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {next.length < 4 ? 'Trop court' : next.length < 8 ? 'Acceptable' : 'Bon mot de passe'}
            </p>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            {loading ? 'Modification…' : 'Modifier le mot de passe'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
