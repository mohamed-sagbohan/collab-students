/** Rend son contenu accessible aux lecteurs d'écran sans l'afficher visuellement. */
export function VisuallyHidden({ as: Tag = 'span', children, ...props }) {
  return (
    <Tag className="sr-only" {...props}>
      {children}
    </Tag>
  )
}
