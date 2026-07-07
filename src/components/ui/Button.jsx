import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap active:scale-[0.98] motion-reduce:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-px motion-reduce:hover:translate-y-0',
        secondary: 'bg-card border border-border text-foreground hover:border-primary/40 hover:bg-muted transition-colors',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border text-foreground bg-transparent hover:bg-muted',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-9 w-9 p-0 shrink-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

/**
 * Bouton d'appli — variantes/tailles via CVA, état de chargement intégré
 * (désactive le bouton et annonce aria-busy sans changer sa taille).
 */
export const Button = forwardRef(function Button(
  { className, variant, size, loading = false, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  )
})
