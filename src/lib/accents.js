// Palettes décoratives partagées — rotation par index (cartes de cours)
// ou couleur nommée (badges de gamification, champ `color` en base).
// Décoration uniquement, pas de sémantique : les états (succès, erreur,
// avertissement…) passent par les tokens success/warning/info/destructive.

export const CARD_ACCENTS = [
  { bg: 'bg-primary/10', border: 'border-primary/20', icon: 'text-primary', dot: 'bg-primary' },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'text-amber-500', dot: 'bg-amber-500' },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-500', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-500', dot: 'bg-violet-500' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: 'text-rose-500', dot: 'bg-rose-500' },
  { bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: 'text-sky-500', dot: 'bg-sky-500' },
]

export function accentFor(index) {
  return CARD_ACCENTS[index % CARD_ACCENTS.length]
}

export const BADGE_COLORS = {
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
}
