import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Users, BookOpen, Clock, TrendingUp, ArrowRight, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { PageHeader } from '../../components/ui/PageHeader'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersRes, publishedRes, draftRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', false),
        supabase.from('progress').select('id', { count: 'exact', head: true }).eq('completed', true),
      ])
      return {
        users: usersRes.count ?? 0,
        published: publishedRes.count ?? 0,
        drafts: draftRes.count ?? 0,
        completions: progressRes.count ?? 0,
      }
    },
  })

  const cards = [
    { label: 'Utilisateurs inscrits', value: stats?.users, icon: Users, bg: 'bg-primary/10', border: 'border-primary/20', color: 'text-primary', to: '/admin/utilisateurs' },
    { label: 'Cours publiés', value: stats?.published, icon: BookOpen, bg: 'bg-success/10', border: 'border-success/20', color: 'text-success', to: '/admin/cours' },
    { label: 'Brouillons', value: stats?.drafts, icon: Clock, bg: 'bg-warning/10', border: 'border-warning/20', color: 'text-warning', to: null },
    { label: 'Leçons complétées', value: stats?.completions, icon: TrendingUp, bg: 'bg-violet-500/10', border: 'border-violet-500/20', color: 'text-violet-500', to: null },
  ]

  return (
    <div>

      <PageHeader
        hero
        eyebrow="Administration"
        title="Vue d'ensemble"
        description="Statistiques en temps réel de la plateforme LearnIT."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          : cards.map(({ label, value, icon, bg, border, color, to }, i) => (
              <StatCard
                key={label}
                icon={icon}
                label={label}
                value={value ?? 0}
                color={color}
                bg={bg}
                border={border}
                to={to}
                delay={i * 60}
                trailing={to && <ArrowRight className={`w-4 h-4 ${color} opacity-40 group-hover:opacity-100 transition-opacity`} />}
              />
            ))
        }
      </div>

      {/* Actions rapides */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 bg-muted border border-border text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          Actions rapides
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          to="/admin/suivi"
          className="bg-card rounded-3xl border border-border p-5 sm:p-6 flex items-center gap-4 shadow-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group col-span-full sm:col-span-2"
        >
          <div className="w-11 h-11 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-success" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground mb-0.5">Suivi en direct des exercices</p>
            <p className="text-sm text-muted-foreground hidden sm:block">Voyez les résultats des apprenants en temps réel dès qu'ils soumettent un exercice.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
            <ArrowRight className="w-4 h-4 text-success opacity-40 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
        </Link>
        <Link
          to="/admin/utilisateurs"
          className="bg-card rounded-3xl border border-border p-5 sm:p-6 flex items-center gap-4 shadow-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group"
        >
          <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground mb-0.5">Gérer les utilisateurs</p>
            <p className="text-sm text-muted-foreground hidden sm:block">Consultez les comptes et modifiez les rôles.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>

        <Link
          to="/admin/cours"
          className="bg-card rounded-3xl border border-border p-5 sm:p-6 flex items-center gap-4 shadow-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 group"
        >
          <div className="w-11 h-11 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-success" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground mb-0.5">Gérer les cours</p>
            <p className="text-sm text-muted-foreground hidden sm:block">Publiez, dépubliez ou supprimez des cours.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-success opacity-40 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
        </Link>
      </div>

    </div>
  )
}
