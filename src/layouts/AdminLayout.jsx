import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { LayoutDashboard, BookOpen, Users, Activity, LogOut, GraduationCap, Menu, X, BarChart3, PenSquare, MessageCircle, KeyRound, Phone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import ChangePasswordDialog from '../components/ChangePasswordDialog'
import { SkipLink } from '../components/ui/SkipLink'
import { NavItem } from '../components/ui/NavItem'
import { Avatar } from '../components/ui/Avatar'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { useStaffUnreadTotal, useStaffChatRealtime } from '../hooks/useChat'
import { useStaffCallsRealtime, useStaffMissedCallsBadge, useMarkCallBadgeSeen } from '../hooks/useCalls'

const instructorLinks = [
  { to: '/formateur',            icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/formateur/suivi',      icon: Activity,        label: 'Suivi en direct' },
  { to: '/formateur/messagerie', icon: MessageCircle,   label: 'Messagerie' },
  { to: '/formateur/appels',     icon: Phone,           label: 'Historique des appels' },
  { to: '/formateur/editeur',    icon: PenSquare,       label: 'Mes cours' },
]

const adminLinks = [
  { to: '/admin',             icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/utilisateurs',icon: Users,           label: 'Utilisateurs' },
  { to: '/admin/cours',       icon: BookOpen,        label: 'Cours' },
  { to: '/admin/suivi',       icon: Activity,        label: 'Suivi en direct' },
  { to: '/admin/messagerie',  icon: MessageCircle,   label: 'Messagerie' },
  { to: '/admin/appels',      icon: Phone,           label: 'Historique des appels' },
  { to: '/admin/analytics',   icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/editeur',     icon: PenSquare,       label: 'Éditeur' },
]

/* Fil d'Ariane du header de contenu — uniquement pour les pages de premier
   niveau : les pages profondes de l'éditeur affichent le leur. */
function LayoutBreadcrumb({ pathname, isAdmin }) {
  const root = isAdmin ? '/admin' : '/formateur'
  if (pathname === root) return null
  const links = isAdmin ? adminLinks : instructorLinks
  const current = links.find((l) => l.to === pathname)
  if (!current) return null
  return (
    <Breadcrumb
      items={[
        { label: isAdmin ? 'Administration' : 'Espace formateur', to: root },
        { label: current.label },
      ]}
    />
  )
}

function SidebarContent({ profile, logout, onClose, onChangePassword, missedCallsBadge }) {
  const links = profile?.role === 'admin' ? adminLinks : instructorLinks
  // Badge de non-lus : compteur seul (p_limit 0), sans charger la liste.
  const chatUnread = useStaffUnreadTotal()

  return (
    <div className="flex flex-col h-full">
      {/* Header sidebar */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/75 rounded-lg flex items-center justify-center shadow-md shadow-primary/25">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">LearnIT</span>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Fermer le menu" className="p-1.5 rounded-lg hover:bg-muted transition-colors lg:hidden">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {/* Profil */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-2xl border border-border">
          <Avatar name={profile?.name} className="w-9 h-9" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-none">{profile?.name}</p>
            <span className="text-xs text-primary font-medium capitalize">{profile?.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">Navigation</p>
        <div className="flex flex-col gap-0.5">
          {links.map(({ to, icon, label }) => (
            <NavItem
              key={to}
              to={to}
              end
              onClick={onClose}
              icon={icon}
              label={label}
              variant="pill"
              className="px-3"
              badge={
                label === 'Suivi en direct' ? (
                  <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse shrink-0" aria-hidden="true" />
                ) : label === 'Messagerie' && chatUnread > 0 ? (
                  <span
                    className="ml-auto min-w-5 h-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0"
                    aria-label={`${chatUnread} message${chatUnread > 1 ? 's' : ''} non lu${chatUnread > 1 ? 's' : ''}`}
                  >
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                ) : label === 'Historique des appels' && missedCallsBadge > 0 ? (
                  <span
                    className="ml-auto min-w-5 h-5 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shrink-0"
                    aria-label={`${missedCallsBadge} appel${missedCallsBadge > 1 ? 's' : ''} manqué${missedCallsBadge > 1 ? 's' : ''}`}
                  >
                    {missedCallsBadge > 9 ? '9+' : missedCallsBadge}
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <ThemeToggle />
        <button
          onClick={() => {
            onClose?.()
            onChangePassword?.()
          }}
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-1"
        >
          <KeyRound className="w-4 h-4" />
          Modifier mon mot de passe
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-1"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { profile, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)

  // Canal realtime unique du chat côté staff (alimente le cache React Query,
  // aucun state React ici — pas de re-render du layout).
  useStaffChatRealtime()
  useStaffCallsRealtime()

  // Badge « appels manqués » : curseur « vu » en base (call_badge_reads,
  // migration 037), marqué à chaque visite de la page /appels.
  const markCallsSeen = useMarkCallBadgeSeen()
  useEffect(() => {
    if (location.pathname === '/formateur/appels' || location.pathname === '/admin/appels') markCallsSeen()
  }, [location.pathname, markCallsSeen])
  const missedCallsBadge = useStaffMissedCallsBadge()

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    if (!sidebarOpen) return
    const handler = (e) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [sidebarOpen])

  return (
    <div className="min-h-screen flex bg-background">
      <SkipLink />

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-card border-r border-border flex-col shrink-0 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent profile={profile} logout={logout} onChangePassword={() => setPwOpen(true)} missedCallsBadge={missedCallsBadge} />
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        </div>
      )}
      <aside
        aria-label="Menu de navigation"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col lg:hidden transition-transform duration-300 ease-out motion-reduce:transition-none ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>
        <SidebarContent
          profile={profile}
          logout={logout}
          onClose={() => setSidebarOpen(false)}
          onChangePassword={() => setPwOpen(true)}
          missedCallsBadge={missedCallsBadge}
        />
      </aside>

      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />

      {/* Contenu */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">

        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">LearnIT</span>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto focus:outline-none">
          <div key={location.pathname} className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <LayoutBreadcrumb pathname={location.pathname} isAdmin={profile?.role === 'admin'} />
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  )
}
