import { pdfSafe } from './pdfText.js'
import { PREFILLED, columnWeights, parseTemplate } from './docTemplate.js'

// A4 PDF for an admin document, in the Vikku Labs template layout. Pure, so it can be rendered in Node
// for checks. Built-in Helvetica has no ₹, so pdfSafe prints amounts as "INR 1,00,000".
const ORANGE = [234, 88, 12], INK = [15, 23, 42], MUTED = [100, 116, 139], TINT = [255, 247, 237], LINE = [226, 232, 240]
const M = 50, TOP = 92, BOTTOM = 52, BLANK = 96

export function templatePdf(jsPDF, { heading, body, fields = {} }, logo) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight(), CW = W - 2 * M
  let y = TOP
  const font = (bold, size) => pdf.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size)
  const newPage = () => { pdf.addPage(); y = TOP }

  // Flattens text, filled blanks, empty blanks and boxes into words the wrapper can place.
  const words = (segments) => segments.flatMap(s => {
    if (s.box) return [{ box: !!fields[s.box] }]
    if (s.field) {
      const v = pdfSafe(fields[s.field]).trim()
      return v ? v.split(/(\s+)/).filter(Boolean).map(t => ({ t, bold: s.bold })) : [{ blank: true }]
    }
    return pdfSafe(s.text).split(/(\s+)/).filter(Boolean).map(t => ({ t, bold: s.bold }))
  })

  const wrap = (segments, width, size) => {
    const lines = []
    let cur = [], x = 0
    const flush = () => { lines.push(cur); cur = []; x = 0 }
    for (const w of words(segments)) {
      if ('box' in w) { cur.push({ ...w, x }); x += 16; continue }
      if (w.blank) {
        if (width - x < 30 && cur.length) flush()
        const bw = Math.min(BLANK, width - x)
        cur.push({ ...w, x, w: bw }); x += bw + 3; continue
      }
      font(w.bold, size)
      const ww = pdf.getTextWidth(w.t)
      if (!w.t.trim()) { if (cur.length) x += ww; continue }
      if (x + ww > width && cur.length) flush()
      cur.push({ ...w, x }); x += ww
    }
    if (cur.length || !lines.length) flush()
    return lines
  }

  const drawLine = (line, x, base, size) => {
    for (const it of line) {
      if ('box' in it) {
        pdf.setDrawColor(...MUTED).setLineWidth(0.75).rect(x + it.x, base - 8.5, 10, 10)
        if (it.box) { pdf.setDrawColor(...INK).setLineWidth(1.2).line(x + it.x + 2, base - 3, x + it.x + 4.5, base - 0.5).line(x + it.x + 4.5, base - 0.5, x + it.x + 8.5, base - 6.5) }
      } else if (it.blank) {
        pdf.setDrawColor(...MUTED).setLineWidth(0.5).line(x + it.x, base + 1.5, x + it.x + it.w, base + 1.5)
      } else {
        font(it.bold, size); pdf.setTextColor(...INK).text(it.t, x + it.x, base)
      }
    }
  }

  const para = (segments, { size = 10, leading = 14.5, indent = 0, marker, after = 5 } = {}) => {
    wrap(segments, CW - indent, size).forEach((line, i) => {
      if (y + leading > H - BOTTOM) newPage()
      if (i === 0 && marker) { font(false, size); pdf.setTextColor(...MUTED).text(marker, M + indent - 18, y + 11) }
      drawLine(line, M + indent, y + 11, size)
      y += leading
    })
    y += after
  }

  const table = (b) => {
    const size = 9, pad = 5, leading = 13
    // Repeating rows left empty are dropped, unless the whole table is empty and meant for filling by hand.
    const used = b.rows.filter(r => !r.repeats || r.cells.flat().some(s => s.field && fields[s.field] && !PREFILLED.has(fields[s.field])))
    const rows = used.length ? used : b.rows
    const weights = columnWeights(b, fields)
    const total = weights.reduce((a, c) => a + c, 0)
    const widths = weights.map(c => CW * c / total)
    const signature = (r) => r.cells.flat().some(s => s.text === 'Signature:')

    const drawRow = (cells, header, minH) => {
      if (header) font(true, size)
      const wrapped = header ? null : cells.map((c, i) => wrap(c, widths[i] - 2 * pad, size))
      const headLines = header ? b.header.map((h, i) => pdf.splitTextToSize(pdfSafe(h), widths[i] - 2 * pad)) : null
      const h = Math.max(minH, ...(header ? headLines : wrapped).map(l => l.length * leading), leading) + 2 * pad
      if (y + h > H - BOTTOM) { newPage(); if (!header) drawRow(null, true, 0) }
      let x = M
      if (header) pdf.setFillColor(...TINT).rect(M, y, CW, h, 'F')
      pdf.setDrawColor(...LINE).setLineWidth(0.6)
      widths.forEach((w, i) => {
        pdf.rect(x, y, w, h)
        if (header) { font(true, size); pdf.setTextColor(...INK).text(headLines[i], x + pad, y + pad + 9) }
        else wrapped[i].forEach((line, j) => drawLine(line, x + pad, y + pad + 9 + j * leading, size))
        x += w
      })
      y += h
    }
    if (y + 70 > H - BOTTOM) newPage()
    drawRow(null, true, 0)
    rows.forEach(r => drawRow(r.cells, false, signature(r) ? 36 : 0))
    y += 10
  }

  font(true, 19); pdf.setTextColor(...INK).text(pdfSafe(heading), M, y + 20)
  y += 36
  for (const b of parseTemplate(body)) {
    if (b.type === 'page') newPage()
    else if (b.type === 'heading') {
      if (y + 90 > H - BOTTOM) newPage()
      y += 8; font(true, 12); pdf.setTextColor(...ORANGE).text(pdfSafe(b.text), M, y + 12); y += 21
    } else if (b.type === 'table') table(b)
    else if (b.type === 'check') para([{ box: b.box }, ...b.segments], { after: 3 })
    else if (b.type === 'item') para(b.segments, { indent: 18, marker: b.marker, after: b.marker === '•' ? 3 : 4 })
    else para(b.segments)
  }

  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    if (logo) pdf.addImage(logo, 'PNG', M, 42, 28, 28)
    font(true, 14); pdf.setTextColor(...INK).text('Vikku Labs', M + 36, 62)
    font(false, 8); pdf.setTextColor(...MUTED)
    pdf.text('www.vikku.in  ·  connect@vikku.in', W - M, 52, { align: 'right' })
    pdf.text('+91 93939 79892  ·  Hyderabad, Telangana', W - M, 63, { align: 'right' })
    pdf.setDrawColor(...ORANGE).setLineWidth(1.5).line(M, 78, W - M, 78)
    pdf.setTextColor(...MUTED).text(pdfSafe(heading), M, H - 30)
    pdf.text(`Page ${i} of ${pages}`, W - M, H - 30, { align: 'right' })
  }
  return pdf
}

export async function downloadTemplatePdf({ title, ...doc }, logo) {
  const { jsPDF } = await import('jspdf')
  const name = title.replace(/[^\w -]+/g, '').trim().replace(/\s+/g, '-').replace(/-{2,}/g, '-') || 'document'
  templatePdf(jsPDF, doc, logo).save(`${name}.pdf`)
}
