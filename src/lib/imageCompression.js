/**
 * Recompression d'une image côté client avant upload : redimensionne à
 * 1600 px max et convertit en WebP (qualité 0,82). Divise généralement le
 * poids par 5 à 15 sans perte visible — économise stockage et bande
 * passante à l'échelle.
 *
 * Toujours SANS risque : les GIF (animations perdues au canvas) et tout
 * échec (format exotique, vieux navigateur) renvoient le fichier original
 * inchangé — l'envoi fonctionne comme avant.
 */

const MAX_DIMENSION = 1600
const WEBP_QUALITY = 0.82

export async function compressImage(file) {
  if (file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
    // On ne garde la version compressée que si elle fait vraiment gagner du poids.
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file

    return new File([blob], file.name.replace(/\.\w+$/i, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}
