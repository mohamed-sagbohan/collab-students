import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Champ de saisie standard — la même chaîne de classes était recopiée
 * dans chaque page d'auth. h-11 (44px) : cible tactile confortable.
 */
export const inputClasses =
  'w-full h-11 px-4 border border-input rounded-xl text-sm bg-muted text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all'

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return <input ref={ref} type={type} className={cn(inputClasses, className)} {...props} />
})
