// ────────────────────────────────────────────────────────────────
// Contenu éditorial de la page d'accueil publique.
// MODIFIEZ ICI les chiffres, témoignages et liens du footer :
// aucun autre fichier à toucher.
// ────────────────────────────────────────────────────────────────

export const STATS = {
  learners: '1 200+',
  courses: '9',
  lessons: '36+',
  free: '100%',
  rating: '4.9/5',
}

export const STAT_ITEMS = [
  { value: STATS.learners, label: 'Apprenants actifs' },
  { value: STATS.courses, label: 'Cours disponibles' },
  { value: STATS.lessons, label: 'Leçons interactives' },
  { value: STATS.free, label: 'Gratuit' },
]

// Témoignages FICTIFS de démonstration (maquette) — à remplacer par de
// vrais retours d'apprenants. Ils sont signalés comme illustratifs dans l'UI.
export const TESTIMONIALS = [
  {
    name: 'Marie K.',
    role: 'Apprenante depuis 3 mois',
    quote:
      "Je n'avais jamais osé toucher un ordinateur. Aujourd'hui j'écris mes courriers moi-même et je fais mes démarches en ligne sans aide.",
  },
  {
    name: 'Joseph A.',
    role: 'Apprenant depuis 6 mois',
    quote:
      "Les leçons sont courtes et très claires. Les exercices de frappe m'ont fait passer de 8 à 32 mots par minute !",
  },
  {
    name: 'Fatou D.',
    role: 'Apprenante depuis 2 mois',
    quote:
      'Enfin une plateforme qui explique sans jargon. Je progresse à mon rythme, même depuis mon téléphone.',
  },
]

export const FOOTER_LINKS = {
  navigation: [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Comment ça marche', href: '#parcours' },
    { label: 'Témoignages', href: '#temoignages' },
  ],
  compte: [
    { label: 'Se connecter', to: '/login' },
    { label: 'Créer un compte', to: '/register' },
    { label: 'Mot de passe oublié', to: '/forgot-password' },
  ],
}
