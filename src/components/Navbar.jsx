import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { GraduationCap, BookOpen, LayoutDashboard, ChevronDown, ClipboardList } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'
import ProfileMenu from './ProfileMenu'
import ChangePasswordDialog from './ChangePasswordDialog'
import { NavItem } from './ui/NavItem'
import { Avatar } from './ui/Avatar'

export default function Navbar() {
  const { profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/75 rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-sm hidden sm:block">LearnIT</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          <NavItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Tableau de bord"
            className="gap-1.5 px-2.5 text-xs sm:text-sm"
            labelClassName="hidden md:block"
          />
          <NavItem
            to="/cours"
            icon={BookOpen}
            label="Cours"
            className="gap-1.5 px-2.5 text-xs sm:text-sm"
            labelClassName="hidden md:block"
          />
          <NavItem
            to="/resultats"
            icon={ClipboardList}
            label="Résultats"
            className="gap-1.5 px-2.5 text-xs sm:text-sm"
            labelClassName="hidden md:block"
          />
        </nav>

        {/* Recherche (centre, flexible) */}
        <div className="flex-1 hidden sm:flex justify-center px-2">
          <SearchBar />
        </div>

        {/* Droite */}
        <div className="flex items-center gap-1 sm:gap-1.5 ml-auto shrink-0">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <Avatar name={profile?.name} size="sm" className="sm:w-8 sm:h-8" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-none">{profile?.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{profile?.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 py-1">
                <ProfileMenu
                  onClose={() => setMenuOpen(false)}
                  onChangePassword={() => setPwOpen(true)}
                  searchInMenu
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Hors du dropdown : survit à sa fermeture */}
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </header>
  )
}
