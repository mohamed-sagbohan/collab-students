import { useEffect, useRef, useState } from 'react'

// Anime un bloc en fondu + léger glissement dès qu'il entre dans le viewport.
export default function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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
  }, [])

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
