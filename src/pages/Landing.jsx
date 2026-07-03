import { Link } from 'react-router'
import { BookOpen, Zap, TrendingUp, ArrowRight, CheckCircle, GraduationCap, Sparkles, Shield, Users, Lock } from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import Reveal from '../components/Reveal'

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

const stats = [
  { value: '1 200+', label: 'Apprenants actifs' },
  { value: '9', label: 'Cours disponibles' },
  { value: '36+', label: 'Leçons interactives' },
  { value: '100%', label: 'Gratuit' },
]

const mockCourses = [
  { title: 'Maîtriser son ordinateur', progress: 75 },
  { title: 'Internet et navigation web', progress: 33 },
  { title: 'Word – Traitement de texte', progress: 0 },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base">LearnIT</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Glow de fond */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Plateforme 100% gratuite · Pour les débutants
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.05] tracking-tight mb-5">
                Apprenez
                <span className="text-primary"> l'informatique</span>
                <br />à votre rythme.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Des cours clairs et des exercices interactifs conçus pour les vrais débutants.
                Maîtrisez l'ordinateur, Office, Internet et bien plus — pas à pas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                >
                  Commencer gratuitement <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3.5 rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
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
                  <span>1 200+ apprenants</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-primary">★★★★★</span>
                  <span>4.9/5</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Sans carte bancaire</span>
                </div>
              </div>
            </div>

            {/* Mockup app */}
            <div className="relative hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '150ms', animationFillMode: 'backwards' }}>
              {/* Carte flottante haut */}
              <div className="absolute -top-6 -right-4 bg-card border border-border rounded-2xl shadow-2xl p-4 z-10">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" /> Ma progression
                </p>
                <p className="text-3xl font-extrabold text-primary leading-none">75%</p>
                <p className="text-xs text-muted-foreground mt-1">Leçon 3 sur 4</p>
              </div>
              {/* Carte flottante bas */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl shadow-2xl p-3 z-10 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Exercice réussi !</p>
                  <p className="text-xs text-muted-foreground">Raccourcis clavier</p>
                </div>
              </div>
              {/* Fenêtre navigateur */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">M</div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mes cours</p>
                  {mockCourses.map((c, i) => (
                    <div key={i} className="mb-2.5 p-3 rounded-xl bg-muted flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-primary text-primary-foreground' : i === 1 ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate mb-1.5">{c.title}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold shrink-0 text-primary">{c.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── STATS ── */}
        <section className="border-y border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map(({ value, label }, i) => (
              <Reveal key={label} delay={i * 80}>
                <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            {/* Section badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Ce qui rend LearnIT différent
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">Tout pour apprendre efficacement</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Une plateforme pensée pour les débutants, de la première leçon jusqu'à l'autonomie numérique complète.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={(i % 3) * 100}>
                <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group h-full">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── PARCOURS ── */}
        <section className="bg-card/50 border-y border-border py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Comment ça marche
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">Quelques étapes, un seul objectif</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">Progressez à votre rythme, du premier clic jusqu'à l'autonomie numérique.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { n: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes, sans carte bancaire.' },
                { n: '02', title: 'Choisissez un cours', desc: '9 cours du niveau débutant absolu couvrant tous les essentiels.' },
                { n: '03', title: 'Suivez les leçons', desc: 'Contenu clair, illustré, à lire à votre propre rythme.' },
                { n: '04', title: 'Validez vos acquis', desc: 'Exercices interactifs corrigés instantanément pour ancrer vos connaissances.' },
              ].map(({ n, title, desc }, i) => (
                <Reveal key={n} delay={i * 100}>
                  <div className="relative bg-card border border-border rounded-2xl p-6 h-full">
                    <span className="text-4xl font-extrabold text-primary/20 leading-none block mb-4">{n}</span>
                    <h3 className="font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <Reveal className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border p-8 sm:p-16 text-center">
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                Inscription gratuite
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
                Prêt à maîtriser<br />
                <span className="text-primary">l'informatique ?</span>
              </h2>
              <p className="text-muted-foreground mb-8 sm:text-lg max-w-md mx-auto">
                Rejoignez 1 200+ apprenants et commencez aujourd'hui, sans frais, sans engagement.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-xl shadow-primary/30"
              >
                Créer mon compte <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </Reveal>
        </section>

      </main>

      <footer className="border-t border-border bg-card py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between text-sm text-muted-foreground gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">LearnIT</span>
          </div>
          <p>© {new Date().getFullYear()} LearnIT — Plateforme d'initiation à l'informatique</p>
        </div>
      </footer>

    </div>
  )
}
