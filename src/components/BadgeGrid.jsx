import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Skeleton } from './Skeleton'
import { Lock } from 'lucide-react'
import { BADGE_COLORS } from '../lib/accents'

function BadgeCard({ badge, earned, earnedAt, delay = 0 }) {
  const colors = BADGE_COLORS[badge.color] ?? BADGE_COLORS.amber

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`animate-in fade-in zoom-in-95 relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5 ${
        earned
          ? `${colors.bg} ${colors.border} shadow-sm hover:shadow-md`
          : 'bg-muted/30 border-border opacity-50'
      }`}
    >
      {/* Emoji / icône verrou */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          earned ? `${colors.bg} border ${colors.border}` : 'bg-muted border border-border'
        }`}
      >
        {earned ? badge.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
      </div>

      {/* Nom */}
      <p className={`text-xs font-bold leading-tight ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
        {badge.name}
      </p>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground leading-snug">
        {badge.description}
      </p>

      {/* Date d'obtention */}
      {earned && earnedAt && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {new Date(earnedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  )
}

export default function BadgeGrid() {
  const { user } = useAuth()

  const { data: allBadges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['badges-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data
    },
  })

  const { data: earned = [], isLoading: loadingEarned } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id, awarded_at')
        .eq('user_id', user.id)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const isLoading = loadingBadges || loadingEarned

  // Map badge_id → earliest awarded_at (certains badges peuvent être obtenus plusieurs fois, ex: course_complete)
  const earnedMap = earned.reduce((acc, ub) => {
    if (!acc[ub.badge_id] || ub.awarded_at < acc[ub.badge_id]) {
      acc[ub.badge_id] = ub.awarded_at
    }
    return acc
  }, {})

  const earnedCount = Object.keys(earnedMap).length

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-foreground">Mes badges</h2>
        <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          {earnedCount} / {allBadges.length} obtenus
        </span>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allBadges.map((badge, i) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={!!earnedMap[badge.id]}
            earnedAt={earnedMap[badge.id]}
            delay={Math.min(i, 12) * 40}
          />
        ))}
      </div>
    </div>
  )
}
