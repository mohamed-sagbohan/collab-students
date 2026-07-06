// Helvetica (police par défaut de jsPDF) ne supporte pas les accents, ni les symboles
// hors WinAnsi (flèches, pictogrammes, emoji) → on les retire pour éviter un rendu cassé.
function normalize(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[←-⇿∀-⋿⌀-➿\u{1F000}-\u{1FFFF}]/gu, '')
}

const MARGIN = 20
const LINE_HEIGHT = 6
const HEADING_LINE_HEIGHT = 6
const BADGE_RADIUS = 3.4
const GOLD = [214, 155, 60]
const GOLD_DARK = [150, 95, 20]
const BOX_FILL = [250, 246, 237]
const BOX_BORDER = [232, 221, 196]

function layoutSection(doc, section, contentWidth) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  const headingLines = doc.splitTextToSize(normalize(section.heading), contentWidth - 18)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  const items = (section.items ?? []).map((item) => doc.splitTextToSize(normalize(item), contentWidth - 20))

  const headingHeight = Math.max(headingLines.length * HEADING_LINE_HEIGHT, BADGE_RADIUS * 2 + 2)
  const itemsHeight = items.reduce((sum, lines) => sum + lines.length * LINE_HEIGHT + 2.2, 0)

  return { headingLines, items, headingHeight, height: headingHeight + 4 + itemsHeight + 10 }
}

export async function downloadFiche({ courseTitle, ficheContent }) {
  // jsPDF (~150 Ko gzip) n'est téléchargé qu'au premier clic.
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const contentWidth = W - MARGIN * 2
  let y = MARGIN

  function ensureSpace(neededHeight) {
    if (y + neededHeight > H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  // ── En-tête ──────────────────────────────────────────────────
  doc.setFillColor(13, 15, 23)
  doc.rect(0, 0, W, 24, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, 24, W, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...GOLD)
  doc.text(normalize('LEARNIT'), MARGIN, 15, { charSpace: 1.5 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(200, 200, 210)
  doc.text(normalize('Fiche memo a conserver'), W - MARGIN, 15, { align: 'right' })

  y = 34

  // ── Titre du cours ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(19)
  doc.setTextColor(20, 20, 30)
  const titleLines = doc.splitTextToSize(normalize(courseTitle), contentWidth)
  doc.text(titleLines, MARGIN, y)
  y += titleLines.length * 8.5 + 2

  if (ficheContent?.subtitle) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(110, 110, 120)
    const subLines = doc.splitTextToSize(normalize(ficheContent.subtitle), contentWidth)
    doc.text(subLines, MARGIN, y)
    y += subLines.length * 5 + 5
  }

  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, y, W - MARGIN, y)
  y += 10

  // ── Sections ─────────────────────────────────────────────────
  const sections = ficheContent?.sections ?? []
  sections.forEach((section, sIdx) => {
    const { headingLines, items, headingHeight, height } = layoutSection(doc, section, contentWidth)
    ensureSpace(height + 6)
    const boxTop = y

    // Boîte de fond + liseré doré
    doc.setFillColor(...BOX_FILL)
    doc.setDrawColor(...BOX_BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(MARGIN - 4, boxTop - 5, contentWidth + 8, height, 3, 3, 'FD')
    doc.setFillColor(...GOLD)
    doc.rect(MARGIN - 4, boxTop - 5, 1.6, height, 'F')

    let cy = boxTop + 2

    // Numéro de section (pastille)
    doc.setFillColor(...GOLD)
    doc.circle(MARGIN + 3.2, cy + 1, BADGE_RADIUS, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(String(sIdx + 1), MARGIN + 3.2, cy + 2.3, { align: 'center' })

    // Titre de section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12.5)
    doc.setTextColor(...GOLD_DARK)
    doc.text(headingLines, MARGIN + 10, cy + 2.3)
    cy += headingHeight + 4

    // Puces
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(45, 42, 38)
    for (const lines of items) {
      doc.setFillColor(...GOLD)
      doc.circle(MARGIN + 6, cy - 1.3, 0.9, 'F')
      doc.text(lines, MARGIN + 10, cy)
      cy += lines.length * LINE_HEIGHT + 2.2
    }

    y = boxTop + height + 6
  })

  // ── Pied de page (numérotation) ──────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(...BOX_BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, H - 16, W - MARGIN, H - 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 160)
    doc.text('LearnIT', MARGIN, H - 10)
    doc.text(`Page ${i}/${pageCount}`, W - MARGIN, H - 10, { align: 'right' })
  }

  const fileName = `fiche-${normalize(courseTitle).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.pdf`
  doc.save(fileName)
}
