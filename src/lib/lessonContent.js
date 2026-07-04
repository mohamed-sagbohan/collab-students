// Helpers purs pour le contenu HTML des leçons.
// Toujours appelés APRÈS sanitizeLessonHtml — aucun accès réseau ici.

function slugify(text) {
  const slug = (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents (diacritiques combinants)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
  return slug || 'section'
}

/** Ajoute un id unique à chaque h2/h3 (ancres du sommaire). */
export function injectHeadingIds(html) {
  if (!html) return html
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const seen = new Set()
    doc.body.querySelectorAll('h2, h3').forEach((h) => {
      const base = slugify(h.textContent)
      let id = base
      let i = 2
      while (seen.has(id)) id = `${base}-${i++}`
      seen.add(id)
      h.id = id
    })
    return doc.body.innerHTML
  } catch {
    return html
  }
}

/** Liste des titres [{ id, text, level }] — à appeler sur le HTML déjà passé par injectHeadingIds. */
export function extractHeadings(html) {
  if (!html) return []
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return [...doc.body.querySelectorAll('h2, h3')].map((h) => ({
      id: h.id,
      text: h.textContent,
      level: h.tagName === 'H2' ? 2 : 3,
    }))
  } catch {
    return []
  }
}

/** Nombre de mots du texte visible. */
export function countWords(html) {
  if (!html) return 0
  return html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/** Temps de lecture estimé en minutes (~180 mots/min, public débutant). */
export function readingTimeMinutes(html) {
  return Math.max(1, Math.ceil(countWords(html) / 180))
}
