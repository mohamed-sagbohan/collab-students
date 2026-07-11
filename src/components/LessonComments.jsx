import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, CornerDownRight, Trash2, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { acquireChannel } from '../lib/realtimeChannel'
import { Skeleton } from './Skeleton'
import { EmptyState } from './ui/EmptyState'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { useToast } from './ui/Toast'
import { useConfirm } from './ui/ConfirmDialog'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function initials(name) {
  return (name ?? '?').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function CommentForm({ lessonId, parentId = null, parentAuthor = null, onCancel, onSuccess }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [content, setContent] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').insert({
        lesson_id: lessonId,
        user_id: user.id,
        parent_id: parentId,
        content: content.trim(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
      onSuccess?.()
    },
    onError: () => toast.error("Impossible d'envoyer votre commentaire. Réessayez."),
  })

  return (
    <div className="flex gap-3">
      <Avatar name={user?.email} size="sm" className="sm:w-8 sm:h-8 mt-1" />
      <div className="flex-1">
        {parentAuthor && (
          <p className="text-xs text-primary font-medium mb-1.5 flex items-center gap-1">
            <CornerDownRight className="w-3 h-3" />
            En réponse à <span className="font-bold">{parentAuthor}</span>
          </p>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'Votre réponse…' : 'Posez une question ou partagez une remarque…'}
          rows={2}
          className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card resize-none transition-colors"
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            onClick={() => mutate()}
            disabled={!content.trim()}
            loading={isPending}
          >
            {!isPending && <Send className="w-3 h-3" aria-hidden="true" />}
            {isPending ? 'Envoi…' : 'Envoyer'}
          </Button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, lessonId, allComments }) {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()
  const confirm = useConfirm()
  const [replying, setReplying] = useState(false)

  const isOwn   = user?.id === comment.user_id
  const canDelete = isOwn || ['formateur', 'admin'].includes(profile?.role)
  const replies = allComments.filter((c) => c.parent_id === comment.id)

  const { mutate: deleteComment } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').delete().eq('id', comment.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
      toast.success('Commentaire supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer ce commentaire. Réessayez.'),
  })

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
          {initials(comment.profiles?.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground">{comment.profiles?.name ?? 'Anonyme'}</span>
            {comment.profiles?.role && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                comment.profiles.role === 'formateur'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : comment.profiles.role === 'admin'
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'hidden'
              }`}>
                {comment.profiles.role === 'formateur' ? 'Formateur' : 'Admin'}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-1 mt-0.5 -ml-2">
            {!comment.parent_id && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-2.5 min-h-11 rounded-lg"
              >
                Répondre
              </button>
            )}
            {canDelete && (
              <button
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Supprimer ce commentaire ?',
                    description: 'Le commentaire et ses réponses seront définitivement supprimés.',
                    confirmLabel: 'Supprimer',
                    danger: true,
                  })
                  if (ok) deleteComment()
                }}
                aria-label="Supprimer ce commentaire"
                className="inline-flex items-center justify-center w-11 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Réponses */}
      {replies.length > 0 && (
        <div className="ml-10 sm:ml-11 mt-3 space-y-3 border-l-2 border-border pl-3 sm:pl-4">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} lessonId={lessonId} allComments={allComments} />
          ))}
        </div>
      )}

      {/* Formulaire de réponse */}
      {replying && (
        <div className="ml-10 sm:ml-11 mt-3 border-l-2 border-primary/30 pl-3 sm:pl-4">
          <CommentForm
            lessonId={lessonId}
            parentId={comment.id}
            parentAuthor={comment.profiles?.name}
            onCancel={() => setReplying(false)}
            onSuccess={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  )
}

export default function LessonComments({ lessonId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles:user_id(name, role)')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!lessonId,
  })

  // Realtime : nouveaux commentaires
  useEffect(() => {
    if (!lessonId) return
    const handle = acquireChannel(`comments-${lessonId}`, undefined, (channel) => {
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `lesson_id=eq.${lessonId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', lessonId] })
      })
    })
    return () => { handle.remove() }
  }, [lessonId, queryClient])

  // Seuls les commentaires racines (pas de parent)
  const rootComments = comments.filter((c) => c.parent_id === null)
  const total = comments.length

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 bg-info/10 border border-info/20 rounded-xl flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-info" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Questions & Commentaires
          {total > 0 && <span className="ml-2 text-xs font-semibold text-muted-foreground">({total})</span>}
        </h3>
      </div>

      {/* Formulaire principal */}
      {user && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-5">
          <CommentForm lessonId={lessonId} />
        </div>
      )}

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : rootComments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun commentaire encore"
          description="Soyez le premier à en laisser un !"
          className="py-8"
        />
      ) : (
        <div className="space-y-5">
          {rootComments.map((comment) => (
            <div key={comment.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300 bg-card border border-border rounded-2xl p-4 sm:p-5">
              <CommentItem comment={comment} lessonId={lessonId} allComments={comments} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
