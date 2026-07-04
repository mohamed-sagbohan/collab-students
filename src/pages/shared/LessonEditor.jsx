import { useState, useEffect, useRef, useId } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save, Eye, Code2, Video, Bold, Italic, List, ListOrdered, Heading2, Heading3, Link2, Quote } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { sanitizeLessonHtml } from '../../lib/sanitizeHtml'
import { Skeleton } from '../../components/Skeleton'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'

function extractVideoId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return m?.[1] ?? null
}

function insertLink(taRef, setContent) {
  const url = window.prompt('URL du lien :', 'https://')
  if (!url?.trim()) return
  insertWrap(taRef, setContent, `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer">`, '</a>')
}

function insertWrap(taRef, setContent, before, after = '') {
  const ta = taRef.current
  if (!ta) return
  const s = ta.selectionStart
  const e = ta.selectionEnd
  const selected = ta.value.slice(s, e)
  const newVal = ta.value.slice(0, s) + before + selected + after + ta.value.slice(e)
  setContent(newVal)
  setTimeout(() => {
    ta.focus()
    ta.setSelectionRange(s + before.length, s + before.length + selected.length)
  }, 0)
}

const TOOL_GROUPS = [
  [
    { Icon: Heading2, title: 'Titre 2', before: '\n<h2>', after: '</h2>\n' },
    { Icon: Heading3, title: 'Titre 3', before: '\n<h3>', after: '</h3>\n' },
  ],
  [
    { Icon: Bold,   title: 'Gras',     before: '<strong>', after: '</strong>' },
    { Icon: Italic, title: 'Italique', before: '<em>',     after: '</em>' },
  ],
  [
    { Icon: List,        title: 'Liste à puces',   before: '\n<ul>\n  <li>', after: '</li>\n</ul>\n' },
    { Icon: ListOrdered, title: 'Liste numérotée', before: '\n<ol>\n  <li>', after: '</li>\n</ol>\n' },
  ],
  [
    { Icon: Code2, title: 'Code inline', before: '<code>', after: '</code>' },
    { Icon: Quote, title: 'Citation',    before: '\n<blockquote>\n  ', after: '\n</blockquote>\n' },
  ],
]

export default function LessonEditor() {
  const { courseId, lessonId } = useParams()
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const isNew = lessonId === 'nouveau'
  const isAdmin = profile?.role === 'admin'
  const base = isAdmin ? '/admin/editeur' : '/formateur/editeur'

  const taRef = useRef(null)
  const titleId = useId()
  const orderId = useId()
  const [tab, setTab]       = useState('edit')  // edit | preview
  const [title, setTitle]   = useState('')
  const [content, setContent] = useState('<p>\n\n</p>')
  const [order, setOrder]   = useState(1)
  const [ytInput, setYtInput] = useState('')
  const [showYt, setShowYt] = useState(false)
  const [saved, setSaved]   = useState(false)

  // Chargement leçon existante
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ['editor-lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, content, order_index')
        .eq('id', lessonId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !isNew,
  })

  useEffect(() => {
    if (lessonData) {
      setTitle(lessonData.title ?? '')
      setContent(lessonData.content ?? '')
      setOrder(lessonData.order_index ?? 1)
    }
  }, [lessonData])

  // Auto order_index pour une nouvelle leçon
  useEffect(() => {
    if (!isNew) return
    supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setOrder((data?.[0]?.order_index ?? 0) + 1)
      })
  }, [isNew, courseId])

  const saveLesson = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const { error } = await supabase.from('lessons').insert({
          course_id: courseId,
          title,
          content,
          order_index: order,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('lessons').update({ title, content, order_index: order }).eq('id', lessonId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editor-lessons', courseId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      if (isNew) navigate(`${base}/${courseId}`, { replace: true })
    },
    onError: () => toast.error("Impossible d'enregistrer la leçon. Réessayez."),
  })

  function insertVideo() {
    const id = extractVideoId(ytInput)
    if (!id) return
    const embed = `\n<div class="video-embed">\n  <iframe src="https://www.youtube-nocookie.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>\n</div>\n`
    insertWrap(taRef, setContent, embed)
    setYtInput('')
    setShowYt(false)
  }

  if (!isNew && isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Retour */}
      <Link
        to={`${base}/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour au cours
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">
        {isNew ? 'Nouvelle leçon' : 'Modifier la leçon'}
      </h1>

      {/* Métadonnées */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-4 grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor={titleId} className="block text-xs font-semibold text-foreground mb-1.5">Titre de la leçon *</label>
          <input
            id={titleId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex : Les bases du clavier"
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
          />
        </div>
        <div>
          <label htmlFor={orderId} className="block text-xs font-semibold text-foreground mb-1.5">Ordre</label>
          <input
            id={orderId}
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min={1}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:bg-card transition-colors"
          />
        </div>
      </div>

      {/* Éditeur de contenu */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
        {/* Tabs + toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border gap-2 flex-wrap">
          {/* Tabs */}
          <div className="flex gap-1">
            {[{ id: 'edit', label: 'Éditer' }, { id: 'preview', label: 'Aperçu', icon: Eye }].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {id === 'preview' && <Eye className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>

          {/* Toolbar formatage */}
          {tab === 'edit' && (
            <div className="flex items-center gap-0.5 flex-wrap">
              {TOOL_GROUPS.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5">
                  {gi > 0 && <span className="w-px h-5 bg-border mx-1" />}
                  {group.map(({ Icon, title: t, before, after }) => (
                    <button
                      key={t}
                      type="button"
                      title={t}
                      aria-label={t}
                      onClick={() => insertWrap(taRef, setContent, before, after)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ))}

              {/* Séparateur */}
              <span className="w-px h-5 bg-border mx-1" />

              {/* Bouton Lien */}
              <button
                type="button"
                title="Insérer un lien"
                aria-label="Insérer un lien"
                onClick={() => insertLink(taRef, setContent)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {/* Séparateur */}
              <span className="w-px h-5 bg-border mx-1" />

              {/* Bouton YouTube */}
              <button
                type="button"
                title="Insérer une vidéo YouTube"
                aria-label="Insérer une vidéo YouTube"
                aria-pressed={showYt}
                onClick={() => setShowYt((v) => !v)}
                className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors text-xs font-medium ${
                  showYt ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-muted-foreground hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Video className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Vidéo</span>
              </button>
            </div>
          )}
        </div>

        {/* YouTube helper */}
        {tab === 'edit' && showYt && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border-b border-red-500/10">
            <Video className="w-4 h-4 text-red-400 shrink-0" />
            <input
              type="text"
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertVideo()}
              placeholder="Collez l'URL YouTube ici (ex: https://www.youtube.com/watch?v=...)"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={insertVideo}
              disabled={!ytInput.trim()}
              className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-40 shrink-0"
            >
              Insérer
            </button>
          </div>
        )}

        {/* Zone d'édition */}
        {tab === 'edit' ? (
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<h2>Introduction</h2>&#10;<p>Contenu de la leçon en HTML…</p>"
            rows={20}
            spellCheck={false}
            className="w-full bg-transparent px-5 py-4 text-sm text-foreground font-mono focus:outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
          />
        ) : (
          <div
            className="px-5 sm:px-8 py-6 lesson-content prose prose-sm sm:prose max-w-none
              prose-headings:text-foreground prose-headings:font-bold
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-strong:text-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(content) || '<p class="text-muted-foreground italic">Aucun contenu à prévisualiser.</p>' }}
          />
        )}
      </div>

      {/* Sauvegarde */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => saveLesson.mutate()}
          disabled={!title.trim()}
          loading={saveLesson.isPending}
        >
          {!saveLesson.isPending && <Save className="w-4 h-4" aria-hidden="true" />}
          {saveLesson.isPending ? 'Enregistrement…' : saved ? '✓ Enregistrée !' : 'Enregistrer la leçon'}
        </Button>
        {saveLesson.isError && (
          <p className="text-xs text-destructive">Erreur : {saveLesson.error?.message}</p>
        )}
      </div>
    </div>
  )
}
