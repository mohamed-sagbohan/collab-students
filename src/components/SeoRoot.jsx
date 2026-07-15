import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

const SITE_URL = 'https://collab-students.vercel.app'
const DEFAULT_TITLE = "LearnIT — Apprenez l'informatique à votre rythme"

// Seules pages destinées à l'index Google. Tout le reste passe en noindex
// et perd sa balise canonical : sans ça, chaque route (login, dashboard…)
// sert le index.html statique avec canonical pointant vers « / », et Google
// peut choisir d'afficher /login à la place de l'accueil.
const INDEXABLE = {
  '/': DEFAULT_TITLE,
  '/guide': "Guide d'utilisation — LearnIT",
}

export default function SeoRoot() {
  const { pathname } = useLocation()

  useEffect(() => {
    const indexable = Object.prototype.hasOwnProperty.call(INDEXABLE, pathname)
    document.title = INDEXABLE[pathname] ?? DEFAULT_TITLE

    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute('content', indexable ? 'index, follow' : 'noindex')

    let canonical = document.querySelector('link[rel="canonical"]')
    if (indexable) {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', `${SITE_URL}${pathname}`)
    } else {
      canonical?.remove()
    }
  }, [pathname])

  return <Outlet />
}
