import { Link } from 'react-router'
import {
  GraduationCap, ArrowLeft, ArrowRight, UserPlus, LogIn, LayoutDashboard,
  BookOpen, Zap, TrendingUp, MessageCircle, Settings, Lightbulb, Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import Reveal from '../components/Reveal'
import { buttonVariants } from '../components/ui/Button'

/* ────────────────────────────────────────────────────────────────
   Contenu du guide — MODIFIEZ ICI les étapes et astuces :
   le rendu (rail numéroté, listes, encadrés) est généré dessous.
──────────────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'compte',
    icon: UserPlus,
    title: 'Créez votre compte',
    intro: "L'inscription est gratuite et prend moins d'une minute. Aucune carte bancaire n'est demandée.",
    steps: [
      "Depuis la page d'accueil, cliquez sur le bouton « S'inscrire ».",
      'Renseignez votre nom, votre adresse email et choisissez un mot de passe.',
      'Ouvrez votre boîte mail : un message de confirmation vous a été envoyé.',
      'Cliquez sur le lien contenu dans ce message — votre compte est activé !',
    ],
    tip: "Pas de mail reçu ? Vérifiez votre dossier « spam » ou « courrier indésirable », il s'y cache parfois.",
    shot: { src: '/guide/compte.png', alt: "Formulaire d'inscription de LearnIT : nom, adresse email et mot de passe" },
  },
  {
    id: 'connexion',
    icon: LogIn,
    title: 'Connectez-vous',
    intro: 'Une fois votre compte activé, vous pouvez ouvrir votre espace personnel à tout moment.',
    steps: [
      'Cliquez sur « Connexion » puis saisissez votre email et votre mot de passe.',
      'Vous arrivez directement sur votre tableau de bord.',
    ],
    tip: 'Mot de passe oublié ? Cliquez sur « Mot de passe oublié » sur la page de connexion : vous recevrez un lien par email pour en choisir un nouveau.',
    shot: { src: '/guide/connexion.png', alt: 'Page de connexion de LearnIT avec les champs email et mot de passe' },
  },
  {
    id: 'tableau-de-bord',
    icon: LayoutDashboard,
    title: 'Découvrez votre tableau de bord',
    intro: "C'est votre page d'accueil personnelle : elle résume où vous en êtes et vous remet dans votre apprentissage en un clic.",
    steps: [
      'Votre progression globale (leçons terminées sur le total) est affichée en haut.',
      'La carte « Continuer là où vous en étiez » vous ramène directement à votre prochaine leçon.',
      'Votre série de jours d\'activité (la flamme 🔥) vous encourage à revenir chaque jour.',
      'Plus bas : vos statistiques, votre progression en vitesse de frappe et vos badges.',
    ],
    tip: 'À votre première visite, un petit guide de bienvenue vous présente la plateforme écran par écran.',
    shot: { src: '/guide/tableau-de-bord.png', alt: "Tableau de bord d'une apprenante : progression globale, carte de reprise et statistiques" },
  },
  {
    id: 'cours',
    icon: BookOpen,
    title: 'Suivez un cours',
    intro: 'Les cours sont composés de leçons courtes, à lire à votre rythme, dans l\'ordre.',
    steps: [
      'Ouvrez le menu « Cours » pour parcourir le catalogue complet.',
      'Filtrez si besoin : Tous, En cours, Terminés ou Nouveaux.',
      'Cliquez sur un cours pour voir son programme, puis ouvrez la première leçon.',
      'Les leçons se déverrouillent dans l\'ordre : terminez la leçon en cours pour accéder à la suivante.',
      'En bas de chaque leçon, cliquez sur « Marquer comme terminée » — si la leçon contient des exercices, réussissez-les d\'abord.',
    ],
    tip: 'Vous pouvez relire une leçon déjà terminée autant de fois que vous le souhaitez.',
    shot: { src: '/guide/cours.png', alt: "Page d'un cours : le programme des leçons, numérotées et à suivre dans l'ordre" },
  },
  {
    id: 'exercices',
    icon: Zap,
    title: 'Entraînez-vous avec les exercices',
    intro: 'Chaque exercice est corrigé instantanément : vous savez tout de suite ce qui est acquis.',
    steps: [
      'QCM et vrai/faux : choisissez votre réponse, la correction s\'affiche immédiatement avec une explication.',
      'Exercices de frappe au clavier : recopiez le texte affiché, votre vitesse est mesurée en mots par minute.',
      'Au premier exercice de frappe, indiquez votre type de clavier (AZERTY, QWERTY, Mac) pour recevoir les bons raccourcis d\'accents.',
    ],
    tip: 'Un exercice raté n\'est jamais bloquant : recommencez autant de fois que nécessaire, seul votre meilleur résultat compte.',
    shot: { src: '/guide/exercices.png', alt: "Fin d'une leçon : exercice de dactylographie avec les modes examen et entraînement" },
  },
  {
    id: 'progres',
    icon: TrendingUp,
    title: 'Suivez vos progrès',
    intro: 'Tout ce que vous faites est enregistré pour que vous puissiez mesurer le chemin parcouru.',
    steps: [
      'La page « Résultats » regroupe l\'historique de tous vos exercices et vos moyennes.',
      'Des badges se débloquent au fil de vos réussites (première leçon, série de jours, vitesse de frappe…).',
      'Quand toutes les leçons d\'un cours sont terminées, téléchargez votre certificat de réussite en PDF.',
    ],
    tip: 'Le graphique de vitesse de frappe sur le tableau de bord montre vos 10 dernières sessions : idéal pour voir vos progrès.',
    shot: { src: '/guide/progres.png', alt: 'Page Mes résultats : historique des exercices et moyennes' },
  },
  {
    id: 'aide',
    icon: MessageCircle,
    title: 'Posez vos questions aux formateurs',
    intro: 'Vous n\'êtes jamais seul·e : une messagerie d\'aide est intégrée à la plateforme.',
    steps: [
      'Cliquez sur la bulle orange en bas à droite de l\'écran, sur n\'importe quelle page.',
      'Écrivez votre question — vous pouvez aussi joindre une photo ou une capture d\'écran.',
      'Un formateur vous répond directement dans la discussion ; la cloche 🔔 vous prévient des nouvelles réponses.',
    ],
    tip: 'Aucune question n\'est « bête » : les formateurs sont là précisément pour accompagner les débutants.',
    shot: { src: '/guide/aide.png', alt: 'Fenêtre de discussion avec le support ouverte en bas à droite du tableau de bord' },
  },
  {
    id: 'personnalisation',
    icon: Settings,
    title: 'Personnalisez votre expérience',
    intro: 'Quelques réglages pour que la plateforme s\'adapte à vous — et pas l\'inverse.',
    steps: [
      'Basculez entre thème clair et sombre avec le bouton soleil / lune, en haut de l\'écran.',
      'Utilisez la barre de recherche pour retrouver un cours ou une leçon en quelques lettres.',
      'Changez votre mot de passe à tout moment depuis votre menu profil (votre avatar, en haut à droite).',
      'Sur téléphone ou tablette, tout fonctionne aussi : la navigation se place en bas de l\'écran.',
    ],
    tip: 'Votre type de clavier peut être modifié à tout moment depuis une leçon de frappe si vous changez d\'ordinateur.',
    shot: { src: '/guide/personnalisation.png', alt: 'Menu profil ouvert : Mes résultats, modifier le mot de passe et déconnexion' },
  },
]

/** Capture d'écran encadrée dans une fenêtre de navigateur factice. */
function Screenshot({ src, alt }) {
  return (
    <figure className="mt-6 mb-5 max-w-2xl rounded-2xl overflow-hidden border border-border shadow-card bg-card">
      <div className="bg-muted px-4 py-2.5 flex items-center gap-1.5 border-b border-border" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      {/* Dimensions fixées (1200×750) : pas de saut de mise en page au chargement */}
      <img src={src} alt={alt} width={1200} height={750} loading="lazy" decoding="async" className="w-full h-auto block" />
    </figure>
  )
}

/* ── Rendu ─────────────────────────────────────────────────── */
export default function Guide() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/75 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base">LearnIT</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
              <span className="sm:hidden">Accueil</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Guide d'utilisation
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              Bien démarrer sur
              <span className="bg-gradient-to-r from-primary via-primary to-amber-500 bg-clip-text text-transparent"> LearnIT</span>
            </h1>
            <p className="text-muted-foreground sm:text-lg max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500">
              De la création de votre compte à votre premier certificat : suivez ces
              {' '}{SECTIONS.length} étapes pour profiter de toute la plateforme, sans rien connaître à l'avance.
            </p>
          </div>
        </section>

        {/* ── Sommaire ── */}
        <nav aria-label="Sommaire du guide" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 stagger">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-3.5 py-3 text-sm font-medium text-foreground shadow-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 h-full"
                >
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0" aria-hidden="true">
                    {i + 1}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Étapes ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {SECTIONS.map(({ id, icon: Icon, title, intro, steps, tip, shot }, i) => (
            <section key={id} id={id} className="relative sm:pl-24 pb-12 sm:pb-16 scroll-mt-24">

              {/* Rail : icône numérotée + ligne verticale (masqué sur mobile) */}
              <div className="hidden sm:flex absolute left-0 top-0 bottom-0 w-14 flex-col items-center" aria-hidden="true">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {i < SECTIONS.length - 1 && <div className="w-px flex-1 bg-border mt-4" />}
              </div>

              <Reveal>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                  Étape {i + 1} sur {SECTIONS.length}
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2.5">
                  <span className="sm:hidden w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0" aria-hidden="true">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </span>
                  {title}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-5 max-w-2xl">{intro}</p>

                {shot && <Screenshot src={shot.src} alt={shot.alt} />}

                <ol className="space-y-3 mb-5">
                  {steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm sm:text-base text-foreground leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
                        {j + 1}
                      </span>
                      <span className="max-w-2xl">{step}</span>
                    </li>
                  ))}
                </ol>

                {tip && (
                  <div className="flex items-start gap-3 bg-info/8 border border-info/20 rounded-xl p-4 max-w-2xl">
                    <Lightbulb className="w-4 h-4 text-info shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong className="font-semibold">Bon à savoir :</strong> {tip}
                    </p>
                  </div>
                )}
              </Reveal>
            </section>
          ))}
        </div>

        {/* ── CTA final ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <Reveal className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border p-8 sm:p-12 text-center shadow-card">
            <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
                Prêt à vous lancer ?
              </h2>
              <p className="text-muted-foreground mb-7 max-w-md mx-auto text-sm sm:text-base">
                Vous savez maintenant tout ce qu'il faut. La première étape ne prend qu'une minute.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className={buttonVariants({ size: 'lg' })}>
                  Créer mon compte <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3.5 rounded-xl font-medium text-sm hover:bg-muted transition-colors"
                >
                  J'ai déjà un compte
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

      </main>

      <footer className="border-t border-border bg-card py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground text-center sm:text-left">
          <p>© {new Date().getFullYear()} LearnIT — Plateforme d'initiation à l'informatique</p>
          <Link to="/" className="hover:text-foreground transition-colors">Retour à l'accueil</Link>
        </div>
      </footer>

    </div>
  )
}
