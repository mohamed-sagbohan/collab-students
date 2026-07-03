import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router'
import { GraduationCap, BookOpen, LayoutDashboard, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import SearchBar from './SearchBar'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { profile, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = profile?.name
    ?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-sm hidden sm:block">LearnIT</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                isActive ? 'bg-primary/10 text-primary border-primary' : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="hidden md:block">Tableau de bord</span>
          </NavLink>
          <NavLink
            to="/cours"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                isActive ? 'bg-primary/10 text-primary border-primary' : 'text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden md:block">Cours</span>
          </NavLink>
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
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-primary-foreground text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-none">{profile?.name}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{profile?.role}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50 py-1">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">{profile?.name}</p>
                  <p className="text-xs text-primary font-medium capitalize mt-0.5">{profile?.role}</p>
                </div>
                {/* Recherche mobile */}
                <div className="px-3 py-3 border-b border-border sm:hidden">
                  <SearchBar />
                </div>
                <div className="px-4 py-3 border-b border-border sm:hidden">
                  <p className="text-xs text-muted-foreground mb-2">Thème</p>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
