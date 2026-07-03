import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'system')

  useEffect(() => {
    const root = document.documentElement

    const apply = (dark) => root.classList.toggle('dark', dark)

    localStorage.setItem('theme', theme)

    if (theme === 'dark') { apply(true); return }
    if (theme === 'light') { apply(false); return }

    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches)
    const handler = (e) => apply(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme doit être dans ThemeProvider')
  return ctx
}
