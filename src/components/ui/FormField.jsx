import { useId } from 'react'

/**
 * Associe correctement un <label> à son champ via htmlFor/id (indispensable
 * pour les lecteurs d'écran) et affiche l'erreur avec role="alert" pour
 * qu'elle soit annoncée dès son apparition. Le champ est fourni via une
 * render prop pour rester libre sur le type d'input (text, textarea...).
 *
 * <FormField label="Email" error={error}>
 *   {(id) => <input id={id} type="email" ... />}
 * </FormField>
 */
export function FormField({ label, error, hint, required, className, children }) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>

      {children(id, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground mt-1.5">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive mt-1.5">{error}</p>
      )}
    </div>
  )
}
