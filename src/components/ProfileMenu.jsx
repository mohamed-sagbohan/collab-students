import { useState } from 'react'
import { LogOut, ClipboardList, KeyRound, Mail, MailX } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ThemeToggle } from './ThemeToggle'
import SearchBar from './SearchBar'

/**
 * Corps du menu profil (nom/rôle, recherche mobile, thème, déconnexion).
 * Consommé par le menu déroulant de la Navbar ET par la feuille « Profil »
 * de la bottom nav mobile.
 * - `searchInMenu` : affiche la recherche (utile dans le dropdown navbar < sm)
 * - `themeAlways` : affiche le choix de thème à toutes les tailles
 * - `onChangePassword` : le PARENT ferme le menu et ouvre le dialog (qui doit
 *   vivre hors du menu — un dropdown fermé démonterait un dialog enfant)
 */
export default function ProfileMenu({ onClose, searchInMenu = false, themeAlways = false, onChangePassword }) {
  const { profile, logout, refetchProfile } = useAuth()
  const [savingPref, setSavingPref] = useState(false)
  const optedOut = profile?.reengagement_opt_out === true

  async function toggleReengagement() {
    if (savingPref || !profile) return
    setSavingPref(true)
    const { error } = await supabase
      .from('profiles')
      .update({ reengagement_opt_out: !optedOut })
      .eq('id', profile.id)
    if (!error) await refetchProfile()
    setSavingPref(false)
  }

  return (
    <>
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{profile?.name}</p>
        <p className="text-xs text-primary font-medium capitalize mt-0.5">{profile?.role}</p>
      </div>

      {searchInMenu && (
        <div className="px-3 py-3 border-b border-border sm:hidden">
          <SearchBar />
        </div>
      )}

      <div className={`px-4 py-3 border-b border-border ${themeAlways ? '' : 'sm:hidden'}`}>
        <p className="text-xs text-muted-foreground mb-2">Thème</p>
        <ThemeToggle />
      </div>

      {profile?.role === 'apprenante' && (
        <Link
          to="/resultats"
          onClick={() => onClose?.()}
          className="flex items-center gap-2.5 w-full px-4 py-3 min-h-11 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
        >
          <ClipboardList className="w-4 h-4 text-primary" aria-hidden="true" />
          Mes résultats
        </Link>
      )}

      {profile?.role === 'apprenante' && (
        <button
          onClick={toggleReengagement}
          disabled={savingPref}
          className="flex items-center gap-2.5 w-full px-4 py-3 min-h-11 text-sm text-foreground hover:bg-muted transition-colors border-b border-border disabled:opacity-50"
        >
          {optedOut ? (
            <MailX className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Mail className="w-4 h-4 text-primary" aria-hidden="true" />
          )}
          {optedOut ? 'Réactiver les emails de relance' : 'Désactiver les emails de relance'}
        </button>
      )}

      {onChangePassword && (
        <button
          onClick={() => {
            onClose?.()
            onChangePassword()
          }}
          className="flex items-center gap-2.5 w-full px-4 py-3 min-h-11 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
        >
          <KeyRound className="w-4 h-4 text-primary" aria-hidden="true" />
          Modifier mon mot de passe
        </button>
      )}

      <button
        onClick={() => {
          logout()
          onClose?.()
        }}
        className="flex items-center gap-2.5 w-full px-4 py-3 min-h-11 text-sm text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Déconnexion
      </button>
    </>
  )
}
