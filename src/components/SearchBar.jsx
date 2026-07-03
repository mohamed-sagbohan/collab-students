import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Search, BookOpen, FileText, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 280)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Fermer si clic extérieur
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Recherche
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults(null); return }

    setLoading(true)
    const term = `%${debouncedQuery.trim()}%`

    Promise.all([
      supabase
        .from('courses')
        .select('id, title, description')
        .or(`title.ilike.${term},description.ilike.${term}`)
        .eq('published', true)
        .limit(4),
      supabase
        .from('lessons')
        .select('id, title, course_id, courses:course_id(title)')
        .ilike('title', term)
        .limit(5),
    ]).then(([{ data: courses }, { data: lessons }]) => {
      setResults({ courses: courses ?? [], lessons: lessons ?? [] })
      setLoading(false)
    })
  }, [debouncedQuery])

  const go = useCallback((path) => {
    setOpen(false)
    setQuery('')
    setResults(null)
    navigate(path)
  }, [navigate])

  const hasResults = results && (results.courses.length > 0 || results.lessons.length > 0)
  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un cours, une leçon…"
          className="w-full h-8 pl-8 pr-7 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-background transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-150 absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-xs text-muted-foreground">Recherche…</div>
          )}

          {!loading && !hasResults && (
            <div className="px-4 py-5 text-center">
              <p className="text-xs font-medium text-foreground mb-0.5">Aucun résultat</p>
              <p className="text-xs text-muted-foreground">Essayez un autre mot-clé.</p>
            </div>
          )}

          {!loading && hasResults && (
            <>
              {results.courses.length > 0 && (
                <div>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Cours
                  </p>
                  {results.courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go(`/cours/${c.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
                        {c.description && (
                          <p className="text-[10px] text-muted-foreground truncate">{c.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.lessons.length > 0 && (
                <div className={results.courses.length > 0 ? 'border-t border-border' : ''}>
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Leçons
                  </p>
                  {results.lessons.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => go(`/cours/${l.course_id}/lecons/${l.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors text-left"
                    >
                      <div className="w-7 h-7 bg-muted border border-border rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{l.title}</p>
                        {l.courses?.title && (
                          <p className="text-[10px] text-muted-foreground truncate">{l.courses.title}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
