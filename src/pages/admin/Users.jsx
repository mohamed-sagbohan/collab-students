import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { useToast } from '../../components/ui/Toast'

const ROLES = ['apprenante', 'formateur', 'admin']

const roleBadge = {
  apprenante: 'bg-primary/10 text-primary border-primary/20',
  formateur: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const { user: currentUser } = useAuth()

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(`Rôle mis à jour : ${variables.role}.`)
    },
    onError: () => toast.error('Impossible de modifier le rôle. Réessayez.'),
  })

  const deleteUser = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId: id } })
      if (error) {
        const body = await error.context?.json?.().catch(() => null)
        throw new Error(body?.error ?? error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Utilisateur supprimé.')
    },
    onError: () => toast.error("Impossible de supprimer l'utilisateur. Réessayez."),
  })

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: 'Supprimer cet utilisateur ?',
      description: `Le compte de "${name}" sera définitivement supprimé (profil, progression, résultats). Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    })
    if (ok) deleteUser.mutate(id)
  }

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

      {deleteUser.isError && (
        <p className="text-xs text-destructive mb-4">Erreur : {deleteUser.error?.message}</p>
      )}

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
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((user, i) => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <tr
                      key={user.id}
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                      className="animate-in fade-in hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} className="w-9 h-9" />
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={isSelf}
                          aria-label={`Supprimer l'utilisateur ${user.name}`}
                          title={isSelf ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
              const isSelf = user.id === currentUser?.id
              return (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <Avatar name={user.name} size="lg" />
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
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    disabled={isSelf}
                    aria-label={`Supprimer l'utilisateur ${user.name}`}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}
