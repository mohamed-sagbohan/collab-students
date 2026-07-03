import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Skeleton } from '../../components/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'

const ROLES = ['apprenante', 'formateur', 'admin']

const roleBadge = {
  apprenante: 'bg-primary/10 text-primary border-primary/20',
  formateur: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

export default function AdminUsers() {
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const updateRole = useMutation({
    mutationFn: async ({ id, role }) => {
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  return (
    <div>

      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          Administration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Utilisateurs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading ? '—' : users?.length} compte{users?.length !== 1 ? 's' : ''} inscrit{users?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <EmptyState icon={Users} title="Aucun utilisateur" />
      )}

      {!isLoading && users?.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">

          {/* Table desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscription</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user, i) => {
                  const initials = user.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                  return (
                    <tr
                      key={user.id}
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                      className="animate-in fade-in hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/20 bg-transparent ${roleBadge[user.role] ?? 'bg-muted text-foreground border-border'}`}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="sm:hidden divide-y divide-border/50">
            {users.map((user) => {
              const initials = user.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
              return (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/20 bg-transparent shrink-0 ${roleBadge[user.role] ?? 'bg-muted text-foreground border-border'}`}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}
