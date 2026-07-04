import { useEffect, useRef, useState } from 'react'

// Anime un bloc en fondu + léger glissement dès qu'il entre dans le viewport.
// Si l'utilisateur préfère réduire les animations, le contenu est visible
// immédiatement (pas d'observer, pas de départ en opacity-0).
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [visible, setVisible] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  if (reduced) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag
      ref={ref}
      style={visible ? { animationDelay: `${delay}ms`, animationFillMode: 'backwards' } : undefined}
      className={`${visible ? 'animate-in fade-in slide-in-from-bottom-4 duration-700' : 'opacity-0'} ${className}`}
    >
      {children}
    </Tag>
  )
}
