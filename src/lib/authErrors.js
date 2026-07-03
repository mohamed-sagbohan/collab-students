// Traduit les erreurs Supabase Auth les plus courantes en messages clairs en français.
export function translateAuthError(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  const msg = error?.message?.toLowerCase() ?? ''

  if (msg.includes('rate limit')) {
    return "Trop de tentatives d'envoi d'email en peu de temps. Merci de patienter quelques minutes avant de réessayer."
  }
  if (msg.includes('email not confirmed')) {
    return "Votre adresse email n'a pas encore été confirmée. Vérifiez votre boîte de réception."
  }
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return 'Un compte existe déjà avec cette adresse email.'
  }
  if (msg.includes('email address') && msg.includes('invalid')) {
    return "Cette adresse email est invalide ou ne peut pas recevoir d'emails."
  }
  if (msg.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect.'
  }

  return error?.message || fallback
}
