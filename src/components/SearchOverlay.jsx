import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { Dialog } from './ui/Dialog'
import SearchBar from './SearchBar'

/**
 * Recherche plein écran pour mobile (ouverte depuis la bottom nav).
 * Se ferme automatiquement dès qu'on navigue vers un résultat.
 */
export default function SearchOverlay({ open, onClose }) {
  const location = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Rechercher un cours ou une leçon"
      className="self-start mt-16 max-w-lg"
    >
      <div className="[&>div]:max-w-none">
        <SearchBar />
      </div>
    </Dialog>
  )
}
