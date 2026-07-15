import { Link } from 'react-router'
import { BookOpen, Zap, TrendingUp, ArrowRight, CheckCircle, GraduationCap, Sparkles, Shield, Users, Lock } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import Reveal from '../components/Reveal'
import TypingDemo from '../components/landing/TypingDemo'
import GuideNudge from '../components/landing/GuideNudge'
import { buttonVariants } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { cn } from '../lib/utils'
import { STATS, STAT_ITEMS, TESTIMONIALS, FOOTER_LINKS } from '../lib/siteContent'

const features = [
  {
    icon: BookOpen,
    title: 'Cours structurés',
    desc: "Des leçons progressives du niveau débutant absolu jusqu'à l'autonomie numérique, avec texte et exemples concrets.",
  },
  {
    icon: Zap,
    title: 'Exercices interactifs',
    desc: 'QCM, vrai/faux — chaque réponse corrigée instantanément pour renforcer vos acquis.',
  },
  {
    icon: TrendingUp,
    title: 'Suivi en temps réel',
    desc: 'Visualisez votre avancement et reprenez exactement là où vous vous êtes arrêté.',
  },
  {
    icon: Shield,
    title: 'Sécurité & bonnes pratiques',
    desc: 'Apprenez à vous protéger en ligne et à adopter les bons réflexes numériques.',
  },
  {
    icon: Users,
    title: 'Accessible à tous',
    desc: 'Aucun prérequis. Conçu pour les vrais débutants, à votre rythme, depuis n\'importe quel appareil.',
  },
  {
    icon: Sparkles,
    title: '100% gratuit',
    desc: 'Toute la plateforme, tous les cours, tous les exercices — sans frais, sans limite.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Coach-mark de première visite → guide d'utilisation */}
      <GuideNudge />

      {/* ── Header — barre pilule flottante ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3">
        <div className="max-w-5xl mx-auto h-14 pl-4 pr-2.5 sm:px-5 flex items-center justify-between gap-3 rounded-full border border-border/60 bg-background/75 backdrop-blur-xl shadow-card">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/75 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base">LearnIT</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/guide"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              Guide d'utilisation
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Connexion
            </Link>
            <Link to="/register" className={buttonVariants()}>
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[4.25rem]">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-aurora">
          {/* Quadrillage discret + halos de fond */}
          <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Plateforme 100% gratuite · Pour les débutants
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[4.25rem] font-extrabold text-foreground leading-[1.04] tracking-tight mb-5">
                Apprenez
                <span className="relative inline-block">
                  <span className="text-gradient"> l'informatique</span>
                  {/* Soulignement « tracé à la main » */}
                  <svg
                    className="absolute -bottom-2 left-1 w-[97%] text-primary/50"
                    viewBox="0 0 220 12"
                    fill="none"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <path d="M3 9.5 C 60 2.5, 160 2, 217 6.5" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                </span>
                <br />à votre rythme.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Des cours clairs et des exercices interactifs conçus pour les vrais débutants.
                Maîtrisez l'ordinateur, Office, Internet et bien plus — pas à pas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/register" className={buttonVariants({ size: 'lg' })}>
                  Commencer gratuitement <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link to="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  J'ai déjà un compte
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {['from-orange-400 to-orange-500', 'from-amber-400 to-amber-500', 'from-rose-400 to-rose-500'].map((g, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-background`} />
                    ))}
                  </div>
                  <span>{STATS.learners} apprenants</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-primary" aria-hidden="true">★★★★★</span>
                  <span>{STATS.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-success" aria-hidden="true" />
                  <span>Sans carte bancaire</span>
                </div>
              </div>
            </div>

            {/* Mockup app */}
            <div className="relative hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
              {/* Carte flottante haut — verre dépoli */}
              <div className="absolute -top-6 -right-4 bg-card/85 backdrop-blur-md border border-border/70 rounded-2xl shadow-card-hover p-4 z-10">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" /> Ma progression
                </p>
                <p className="font-display text-3xl font-extrabold text-gradient leading-none">75%</p>
                <p className="text-xs text-muted-foreground mt-1">Leçon 3 sur 4</p>
              </div>
              {/* Carte flottante bas — verre dépoli */}
              <div className="absolute -bottom-4 -left-4 bg-card/85 backdrop-blur-md border border-border/70 rounded-2xl shadow-card-hover p-3 z-10 flex items-center gap-3">
                <div className="w-9 h-9 bg-success/15 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Exercice réussi !</p>
                  <p className="text-xs text-muted-foreground">Raccourcis clavier</p>
                </div>
              </div>
              {/* Fenêtre navigateur */}
              <div className="rounded-3xl overflow-hidden shadow-card-hover border border-border bg-card">
                <div className="bg-muted px-4 py-3 flex items-center gap-2.5 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-2 bg-card rounded-md py-1 px-3 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> learnit.app/cours
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center">
                        <GraduationCap className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="font-bold text-primary text-xs">LearnIT</span>
                    </div>
                    <Avatar name="Marie" size="sm" className="w-6 h-6 text-[10px]" />
                  </div>
                  <TypingDemo />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── STATS ── */}
        <section className="border-y border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {STAT_ITEMS.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 80}>
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-gradient inline-block">{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="fonctionnalites" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-16">
          <div className="text-center mb-12 sm:mb-16">
            {/* Section badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Ce qui rend LearnIT différent
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">Tout pour apprendre efficacement</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Une plateforme pensée pour les débutants, de la première leçon jusqu'à l'autonomie numérique complète.
            </p>
          </div>
          {/* Bento : 2 grandes cartes, puis 4 compactes — la dernière teintée marque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => {
              const featured = i < 2
              const tinted = i === features.length - 1
              return (
                <Reveal key={title} delay={(i % 4) * 90} className={featured ? 'lg:col-span-2' : ''}>
                  <div
                    className={cn(
                      'relative overflow-hidden border rounded-3xl shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group h-full',
                      featured ? 'p-7 sm:p-8' : 'p-6',
                      tinted
                        ? 'panel-brand border-primary/40 text-primary-foreground'
                        : 'bg-card border-border hover:border-primary/30'
                    )}
                  >
                    {/* Halo décoratif dans le coin */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        'absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none',
                        tinted ? 'bg-white/20' : 'bg-primary/10 opacity-70'
                      )}
                    />
                    <div
                      className={cn(
                        'rounded-2xl flex items-center justify-center mb-5 transition-colors',
                        featured ? 'w-12 h-12' : 'w-11 h-11',
                        tinted
                          ? 'bg-white/15 border border-white/25'
                          : 'bg-primary/10 border border-primary/20 group-hover:bg-primary/15'
                      )}
                    >
                      <Icon className={cn(featured ? 'w-6 h-6' : 'w-5 h-5', tinted ? 'text-primary-foreground' : 'text-primary')} />
                    </div>
                    <h3 className={cn('font-display font-bold mb-2', featured ? 'text-lg' : 'text-base', tinted ? 'text-primary-foreground' : 'text-foreground')}>{title}</h3>
                    <p className={cn('text-sm leading-relaxed', tinted ? 'text-primary-foreground/85' : 'text-muted-foreground')}>{desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ── PARCOURS ── */}
        <section id="parcours" className="bg-card/50 border-y border-border py-16 sm:py-24 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Comment ça marche
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">Quelques étapes, un seul objectif</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">Progressez à votre rythme, du premier clic jusqu'à l'autonomie numérique.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { n: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes, sans carte bancaire.' },
                { n: '02', title: 'Choisissez un cours', desc: `${STATS.courses} cours du niveau débutant absolu couvrant tous les essentiels.` },
                { n: '03', title: 'Suivez les leçons', desc: 'Contenu clair, illustré, à lire à votre propre rythme.' },
                { n: '04', title: 'Validez vos acquis', desc: 'Exercices interactifs corrigés instantanément pour ancrer vos connaissances.' },
              ].map(({ n, title, desc }, i) => (
                <Reveal key={n} delay={i * 100}>
                  <div className="relative bg-card border border-border rounded-3xl p-6 h-full shadow-card hover:border-primary/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <span className="font-display text-5xl font-extrabold text-gradient opacity-40 leading-none block mb-4">{n}</span>
                    <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Vers le guide pas à pas */}
            <Reveal className="text-center mt-10">
              <p className="text-sm text-muted-foreground mb-4">
                Envie du détail, écran par écran ? Le guide complet vous accompagne de l'inscription au certificat.
              </p>
              <Link
                to="/guide"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'shadow-card')}
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Consulter le guide d'utilisation
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section id="temoignages" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 scroll-mt-16">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              Ils apprennent avec LearnIT
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">Des progrès dont ils sont fiers</h2>
            <p className="text-xs text-muted-foreground">Témoignages illustratifs — données de démonstration.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <figure className="relative bg-card border border-border rounded-3xl p-6 h-full flex flex-col shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  {/* Guillemet décoratif */}
                  <span aria-hidden="true" className="absolute top-4 right-6 font-display text-6xl leading-none text-primary/10 select-none">“</span>
                  <p className="text-primary text-sm mb-3" aria-hidden="true">★★★★★</p>
                  <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                    « {t.quote} »
                  </blockquote>
                  <figcaption className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                    <Avatar name={t.name} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <Reveal className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden panel-brand p-8 sm:p-16 text-center">
            {/* Halos lumineux sur le panneau orange */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28rem] h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Inscription gratuite
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-primary-foreground mb-4 leading-tight">
                Prêt à maîtriser<br />l'informatique ?
              </h2>
              <p className="text-primary-foreground/85 mb-8 sm:text-lg max-w-md mx-auto">
                Rejoignez {STATS.learners} apprenants et commencez aujourd'hui, sans frais, sans engagement.
              </p>
              <Link
                to="/register"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'lg' }),
                  'h-14 px-8 text-base font-bold bg-white text-primary border-white hover:bg-white/90 hover:border-white shadow-xl'
                )}
              >
                Créer mon compte <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </section>

      </main>

      <footer className="border-t border-border bg-card py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 mb-8">
          {/* Marque */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="font-bold text-foreground">LearnIT</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              La plateforme gratuite d'initiation à l'informatique, pensée pour les vrais débutants.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation du site">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Découvrir</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.navigation.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Compte */}
          <nav aria-label="Compte">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Votre compte</p>
            <ul className="space-y-2">
              {FOOTER_LINKS.compte.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground text-center sm:text-left">
          <p>© {new Date().getFullYear()} LearnIT — Plateforme d'initiation à l'informatique</p>
          <p>Projet pédagogique de démonstration.</p>
        </div>
      </footer>

    </div>
  )
}
