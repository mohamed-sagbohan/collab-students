import { useState } from 'react'
import { LayoutDashboard, BookOpen, Search, User } from 'lucide-react'
import { NavItem } from './ui/NavItem'
import { Dialog } from './ui/Dialog'
import SearchOverlay from './SearchOverlay'
import ProfileMenu from './ProfileMenu'
import ChangePasswordDialog from './ChangePasswordDialog'

/**
 * Barre de navigation basse pour mobile (espace apprenant uniquement).
 * Recherche et Profil ouvrent des overlays : il n'existe pas de routes
 * dédiées, et le routing ne doit pas changer.
 */
export default function BottomNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)

  const actionClass =
    'flex flex-col items-center justify-center gap-1 flex-1 min-h-11 min-w-11 py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors'

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-stretch h-16 max-w-md mx-auto px-2">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Accueil" variant="bottom" />
          <NavItem to="/cours" icon={BookOpen} label="Cours" variant="bottom" />
          <button type="button" onClick={() => setSearchOpen(true)} className={actionClass}>
            <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Recherche</span>
          </button>
          <button type="button" onClick={() => setProfileOpen(true)} className={actionClass}>
            <User className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>Profil</span>
          </button>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} title="Profil" className="max-w-xs pb-2">
        <div className="-mx-6 sm:-mx-8 border-t border-border">
          <ProfileMenu
            onClose={() => setProfileOpen(false)}
            onChangePassword={() => setPwOpen(true)}
            themeAlways
          />
        </div>
      </Dialog>

      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  )
}
