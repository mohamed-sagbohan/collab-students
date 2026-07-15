import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { BookOpen, X } from 'lucide-react'
import { buttonVariants } from '../ui/Button'

const KEY = 'learnit_guide_nudge_seen'

/**
 * Coach-mark de première visite : petite carte animée en bas à droite de
 * l'accueil qui oriente les nouveaux visiteurs vers le guide d'utilisation.
 * Ne s'affiche qu'une seule fois (localStorage), se ferme d'un clic, et
 * disparaît définitivement une fois le guide ouvert.
 */
export default function GuideNudge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = !!localStorage.getItem(KEY)
    } catch {
      seen = true // stockage indisponible (navigation privée stricte) : ne pas insister
    }
    if (seen) return
    // Laisse le hero s'installer avant d'attirer l'attention.
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* tant pis, le nudge reviendra */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      aria-label="Découvrir le guide d'utilisation"
      className="fixed bottom-4 right-4 z-50 max-w-[19rem] animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-card-hover p-4 pr-9">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="flex items-start gap-3">
          <div className="relative shrink-0 mt-0.5">
            {/* Halo pulsé + icône qui flotte doucement */}
            <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-primary/30 blur-md animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl panel-brand flex items-center justify-center nudge-bob">
              <BookOpen className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-foreground text-sm">Première fois ici ?</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 mb-3">
              Laissez-vous guider pas à pas, de l'inscription à votre premier certificat.
            </p>
            <Link to="/guide" onClick={dismiss} className={buttonVariants({ size: 'sm' })}>
              Voir le guide d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
