import { jsPDF } from 'jspdf'

// Helvetica (police par défaut de jsPDF) ne supporte pas les accents → on les retire
function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function downloadCertificate({ studentName, courseTitle, completedAt }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const W = doc.internal.pageSize.getWidth()   // 297mm
  const H = doc.internal.pageSize.getHeight()  // 210mm
  const cx = W / 2

  // ── Fond ────────────────────────────────────────────────────────
  doc.setFillColor(13, 15, 23)   // navy sombre
  doc.rect(0, 0, W, H, 'F')

  // ── Bordure dorée double ─────────────────────────────────────────
  doc.setDrawColor(214, 155, 60)
  doc.setLineWidth(1.2)
  doc.rect(10, 10, W - 20, H - 20)
  doc.setLineWidth(0.4)
  doc.rect(13, 13, W - 26, H - 26)

  // ── Coins décoratifs ─────────────────────────────────────────────
  const cornerSize = 10
  const corners = [
    [10, 10], [W - 10, 10], [10, H - 10], [W - 10, H - 10],
  ]
  doc.setFillColor(214, 155, 60)
  corners.forEach(([x, y]) => {
    doc.circle(x, y, 2, 'F')
  })

  // ── Ligne décorative centrale ────────────────────────────────────
  doc.setDrawColor(214, 155, 60)
  doc.setLineWidth(0.3)
  doc.line(30, 50, W - 30, 50)
  doc.line(30, H - 50, W - 30, H - 50)

  // ── En-tête ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(214, 155, 60)
  doc.text(normalize('L E A R N I T'), cx, 30, { align: 'center', charSpace: 4 })

  doc.setFontSize(9)
  doc.setTextColor(160, 160, 180)
  doc.setFont('helvetica', 'normal')
  doc.text('Plateforme d\'initiation a l\'informatique', cx, 38, { align: 'center' })

  // ── Titre principal ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('CERTIFICAT DE REUSSITE', cx, 70, { align: 'center', charSpace: 1.5 })

  // ── Sous-titre ───────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(160, 160, 180)
  doc.text('Ce certificat est decerne a', cx, 85, { align: 'center' })

  // ── Nom de l'apprenant ───────────────────────────────────────────
  const normalizedName = normalize(studentName)
  doc.setFont('helvetica', 'bolditalic')
  doc.setFontSize(30)
  doc.setTextColor(214, 155, 60)
  doc.text(normalizedName, cx, 105, { align: 'center' })

  // Ligne sous le nom
  const nameWidth = doc.getTextWidth(normalizedName)
  doc.setDrawColor(214, 155, 60)
  doc.setLineWidth(0.5)
  doc.line(cx - nameWidth / 2, 108, cx + nameWidth / 2, 108)

  // ── Description cours ────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(160, 160, 180)
  doc.text('pour avoir complete avec succes le cours', cx, 120, { align: 'center' })

  // ── Titre du cours ───────────────────────────────────────────────
  const normalizedCourse = normalize(courseTitle)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text(normalizedCourse, cx, 133, { align: 'center' })

  // ── Date ─────────────────────────────────────────────────────────
  const dateStr = new Date(completedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(160, 160, 180)
  doc.text(`Delivre le ${dateStr}`, cx, 148, { align: 'center' })

  // ── Pied de page ─────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 120)
  doc.text('LearnIT — learnit.app', cx, H - 20, { align: 'center' })

  // ── Sauvegarde ───────────────────────────────────────────────────
  const fileName = `certificat-${normalize(courseTitle).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.pdf`
  doc.save(fileName)
}
