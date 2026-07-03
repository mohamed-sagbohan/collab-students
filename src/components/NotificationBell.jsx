import { useState, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Bell, Award, MessageSquare, BookOpen, CheckCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const TYPE_ICON = {
  badge:         { Icon: Award,         color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  comment_reply: { Icon: MessageSquare, color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  new_course:    { Icon: BookOpen,      color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/20' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l\'instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h}h`
  const d = Math.floor(h / 24)
  return `il y a ${d}j`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
      return data ?? []
    },
    enabled: !!user,
  })

  // Realtime : nouvelles notifications
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, queryClient])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markRead(notif) {
    setOpen(false)
    if (!notif.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', notif.id)
      queryClient.setQueryData(['notifications', user.id], (old) =>
        old?.map((n) => n.id === notif.id ? { ...n, read: true } : n)
      )
    }
    if (notif.link) navigate(notif.link)
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    queryClient.setQueryData(['notifications', user.id], (old) =>
      old?.map((n) => ({ ...n, read: true }))
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex">
            <span className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
            <span className="relative w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150 absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-xs text-muted-foreground">Aucune notification pour l'instant.</p>
              </div>
            )}
            {notifications.map((notif) => {
              const { Icon, color, bg, border } = TYPE_ICON[notif.type] ?? TYPE_ICON.badge
              return (
                <button
                  key={notif.id}
                  onClick={() => markRead(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                    !notif.read ? 'bg-primary/3' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-snug ${notif.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{notif.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
