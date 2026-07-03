import DOMPurify from 'dompurify'

// Le contenu des leçons autorise les balises de mise en forme de base
// utilisées par LessonEditor, plus l'iframe YouTube généré par le bouton "Vidéo".
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = node.getAttribute('src') || ''
    if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\//.test(src)) {
      node.remove()
    }
  }
})

// Tout lien ouvert dans un nouvel onglet doit avoir rel="noopener noreferrer"
// (protection contre le reverse tabnabbing), même si tapé à la main en HTML brut.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'code', 'pre',
    'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote',
    'div', 'span', 'iframe',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class',
    'target', 'rel',
    'frameborder', 'allow', 'allowfullscreen', 'loading',
  ],
}

export function sanitizeLessonHtml(html) {
  return DOMPurify.sanitize(html ?? '', CONFIG)
}
