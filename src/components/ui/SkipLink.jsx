/** Lien "Aller au contenu" pour la navigation clavier — invisible sauf au focus. */
export function SkipLink({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2.5 focus:rounded-xl focus:text-sm focus:font-semibold focus:shadow-lg"
    >
      Aller au contenu principal
    </a>
  )
}
