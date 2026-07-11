import { useRouteError, isRouteErrorResponse } from 'react-router'
import { RefreshCw, Home, Compass } from 'lucide-react'
import { Button, buttonVariants } from './ui/Button'
import { cn } from '@/lib/utils'

/**
 * Écran d'erreur du routeur — remplace la page par défaut de react-router
 * (« Unexpected Application Error! » + stack trace brute) par un écran
 * propre et actionnable. Couvre aussi bien une erreur d'exécution
 * inattendue (recharger règle la quasi-totalité des cas : chunk périmé
 * après un déploiement, erreur transitoire d'un effet) qu'une URL
 * inconnue (404 du routeur).
 *
 * Volontairement autonome (pas de layout, pas de chargement paresseux) :
 * cette page doit pouvoir s'afficher même quand le reste a échoué.
 */
export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center animate-in fade-in duration-300">
        <div className="mx-auto w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
          {notFound
            ? <Compass className="w-7 h-7 text-primary" aria-hidden="true" />
            : <RefreshCw className="w-7 h-7 text-primary" aria-hidden="true" />}
        </div>

        <h1 className="mt-5 text-xl font-bold text-foreground">
          {notFound ? 'Page introuvable' : 'Une erreur est survenue'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Cette page n’existe pas ou a été déplacée.'
            : 'Un petit imprévu technique. Recharger la page suffit presque toujours à tout remettre en ordre.'}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!notFound && (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Recharger la page
            </Button>
          )}
          {/* <a> plutôt que <Link> pour l'accueil : après un crash, l'état
              du routeur n'est plus fiable — navigation pleine page. */}
          <a href="/" className={cn(buttonVariants({ variant: notFound ? 'primary' : 'secondary' }))}>
            <Home className="w-4 h-4" aria-hidden="true" />
            Retour à l’accueil
          </a>
        </div>

        {!notFound && !!error?.message && (
          <details className="mt-8 text-left">
            <summary className="text-xs text-muted-foreground cursor-pointer select-none">
              Détails techniques (pour le support)
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
              {String(error.message)}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
