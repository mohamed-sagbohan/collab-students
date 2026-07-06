import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Trash2, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react'
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
const PAGE_SIZE = 25

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

  // Pagination + recherche CÔTÉ SERVEUR : la page reste rapide
  // quel que soit le nombre d'inscrits.
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-users', page, debounced],
    queryFn: async () => {
      let q = supabase
        .from('profiles')
        .select('id, name, role, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
      if (debounced) q = q.ilike('name', `%${debounced.replace(/[%_]/g, '\\$&')}%`)
      const { data: rows, error, count } = await q
      if (error) throw error
      return { users: rows ?? [], count: count ?? 0 }
    },
    placeholderData: keepPreviousData,
  })

  const users = data?.users
  const totalCount = data?.count ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

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
        description={`${isLoading ? '—' : totalCount} compte${totalCount !== 1 ? 's' : ''} inscrit${totalCount !== 1 ? 's' : ''}`}
      />

      {deleteUser.isError && (
        <p className="text-xs text-destructive mb-4">Erreur : {deleteUser.error?.message}</p>
      )}

      <label className="relative block mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur…"
          aria-label="Rechercher un utilisateur par nom"
          className="w-full h-11 pl-9 pr-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </label>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <EmptyState
          icon={Users}
          title={debounced ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
          description={debounced ? 'Essayez un autre nom.' : undefined}
        />
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
                          className="inline-flex items-center justify-center w-11 h-11 -my-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-30 disabled:pointer-events-none"
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
                    className="inline-flex items-center justify-center w-11 h-11 -mx-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </MobileCards>

          {/* Pagination */}
          {pageCount > 1 && (
            <nav
              aria-label="Pagination des utilisateurs"
              className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isFetching}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl text-sm font-medium text-foreground border border-border hover:border-primary/30 hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                Précédent
              </button>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                Page {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1 || isFetching}
                className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-xl text-sm font-medium text-foreground border border-border hover:border-primary/30 hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Suivant
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </nav>
          )}

        </div>
      )}

    </div>
  )
}
