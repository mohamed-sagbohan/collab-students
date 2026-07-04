import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Skeleton } from '../../components/Skeleton'
import { useConfirm } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { useToast } from '../../components/ui/Toast'
import { PageHeader } from '../../components/ui/PageHeader'
import { TableShell, Table, THead, TH, TBody, TR, TD, MobileCards } from '../../components/ui/Table'

const ROLES = ['apprenante', 'formateur', 'admin']

const roleBadge = {
  apprenante: 'bg-primary/10 text-primary border-primary/20',
  formateur: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
  admin: 'bg-warning/10 text-warning border-warning/20',
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

      <PageHeader
        eyebrow="Administration"
        title="Utilisateurs"
        description={`${isLoading ? '—' : users?.length} compte${users?.length !== 1 ? 's' : ''} inscrit${users?.length !== 1 ? 's' : ''}`}
      />

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
          <TableShell stickyHeader>
            <Table>
              <THead sticky>
                <TH>Utilisateur</TH>
                <TH>Inscription</TH>
                <TH>Rôle</TH>
                <TH align="right"><span className="sr-only">Actions</span></TH>
              </THead>
              <TBody>
                {users.map((user, i) => {
                  const isSelf = user.id === currentUser?.id
                  return (
                    <TR key={user.id} delay={Math.min(i, 12) * 30}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} className="w-9 h-9" />
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </TD>
                      <TD className="text-muted-foreground text-xs">
                        {new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </TD>
                      <TD>
                        <select
                          value={user.role}
                          onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                          aria-label={`Rôle de ${user.name}`}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/20 bg-transparent ${roleBadge[user.role] ?? 'bg-muted text-foreground border-border'}`}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </TD>
                      <TD align="right">
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={isSelf}
                          aria-label={`Supprimer l'utilisateur ${user.name}`}
                          title={isSelf ? 'Vous ne pouvez pas supprimer votre propre compte' : undefined}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </TableShell>

          {/* Cards mobile */}
          <MobileCards>
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
          </MobileCards>

        </div>
      )}

    </div>
  )
}
