import { useEffect, useState } from 'react'
import { Phone, Video, Search, ChevronLeft, ChevronRight, PhoneIncoming, PhoneOutgoing } from 'lucide-react'
import { useCallContext } from '../../components/calls/CallProvider'
import { useStaffCalls, STAFF_CALLS_PAGE_SIZE, formatDuration } from '../../hooks/useCalls'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Skeleton } from '../../components/Skeleton'
import { TableShell, Table, THead, TH, TBody, TR, TD, MobileCards } from '../../components/ui/Table'

// Dérivé de callStatusMeta(call).variant : la couleur gère déjà le cas
// 'ringing' périmé traité comme manqué (voir useCalls.callStatusMeta) —
// on reconstruit juste le libellé texte adapté à une colonne dédiée
// (callStatusMeta mélange libellé et durée, utile pour la pilule du fil
// de chat mais pas pour ce tableau qui a sa propre colonne Durée).
function statusLabel(call, variant) {
  if (variant === 'destructive') {
    if (call.status === 'declined') return 'Refusé'
    if (call.status === 'failed') return 'Échec'
    return 'Manqué'
  }
  if (variant === 'success') return 'Terminé'
  return 'En cours'
}

function statusVariant(status) {
  if (status === 'ended') return 'success'
  if (['declined', 'failed', 'missed'].includes(status)) return 'destructive'
  return 'neutral'
}

function durationLabel(call) {
  if (!call.answered_at || !call.ended_at) return '—'
  const secs = Math.max(0, Math.round((new Date(call.ended_at) - new Date(call.answered_at)) / 1000))
  return formatDuration(secs)
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function CallHistory() {
  const { call: activeCall, startCall } = useCallContext()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [callType, setCallType] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search.trim())
      setPage(0)
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => setPage(0), [callType, status])

  const { calls, total, isLoading } = useStaffCalls({
    callType: callType || null,
    status: status || null,
    search: debounced,
    page,
  })
  const pageCount = Math.max(1, Math.ceil(total / STAFF_CALLS_PAGE_SIZE))

  const callBack = (row, type) => {
    if (activeCall.status !== 'idle') return
    startCall({ conversationId: row.conversation_id, callType: type, peerName: row.student_name })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Historique"
        title="Appels"
        description={`${isLoading ? '—' : total} appel${total !== 1 ? 's' : ''} au total`}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative block flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une étudiante…"
            aria-label="Rechercher une étudiante"
            className="w-full h-11 pl-9 pr-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </label>
        <select
          value={callType}
          onChange={(e) => setCallType(e.target.value)}
          aria-label="Filtrer par type d'appel"
          className="h-11 px-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">Tous types</option>
          <option value="audio">Audio</option>
          <option value="video">Vidéo</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filtrer par statut"
          className="h-11 px-3 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">Tous statuts</option>
          <option value="ended">Terminé</option>
          <option value="missed">Manqué</option>
          <option value="declined">Refusé</option>
          <option value="failed">Échec</option>
        </select>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && calls.length === 0 && (
        <EmptyState
          icon={Phone}
          title={debounced || callType || status ? 'Aucun appel trouvé' : 'Aucun appel pour l’instant'}
          description={debounced || callType || status ? 'Essayez d’autres filtres.' : undefined}
        />
      )}

      {!isLoading && calls.length > 0 && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">

          <TableShell stickyHeader>
            <Table>
              <THead sticky>
                <TH>Étudiante</TH>
                <TH>Type</TH>
                <TH>Sens</TH>
                <TH>Statut</TH>
                <TH>Durée</TH>
                <TH>Date</TH>
                <TH align="right"><span className="sr-only">Actions</span></TH>
              </THead>
              <TBody>
                {calls.map((row, i) => {
                  const variant = statusVariant(row.status)
                  return (
                    <TR key={row.id} delay={Math.min(i, 12) * 30}>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Avatar name={row.student_name} className="w-9 h-9" />
                          <p className="font-semibold text-foreground">{row.student_name}</p>
                        </div>
                      </TD>
                      <TD>
                        {row.call_type === 'video' ? <Video className="w-4 h-4 text-muted-foreground" aria-label="Vidéo" /> : <Phone className="w-4 h-4 text-muted-foreground" aria-label="Audio" />}
                      </TD>
                      <TD className="text-muted-foreground text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          {row.caller_is_student ? <PhoneIncoming className="w-3.5 h-3.5" aria-hidden="true" /> : <PhoneOutgoing className="w-3.5 h-3.5" aria-hidden="true" />}
                          {row.caller_is_student ? 'Reçu' : 'Sortant'}
                        </span>
                      </TD>
                      <TD>
                        <StatusBadge variant={variant}>{statusLabel(row, variant)}</StatusBadge>
                      </TD>
                      <TD className="text-muted-foreground text-xs tabular-nums">{durationLabel(row)}</TD>
                      <TD className="text-muted-foreground text-xs">{dateFmt.format(new Date(row.started_at))}</TD>
                      <TD align="right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => callBack(row, 'audio')}
                            disabled={activeCall.status !== 'idle'}
                            aria-label={`Rappeler ${row.student_name} en audio`}
                            className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Phone className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => callBack(row, 'video')}
                            disabled={activeCall.status !== 'idle'}
                            aria-label={`Rappeler ${row.student_name} en vidéo`}
                            className="inline-flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Video className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </TD>
                    </TR>
                  )
                })}
              </TBody>
            </Table>
          </TableShell>

          <MobileCards>
            {calls.map((row) => {
              const variant = statusVariant(row.status)
              return (
                <div key={row.id} className="p-4 flex items-center gap-3">
                  <Avatar name={row.student_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{row.student_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {row.call_type === 'video' ? 'Vidéo' : 'Audio'} · {statusLabel(row, variant)}
                      {row.status === 'ended' && ` · ${durationLabel(row)}`}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{dateFmt.format(new Date(row.started_at))}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => callBack(row, row.call_type)}
                    disabled={activeCall.status !== 'idle'}
                    aria-label={`Rappeler ${row.student_name}`}
                    className="inline-flex items-center justify-center w-11 h-11 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {row.call_type === 'video' ? <Video className="w-4 h-4" aria-hidden="true" /> : <Phone className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              )
            })}
          </MobileCards>

          {pageCount > 1 && (
            <nav
              aria-label="Pagination des appels"
              className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border"
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
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
                disabled={page >= pageCount - 1}
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
