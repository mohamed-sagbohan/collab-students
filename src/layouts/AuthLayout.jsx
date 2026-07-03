import { Outlet, Link, useLocation } from 'react-router'
import { GraduationCap, CheckCircle, Sparkles } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

const highlights = [
  'Cours conçus pour les vrais débutants',
  'Exercices avec correction instantanée',
  'Progression sauvegardée automatiquement',
  'Accès 100% gratuit, sans publicité',
]

export default function AuthLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex bg-background">

      {/* Panneau gauche — branding */}
      <div className="hidden lg:flex w-[45%] bg-card border-r border-border flex-col justify-between p-12 relative overflow-hidden shrink-0">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-primary/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="flex items-center gap-3 relative">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight">LearnIT</span>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Plateforme 100% gratuite
          </div>
          <blockquote className="text-foreground text-2xl font-bold leading-snug mb-8">
            "Apprendre l'informatique,<br />
            <span className="text-primary">c'est apprendre à penser autrement."</span>
          </blockquote>
          <ul className="space-y-3.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground/50 text-xs relative">© {new Date().getFullYear()} LearnIT</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex flex-col min-h-screen bg-background">

        {/* Header mobile */}
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-sm">LearnIT</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-12">
          <div key={location.pathname} className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  )
}
