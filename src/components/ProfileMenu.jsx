import { LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import SearchBar from './SearchBar'

/**
 * Corps du menu profil (nom/rôle, recherche mobile, thème, déconnexion).
 * Consommé par le menu déroulant de la Navbar ET par la feuille « Profil »
 * de la bottom nav mobile.
 * - `searchInMenu` : affiche la recherche (utile dans le dropdown navbar < sm)
 * - `themeAlways` : affiche le choix de thème à toutes les tailles
 */
export default function ProfileMenu({ onClose, searchInMenu = false, themeAlways = false }) {
  const { profile, logout } = useAuth()

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
